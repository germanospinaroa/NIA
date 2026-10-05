import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildBrief } from '@/lib/server/intervention';
import { resolveIntervention } from '@/lib/server/intervention';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { localDate } from '@/lib/server/whatsapp-schedule';
import { claimDelivery, sendClaimedDelivery } from '@/lib/server/whatsapp-daily';
import { loadEditorialMemory } from '@/lib/server/editorial-memory';
import { recordAdminAudit, recordExecutionStage, startQaExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import type { InterventionResult } from '@/lib/intervention-engine';

export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function qaSlot(executionId: string) { return `qa:${executionId}`; }

type QaStageStatus = 'PASS' | 'FAIL' | 'NOT REACHED' | 'SENT' | 'NOT SENT' | 'UNKNOWN';
type QaStage = { stage: string; status: QaStageStatus; evidence: string[] };

async function candidateSummariesForExecution(admin: ReturnType<typeof createAdminClient>, executionId: string, userId: string) {
  const { data } = await admin.from('intervention_candidates').select('id,topic,concept,angle,intervention_type,depth,blocks,candidate_text,audit_results,rejection_reason,editorial_signature').eq('user_id', userId).eq('execution_context', 'qa').order('created_at', { ascending: true }).limit(100);
  return (data ?? []).filter(candidate => {
    const signature = candidate.editorial_signature && typeof candidate.editorial_signature === 'object' ? candidate.editorial_signature as Record<string, unknown> : {};
    return signature.executionRunId === executionId;
  }).map(candidate => ({
    id: candidate.id,
    topic: candidate.topic,
    concept: candidate.concept,
    angle: candidate.angle,
    intervention_type: candidate.intervention_type,
    depth: candidate.depth,
    blocks: Array.isArray(candidate.blocks) ? candidate.blocks.length : null,
    candidate_text: candidate.candidate_text,
    length: typeof candidate.candidate_text === 'string' ? candidate.candidate_text.length : 0,
    validation: candidate.rejection_reason ? 'rejected' : 'approved',
    audit_approved: candidate.audit_results?.approved === true,
    rejection_reason: candidate.rejection_reason,
  }));
}

async function qaTrace(admin: ReturnType<typeof createAdminClient>, executionId: string, userId: string) {
  const { data: execution } = await admin.from('execution_runs').select('id,status,failure_code,failure_message,stage_results,candidate_count,intervention_id,started_at,completed_at').eq('id', executionId).eq('user_id', userId).maybeSingle();
  const [{ data: events }, { data: attempts }, { data: providerCalls }, { data: interactions }, { data: deliveries }, candidateSummaries] = await Promise.all([
    admin.from('event_log').select('event_type,occurred_at,metadata').eq('execution_run_id', executionId).order('occurred_at', { ascending: true }),
    admin.from('generation_attempts').select('status,candidate_count,approved_candidate_count,rejection_count,provider,model,error_code,error_message').eq('execution_run_id', executionId).order('created_at', { ascending: true }),
    admin.from('execution_provider_calls').select('operation,status,provider,model,error_code,error_message').eq('execution_run_id', executionId).order('created_at', { ascending: true }),
    admin.from('interactions').select('id').eq('user_id', userId).eq('slot', qaSlot(executionId)).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id,status,provider_message_id,last_error').eq('user_id', userId).eq('slot', qaSlot(executionId)).maybeSingle(),
    candidateSummariesForExecution(admin, executionId, userId),
  ]);
  const stageResults = execution?.stage_results && typeof execution.stage_results === 'object' ? execution.stage_results as Record<string, unknown> : {};
  const generationCall = (providerCalls ?? []).filter(row => row.operation === 'generation');
  const generationAttempt = attempts?.[0];
  const evaluated = candidateSummaries.length || generationAttempt?.candidate_count || 0;
  const approved = candidateSummaries.filter(row => row.audit_approved && !row.rejection_reason).length || generationAttempt?.approved_candidate_count || 0;
  const rejectionReasons = [...new Set(candidateSummaries.flatMap(row => {
    const audit = row.rejection_reason ? { reasons: row.rejection_reason.split(',') } : {};
    const reasons = Array.isArray(audit.reasons) ? audit.reasons : [];
    return reasons.filter((reason): reason is string => typeof reason === 'string');
  }))];
  const providerEvidence = (rows: NonNullable<typeof providerCalls>) => rows.length ? rows.map(row => `${row.operation}: ${row.status}${row.model ? ` (${row.model})` : ''}${row.error_code ? ` · ${row.error_code}` : ''}${row.error_message ? ` · ${row.error_message}` : ''}`) : [];
  const hasEvent = (eventType: string) => (events ?? []).some(row => row.event_type === eventType);
  const stage = (name: string, status: QaStageStatus, evidence: string[] = []) => ({ stage: name, status, evidence });
  const psychologicalStage = stageResults.psychological_contract && typeof stageResults.psychological_contract === 'object' ? stageResults.psychological_contract as Record<string, unknown> : null;
  const stages: QaStage[] = [
    stage('Execution run', execution ? 'PASS' : 'FAIL', execution ? [`status=${execution.status}`, `execution_id=${execution.id}`] : []),
    stage('Brief', stageResults.brief ? 'PASS' : hasEvent('generation_started') ? 'PASS' : 'NOT REACHED', stageResults.brief ? ['recorded'] : hasEvent('generation_started') ? ['generation_started confirms brief completed'] : []),
    stage('Editorial memory', stageResults.editorial_memory ? 'PASS' : hasEvent('generation_started') ? 'PASS' : 'NOT REACHED', stageResults.editorial_memory ? ['recorded'] : hasEvent('generation_started') ? ['generation_started confirms memory stage completed'] : []),
    stage('Planner', stageResults.planner ? 'PASS' : hasEvent('generation_started') ? 'PASS' : 'NOT REACHED', stageResults.planner ? ['recorded'] : hasEvent('generation_started') ? ['generation_started confirms planner completed'] : []),
    stage('Psychological contract', psychologicalStage ? (psychologicalStage.sufficient === false ? 'FAIL' : 'PASS') : 'NOT REACHED', psychologicalStage ? [`sufficient=${String(psychologicalStage.sufficient)}`, `mechanism=${String(psychologicalStage.mechanism_id ?? 'NOT AVAILABLE')}`] : []),
    stage('OpenAI', generationCall.some(row => row.status === 'success') ? 'PASS' : generationCall.length ? 'FAIL' : 'NOT REACHED', providerEvidence(generationCall)),
    stage('Candidates', evaluated > 0 ? 'PASS' : 'NOT REACHED', evaluated > 0 ? [`${evaluated} evaluated`] : []),
    stage('Gates', evaluated === 0 ? 'NOT REACHED' : approved > 0 ? 'PASS' : 'FAIL', evaluated > 0 ? [`${approved} approved`, `${Math.max(0, evaluated - approved)} rejected`, ...(rejectionReasons.length ? [`reasons=${rejectionReasons.join('|')}`] : [])] : []),
    stage('Intervention', execution?.intervention_id ? 'PASS' : 'NOT REACHED', execution?.intervention_id ? [`intervention_id=${execution.intervention_id}`] : []),
    stage('Composer', stageResults.composer ? 'PASS' : interactions ? 'PASS' : 'NOT REACHED', stageResults.composer ? ['recorded'] : interactions ? ['interaction exists after composer'] : []),
    stage('Interaction', interactions ? 'PASS' : 'NOT REACHED', interactions ? [`interaction_id=${interactions.id}`] : []),
    stage('Delivery', deliveries ? 'PASS' : 'NOT REACHED', deliveries ? [`delivery_id=${deliveries.id}`, `status=${deliveries.status}`] : []),
    stage('Sender', deliveries?.status === 'sent' ? 'PASS' : deliveries ? 'FAIL' : 'NOT REACHED', deliveries ? [`status=${deliveries.status}`] : []),
    stage('Evolution', deliveries?.status === 'sent' ? 'PASS' : deliveries ? 'FAIL' : 'NOT REACHED', deliveries?.status === 'sent' ? [`provider_message_id=${deliveries.provider_message_id ? 'present' : 'missing'}`] : deliveries?.last_error ? [String(deliveries.last_error)] : []),
    stage('WhatsApp', deliveries?.status === 'sent' ? 'SENT' : deliveries ? 'NOT SENT' : 'UNKNOWN', deliveries ? [`delivery_status=${deliveries.status}`] : []),
  ];
  const firstFailure = stages.find(item => item.status === 'FAIL');
  return { execution_id: executionId, status: execution?.status ?? 'unknown', failure_code: execution?.failure_code ?? null, error: generationAttempt?.error_message ?? execution?.failure_message ?? null, candidate_count: execution?.candidate_count ?? evaluated, intervention_id: execution?.intervention_id ?? null, candidate_summaries: candidateSummaries, failure_stage: firstFailure?.stage ?? null, stages, provider_calls: providerEvidence(providerCalls ?? []) };
}

function sanitizedGeneration(admin: ReturnType<typeof createAdminClient>, executionId: string) {
  return Promise.all([
    admin.from('generation_attempts').select('status,candidate_count,approved_candidate_count,rejection_count').eq('execution_run_id', executionId).order('created_at', { ascending: true }),
    admin.from('execution_provider_calls').select('operation,status').eq('execution_run_id', executionId),
  ]).then(([attempts, calls]) => {
    const rows = attempts.data ?? [];
    return {
      calls: calls.data?.filter(row => row.operation === 'generation' && row.status === 'success').length ?? 0,
      attempts: rows.length,
      candidates: rows.reduce((sum, row) => sum + Number(row.candidate_count ?? 0), 0),
      approved: rows.reduce((sum, row) => sum + Number(row.approved_candidate_count ?? 0), 0),
      rejected: rows.reduce((sum, row) => sum + Number(row.rejection_count ?? 0), 0),
    };
  });
}

async function existingResult(admin: ReturnType<typeof createAdminClient>, executionId: string, userId: string, date: string) {
  const slot = qaSlot(executionId);
  const { data: execution } = await admin.from('execution_runs').select('id,status,intervention_id').eq('id', executionId).eq('user_id', userId).maybeSingle();
  const [{ data: intervention }, { data: delivery }] = await Promise.all([
    admin.from('interventions').select('id,topic,intervention_type,depth,editorial_strategy').eq('id', execution?.intervention_id ?? '').maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id,status,provider_message_id').eq('user_id', userId).eq('local_date', date).eq('slot', slot).maybeSingle(),
  ]);
  const generation = await sanitizedGeneration(admin, executionId);
  return NextResponse.json({ status: 'already_processed', execution_run_id: execution?.id ?? executionId, generation, editorial: intervention ? { strategy: intervention.editorial_strategy, topic: intervention.topic, intervention_type: intervention.intervention_type, depth: intervention.depth } : null, intervention_id: execution?.intervention_id ?? intervention?.id ?? null, delivery_id: delivery?.id ?? null, evolution: { accepted: delivery?.status === 'sent', provider_message_id_present: Boolean(delivery?.provider_message_id) } });
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const keys = body && typeof body === 'object' ? Object.keys(body) : [];
  if (keys.some(key => key !== 'user_id') || keys.length !== 1 || typeof (body as { user_id?: unknown })?.user_id !== 'string' || !UUID.test((body as { user_id: string }).user_id)) {
    return NextResponse.json({ error: 'invalid_user_id' }, { status: 400 });
  }
  const userId = (body as { user_id: string }).user_id;
  const admin = createAdminClient();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'run_qa_daily_intervention', targetType: 'user', targetId: userId, metadata: { trigger: 'admin_qa' } });

  const [{ data: profile, error: profileError }, { data: connection, error: connectionError }] = await Promise.all([
    admin.from('profiles').select('id,first_name,direction_key,timezone,message_frequency,message_time_1,message_time_2,whatsapp_enabled').eq('id', userId).maybeSingle(),
    admin.from('whatsapp_connections').select('user_id,wa_id,status').eq('user_id', userId).eq('status', 'connected').maybeSingle(),
  ]);
  if (profileError || !profile) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  if (!profile.whatsapp_enabled || connectionError || !connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected' }, { status: 422 });

  const now = new Date();
  const date = localDate(profile.timezone, now);
  const qaRunId = crypto.randomUUID();
  const idempotencyKey = `admin_qa:${qaRunId}`;
  const concurrencyKey = `admin_qa_active:${userId}`;
  const requestId = crypto.randomUUID();
  let run;
  try { run = await startQaExecutionRun(admin, { userId, idempotencyKey, requestId, concurrencyKey }); } catch { return NextResponse.json({ error: 'qa_execution_unavailable' }, { status: 503 }); }
  if (!run.created) {
    if (run.active) return NextResponse.json({ error: 'qa_execution_in_progress', execution_run_id: run.context.executionId }, { status: 409 });
    return existingResult(admin, run.context.executionId, userId, date);
  }
  const slot = qaSlot(run.context.executionId);

  let preparedBrief: Awaited<ReturnType<typeof buildBrief>>['brief'] | null = null;
  try {
    const [{ brief }, memory] = await Promise.all([buildBrief(admin, userId, 'intention'), loadEditorialMemory(admin, userId, now)]);
    preparedBrief = brief;
    await recordExecutionStage(admin, run.context, 'brief', { status: 'completed' });
    await recordExecutionStage(admin, run.context, 'editorial_memory', { status: 'completed', recent_count: memory.recent.length });
    await recordExecutionStage(admin, run.context, 'planner', { status: 'completed', strategy: brief.editorialPlan?.strategy ?? null, topic: brief.editorialPlan?.recommended_topic ?? null });
    await recordExecutionStage(admin, run.context, 'psychological_contract', { status: brief.psychologicalContract?.sufficient ? 'completed' : 'insufficient', sufficient: brief.psychologicalContract?.sufficient ?? false, situation: brief.psychologicalContract?.situation ?? null, observable_pattern: brief.psychologicalContract?.observable_pattern ?? null, mechanism_id: brief.psychologicalContract?.mechanism_id ?? null, psychological_move: brief.psychologicalContract?.psychological_move ?? null, expected_movement: brief.psychologicalContract?.expected_movement ?? null, why_now: brief.psychologicalContract?.why_now ?? null });
    await recordAdminAudit(admin, {
      adminUserId: access.user.id,
      action: 'plan_qa_daily_intervention',
      targetType: 'user',
      targetId: userId,
      metadata: {
        trigger: 'admin_qa',
        communication_preference: brief.communicationPreference ?? 'adaptive',
        memory: {
          recent_topics: memory.recent.map(item => item.topic).filter(Boolean).slice(0, 15),
          topics: memory.topics.map(item => ({ topic: item.topic, count: item.count, state: item.state })).slice(0, 10),
          recent_concepts: memory.recent.map(item => item.concept).filter(Boolean).slice(0, 15),
          recent_angles: memory.recent.map(item => item.angle).filter(Boolean).slice(0, 15),
          formats: memory.formats,
          depths: memory.depths,
        },
        planner: brief.editorialPlan ?? null,
      },
    });
    let result: InterventionResult;
    const editorialStatus = 'approved' as const;
    try {
      result = await resolveIntervention(admin, userId, 'intention', 'whatsapp', idempotencyKey, run.context, { maxGenerationAttempts: 2, disableTechnicalGenerationRetry: true, executionContext: 'qa', writerVersion: 'v2' });
    } catch (error) {
      if (error instanceof Error && ['no_approved_intervention', 'no_approved_intervention_after_repair'].includes(error.message)) {
        const trace = await qaTrace(admin, run.context.executionId, userId);
        return NextResponse.json({ status: 'editorial_review_required', editorial_status: 'no_approved_intervention', execution_run_id: run.context.executionId, generation: { ...(await sanitizedGeneration(admin, run.context.executionId)), candidate_summaries: trace.candidate_summaries }, editorial: { strategy: brief.editorialPlan?.strategy ?? null, topic: brief.editorialPlan?.recommended_topic ?? null, intervention_type: brief.editorialPlan?.preferred_or_recommended_intervention_type ?? null, depth: brief.editorialPlan?.recommended_depth ?? null }, intervention_id: null, delivery_id: null, evolution: { accepted: false, provider_message_id_present: false }, qa_trace: trace });
      }
      throw error;
    }
    await recordExecutionStage(admin, run.context, 'intervention', { status: 'completed', intervention_id: result.interventionId });
    const recent = await admin.from('interactions').select('content,slot').eq('user_id', userId).order('created_at', { ascending: false }).limit(16);
    const recentContents = (recent.data ?? []).filter(row => typeof row.slot !== 'string' || !row.slot.startsWith('qa:')).slice(0, 8).map(row => row.content).filter((value): value is string => typeof value === 'string');
    const content = composeNiaMessage({ content: result.intervention.text, firstName: profile.first_name, timezone: profile.timezone, userKey: userId, now, recentContents });
    await recordExecutionStage(admin, run.context, 'composer', { status: 'completed', content_length: content.length, shared_composer: true });
    const { data: interaction, error: interactionError } = await admin.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content, local_date: date, slot }).select('id,content').single();
    if (interactionError || !interaction) throw new Error('qa_interaction_save_failed');
    await recordExecutionStage(admin, run.context, 'interaction', { status: 'completed', interaction_id: interaction.id });
    const claim = await claimDelivery(admin, { userId, interactionId: interaction.id, localDate: date, slot });
    if (!claim) throw new Error('qa_delivery_already_processed');
    await recordExecutionStage(admin, run.context, 'delivery_claim', { status: 'completed', delivery_id: claim.id });
    const delivery = await sendClaimedDelivery(admin, { ...claim, userId, interactionId: interaction.id, localDate: date, slot }, connection.wa_id, content);
    const generation = { ...(await sanitizedGeneration(admin, run.context.executionId)), candidate_summaries: await candidateSummariesForExecution(admin, run.context.executionId, userId) };
    const editorial = { strategy: brief.editorialPlan?.strategy ?? null, topic: result.intervention.topic ?? brief.editorialPlan?.recommended_topic ?? null, intervention_type: result.intervention.interventionType ?? brief.editorialPlan?.preferred_or_recommended_intervention_type ?? null, depth: result.intervention.depth ?? brief.editorialPlan?.recommended_depth ?? null };
    if (!delivery.ok) {
      await updateExecutionRun(admin, run.context, { status: 'failed', interventionId: result.interventionId, failure: new Error(delivery.reason) });
      const trace = await qaTrace(admin, run.context.executionId, userId);
      return NextResponse.json({ status: 'downstream_failed', editorial_status: editorialStatus, execution_run_id: run.context.executionId, generation, editorial, intervention_id: result.interventionId, delivery_id: claim.id, evolution: { accepted: false, provider_message_id_present: false }, qa_trace: trace }, { status: 502 });
    }
    await recordExecutionStage(admin, run.context, 'sender', { status: 'completed', provider: 'evolution', provider_message_id_present: Boolean(delivery.providerMessageId) });
    await recordExecutionStage(admin, run.context, 'evolution', { status: 'completed', http_status: delivery.status ?? null, provider_message_id_present: Boolean(delivery.providerMessageId) });
    const trace = await qaTrace(admin, run.context.executionId, userId);
    return NextResponse.json({ status: 'success', editorial_status: editorialStatus, execution_run_id: run.context.executionId, generation, editorial, intervention_id: result.interventionId, delivery_id: claim.id, evolution: { accepted: true, provider_message_id_present: Boolean(delivery.providerMessageId) }, qa_trace: trace });
  } catch (error) {
    await updateExecutionRun(admin, run.context, { status: 'failed', failure: error });
    const trace = await qaTrace(admin, run.context.executionId, userId);
    console.error('[admin-qa-daily-intervention] failed', { executionId: run.context.executionId, userId, reason: error instanceof Error ? error.message : 'unknown' });
    const contract = preparedBrief?.psychologicalContract;
    const psychologicalContract = contract ? { situation: contract.situation, observable_pattern: contract.observable_pattern, user_direction: contract.user_direction, friction: contract.friction, mechanism_id: contract.mechanism_id, mechanism_confidence: contract.mechanism_confidence, intervention_purpose: contract.intervention_purpose, psychological_move: contract.psychological_move, expected_movement: contract.expected_movement, takeaway: contract.takeaway, why_now: contract.why_now, sufficient: contract.sufficient, risk_flags: contract.risk_flags } : null;
    const failureStage = error instanceof Error && error.message === 'insufficient_intervention_basis' ? 'Psychological contract' : 'Editorial pipeline';
    return NextResponse.json({ error: 'qa_execution_failed', execution_run_id: run.context.executionId, editorial_status: 'failed', editorial: preparedBrief?.editorialPlan ? { strategy: preparedBrief.editorialPlan.strategy, topic: preparedBrief.editorialPlan.recommended_topic, intervention_type: preparedBrief.editorialPlan.preferred_or_recommended_intervention_type, depth: preparedBrief.editorialPlan.recommended_depth } : null, psychological_contract: psychologicalContract, failure_stage: failureStage, qa_trace: trace }, { status: 500 });
  }
}
