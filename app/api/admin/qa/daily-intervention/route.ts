import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildBrief } from '@/lib/server/intervention';
import { resolveIntervention } from '@/lib/server/intervention';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { localDate } from '@/lib/server/whatsapp-schedule';
import { claimDelivery, sendClaimedDelivery } from '@/lib/server/whatsapp-daily';
import { loadEditorialMemory } from '@/lib/server/editorial-memory';
import { recordAdminAudit, startQaExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import type { InterventionCandidate, InterventionResult } from '@/lib/intervention-engine';

export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function qaSlot(executionId: string) { return `qa:${executionId}`; }

function sanitizedGeneration(admin: ReturnType<typeof createAdminClient>, executionId: string) {
  return Promise.all([
    admin.from('generation_attempts').select('status,candidate_count,approved_candidate_count,rejection_count').eq('execution_run_id', executionId).order('created_at', { ascending: true }),
    admin.from('execution_provider_calls').select('operation,status').eq('execution_run_id', executionId),
  ]).then(([attempts, calls]) => {
    const attempt = attempts.data?.[0];
    return {
      calls: calls.data?.filter(row => row.operation === 'generation' && row.status === 'success').length ?? 0,
      candidates: attempt?.candidate_count ?? 0,
      approved: attempt?.approved_candidate_count ?? 0,
      rejected: attempt?.rejection_count ?? 0,
    };
  });
}

async function candidateSummaries(admin: ReturnType<typeof createAdminClient>, interventionId: string) {
  const { data } = await admin.from('intervention_candidates').select('id,topic,concept,angle,intervention_type,depth,blocks,candidate_text,audit_results,rejection_reason').eq('intervention_id', interventionId).order('created_at', { ascending: true });
  return (data ?? []).map(candidate => ({
    id: candidate.id,
    topic: candidate.topic,
    concept: candidate.concept,
    angle: candidate.angle,
    intervention_type: candidate.intervention_type,
    depth: candidate.depth,
    blocks: Array.isArray(candidate.blocks) ? candidate.blocks.length : null,
    length: typeof candidate.candidate_text === 'string' ? candidate.candidate_text.length : 0,
    validation: candidate.rejection_reason ? 'rejected' : 'approved',
    audit_approved: candidate.audit_results?.approved === true,
    rejection_reason: candidate.rejection_reason,
  }));
}

async function candidateSummariesForExecution(admin: ReturnType<typeof createAdminClient>, userId: string, startedAt: number) {
  const { data } = await admin.from('intervention_candidates')
    .select('id,topic,concept,angle,intervention_type,depth,blocks,candidate_text,audit_results,rejection_reason')
    .eq('user_id', userId)
    .eq('execution_context', 'qa')
    .gte('created_at', new Date(startedAt - 1000).toISOString())
    .order('created_at', { ascending: true })
    .limit(3);
  return (data ?? []).map(candidate => ({
    id: candidate.id,
    topic: candidate.topic,
    concept: candidate.concept,
    angle: candidate.angle,
    intervention_type: candidate.intervention_type,
    depth: candidate.depth,
    blocks: Array.isArray(candidate.blocks) ? candidate.blocks.length : null,
    length: typeof candidate.candidate_text === 'string' ? candidate.candidate_text.length : 0,
    validation: candidate.rejection_reason ? 'rejected' : 'approved',
    audit_approved: candidate.audit_results?.approved === true,
    rejection_reason: candidate.rejection_reason,
  }));
}

async function createSyntheticDownstreamFixture(admin: ReturnType<typeof createAdminClient>, userId: string, executionId: string, context: string, desiredChange: string): Promise<{ interventionId: string; intervention: InterventionCandidate }> {
  const text = 'Esta es una prueba técnica del recorrido de NIA. La generación editorial de esta ejecución no produjo una candidata aprobada; este mensaje comprueba únicamente el composer y la entrega.';
  const intervention: InterventionCandidate = {
    text,
    function: 'reframe',
    concept: 'qa_downstream_fixture',
    angle: 'qa_downstream_fixture',
    structure: 'context_does_not_mean',
    topic: 'qa_downstream_fixture',
    interventionType: 'brief_insight',
    editorialType: 'context_mirror',
    depth: 'brief',
    blocks: [{ type: 'idea', text }],
    situation: context,
    intention: desiredChange,
    experienceType: 'brief_insight',
    territoryKey: 'qa_downstream_fixture',
    editorialTake: 'Comprobar el recorrido downstream sin aprobar contenido editorial.',
    editorialIdea: 'La infraestructura downstream puede probarse sin convertir una candidata rechazada en mensaje editorial.',
    functionalEmotion: 'claridad',
    directiveness: 'reflective',
    closingType: 'none',
  };
  const { data, error } = await admin.from('interventions').insert({
    user_id: userId,
    execution_context: 'qa',
    text,
    function: intervention.function,
    concept: intervention.concept,
    angle: intervention.angle,
    structure: intervention.structure,
    topic: intervention.topic,
    intervention_type: intervention.interventionType,
    depth: intervention.depth,
    blocks: intervention.blocks,
    editorial_strategy: 'qa_downstream_fixture',
    editorial_reason: 'No hubo candidata editorial aprobada; fixture exclusivo para comprobar downstream.',
    editorial_take: intervention.editorialTake,
    editorial_idea: intervention.editorialIdea,
    experience_type: intervention.experienceType,
    territory_key: intervention.territoryKey,
    situation: context,
    intention: desiredChange,
    editorial_type: intervention.editorialType,
    functional_emotion: intervention.functionalEmotion,
    directiveness: intervention.directiveness,
    closing_type: intervention.closingType,
    editorial_signature: { ...intervention, syntheticQa: true, executionId },
    editorial_score: null,
    gate_results: null,
    audit_status: 'approved',
    audit_results: { synthetic_qa: true, not_editorial_approval: true, execution_id: executionId },
    status: 'created',
    channel: 'whatsapp',
    idempotency_key: `qa_fixture:${executionId}`,
  }).select('id').single();
  if (error || !data) throw new Error('qa_synthetic_intervention_save_failed');
  return { interventionId: data.id, intervention };
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

  try {
    const [{ brief }, memory] = await Promise.all([buildBrief(admin, userId, 'intention'), loadEditorialMemory(admin, userId, now)]);
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
    let editorialStatus: 'approved' | 'no_approved_intervention' = 'approved';
    let syntheticDownstream = false;
    try {
      result = await resolveIntervention(admin, userId, 'intention', 'whatsapp', idempotencyKey, run.context, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'qa' });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'no_approved_intervention') throw error;
      editorialStatus = 'no_approved_intervention';
      syntheticDownstream = true;
      const synthetic = await createSyntheticDownstreamFixture(admin, userId, run.context.executionId, 'QA downstream fixture', 'QA downstream verification');
      result = { intervention: synthetic.intervention, interventionId: synthetic.interventionId, feedback: { question: '', dimension: 'relevance', options: [] }, candidates: [] };
    }
    const recent = await admin.from('interactions').select('content,slot').eq('user_id', userId).order('created_at', { ascending: false }).limit(16);
    const recentContents = (recent.data ?? []).filter(row => typeof row.slot !== 'string' || !row.slot.startsWith('qa:')).slice(0, 8).map(row => row.content).filter((value): value is string => typeof value === 'string');
    const content = composeNiaMessage({ content: result.intervention.text, firstName: profile.first_name, timezone: profile.timezone, userKey: userId, now, recentContents });
    const { data: interaction, error: interactionError } = await admin.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content, local_date: date, slot }).select('id,content').single();
    if (interactionError || !interaction) throw new Error('qa_interaction_save_failed');
    const claim = await claimDelivery(admin, { userId, interactionId: interaction.id, localDate: date, slot });
    if (!claim) throw new Error('qa_delivery_already_processed');
    const delivery = await sendClaimedDelivery(admin, { ...claim, userId, interactionId: interaction.id, localDate: date, slot }, connection.wa_id, content);
    const generation = { ...(await sanitizedGeneration(admin, run.context.executionId)), candidate_summaries: editorialStatus === 'approved' ? await candidateSummaries(admin, result.interventionId) : await candidateSummariesForExecution(admin, userId, run.context.startedAt) };
    const editorial = { strategy: brief.editorialPlan?.strategy ?? null, topic: result.intervention.topic ?? brief.editorialPlan?.recommended_topic ?? null, intervention_type: result.intervention.interventionType ?? brief.editorialPlan?.preferred_or_recommended_intervention_type ?? null, depth: result.intervention.depth ?? brief.editorialPlan?.recommended_depth ?? null };
    if (!delivery.ok) {
      await updateExecutionRun(admin, run.context, { status: 'failed', interventionId: result.interventionId, failure: new Error(delivery.reason) });
      return NextResponse.json({ status: 'downstream_failed', editorial_status: editorialStatus, synthetic_downstream: syntheticDownstream, execution_run_id: run.context.executionId, generation, editorial, intervention_id: result.interventionId, delivery_id: claim.id, evolution: { accepted: false, provider_message_id_present: false } }, { status: 502 });
    }
    if (syntheticDownstream) await updateExecutionRun(admin, run.context, { status: 'no_approved_intervention', interventionId: result.interventionId, candidateCount: generation.candidates, stageResults: { downstream: { status: 'completed', synthetic_qa: true, composer: 'shared', delivery: 'shared' } } });
    return NextResponse.json({ status: editorialStatus === 'approved' ? 'success' : 'editorial_review_required', editorial_status: editorialStatus, synthetic_downstream: syntheticDownstream, execution_run_id: run.context.executionId, generation, editorial, intervention_id: result.interventionId, delivery_id: claim.id, evolution: { accepted: true, provider_message_id_present: Boolean(delivery.providerMessageId) } });
  } catch (error) {
    await updateExecutionRun(admin, run.context, { status: 'failed', failure: error });
    console.error('[admin-qa-daily-intervention] failed', { executionId: run.context.executionId, userId, reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'qa_execution_failed', execution_run_id: run.context.executionId }, { status: 500 });
  }
}
