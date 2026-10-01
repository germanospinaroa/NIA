import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { buildInterventionTimeline, groupInterventionProviderUsage, sanitizeTechnical, selectCandidate } from '@/lib/server/admin-intervention-detail';
import { getExecutionCost } from '@/lib/server/cost-ledger';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const admin = createAdminClient();
  const { data: intervention, error } = await admin.from('interventions').select('*').eq('id', id).maybeSingle();
  if (error || !intervention) return NextResponse.json({ error: 'intervention_not_found' }, { status: 404 });

  const [{ data: candidates }, { data: feedback }, { data: executions }, { data: profile }, { data: authUser }] = await Promise.all([
    admin.from('intervention_candidates').select('*').eq('intervention_id', id).order('created_at', { ascending: true }).limit(100),
    admin.from('intervention_feedback').select('*').eq('intervention_id', id).order('created_at', { ascending: true }).limit(20),
    admin.from('execution_runs').select('*').eq('intervention_id', id).order('started_at', { ascending: false }).limit(5),
    admin.from('profiles').select('id,first_name,desired_change_original,current_context_original,learning_profile').eq('id', intervention.user_id).maybeSingle(),
    admin.auth.admin.getUserById(intervention.user_id),
  ]);
  const executionIds = (executions ?? []).map(row => String(row.id));
  const [{ data: attempts }, { data: providerCalls }, { data: executionEvents }, { data: directEvents }, { data: learning }, { data: laterInterventions }] = await Promise.all([
    executionIds.length ? admin.from('generation_attempts').select('*').in('execution_run_id', executionIds).order('created_at', { ascending: true }).limit(100) : Promise.resolve({ data: [] }),
    executionIds.length ? admin.from('execution_provider_calls').select('*').in('execution_run_id', executionIds).order('created_at', { ascending: true }).limit(200) : Promise.resolve({ data: [] }),
    executionIds.length ? admin.from('event_log').select('*').in('execution_run_id', executionIds).order('occurred_at', { ascending: true }).limit(100) : Promise.resolve({ data: [] }),
    admin.from('event_log').select('*').eq('entity_id', id).order('occurred_at', { ascending: true }).limit(100),
    admin.from('learning_signals').select('*').eq('user_id', intervention.user_id).order('created_at', { ascending: false }).limit(50),
    admin.from('interventions').select('id,text,concept,angle,structure,created_at,status,channel').eq('user_id', intervention.user_id).gt('created_at', intervention.created_at).order('created_at', { ascending: true }).limit(10),
  ]);

  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_intervention', targetType: 'intervention', targetId: id, metadata: { intervention_id: id, execution_id: executions?.[0]?.id ?? null } });
  const allEvents = [...(executionEvents ?? []), ...(directEvents ?? [])].filter((event, index, list) => list.findIndex(item => item.id === event.id) === index);
  const execution = executions?.[0] ?? null;
  const cost = execution ? await getExecutionCost(admin, String(execution.id)) : { status: 'NOT AVAILABLE', reason: 'No hay una ejecución asociada a esta intervención.' };
  const observedCandidates = (candidates ?? []).map((candidate, index) => {
    const observed = selectCandidate([candidate], intervention.text);
    return observed ? { ...observed, index: index + 1, observability: observed } : { ...candidate, index: index + 1, observability: null };
  });
  const selected = selectCandidate(candidates ?? [], intervention.text);
  const semantic = observedCandidates.map(candidate => ({ id: candidate.id, similarity: candidate.observability?.audits?.semantic?.similarity ?? null, audit: sanitizeTechnical(candidate.audit_results) }));
  const attemptsList = attempts ?? [];
  const candidateCount = execution?.candidate_count ?? candidates?.length ?? null;
  const retryCount = execution?.retry_count ?? attemptsList.filter(row => row.attempt_type !== 'generation').length;
  const availability = {
    execution: Boolean(execution), attempts: attemptsList.length > 0, candidates: (candidates?.length ?? 0) > 0,
    semanticJudge: observedCandidates.some(candidate => Boolean(candidate.observability?.audits?.semantic?.judge)), providerUsage: (providerCalls?.length ?? 0) > 0,
    feedback: (feedback?.length ?? 0) > 0, learningAttribution: false, laterInterventions: (laterInterventions?.length ?? 0) > 0,
  };
  return NextResponse.json({
    intervention: sanitizeTechnical({ ...intervention, email: authUser?.user?.email ?? null }),
    user: sanitizeTechnical({ id: intervention.user_id, email: authUser?.user?.email ?? null, first_name: profile?.first_name ?? null }),
    generation_context: { desired_change: intervention.desired_change_snapshot ?? null, context: intervention.current_context_snapshot ?? null, timestamp: intervention.created_at, learning_constraints: sanitizeTechnical(execution?.stage_results && typeof execution.stage_results === 'object' ? (execution.stage_results as Record<string, unknown>).brief ?? null : null) },
    execution: execution ? sanitizeTechnical({ ...execution, candidate_count: candidateCount, retry_count: retryCount }) : null,
    attempts: sanitizeTechnical(attemptsList),
    candidates: observedCandidates.map(candidate => sanitizeTechnical(candidate)),
    semantic,
    audits: observedCandidates.map(candidate => ({ candidate_id: candidate.id, ...(candidate.observability?.audits ?? { deterministic: null, semantic: null, llm: null }) })),
    selection: { selected_candidate_id: selected ? String((selected as Record<string, unknown>).id) : null, selected_candidate_index: selected ? Number((selected as Record<string, unknown>).index) : null, decision: selected ? 'approved' : 'not_available', after_quality_retry: attemptsList.some(row => row.attempt_type === 'quality_retry' && row.approved_candidate_count > 0), attempt_type: attemptsList.find(row => row.approved_candidate_count > 0)?.attempt_type ?? null },
    persistence: { intervention_created: true, created_at: intervention.created_at, execution_id: execution?.id ?? null, channel: intervention.channel, status: intervention.status, delivered_at: intervention.delivered_at ?? null },
    feedback: sanitizeTechnical(feedback ?? []), learning: sanitizeTechnical(learning ?? []), learning_attribution: { available: false, message: 'learning_signals no tiene intervention_id; se muestra historial del usuario sin atribuir causalidad.' }, later_interventions: sanitizeTechnical(laterInterventions ?? []),
    provider_usage: { calls: sanitizeTechnical(providerCalls ?? []), grouped: groupInterventionProviderUsage(providerCalls ?? []) },
    timeline: buildInterventionTimeline({ events: allEvents, execution, attempts: attemptsList, feedback: feedback ?? [], intervention }),
    availability, cost,
    technical_details: sanitizeTechnical({ audit_results: intervention.audit_results, execution_stage_results: execution?.stage_results ?? null, profile_learning_profile: profile?.learning_profile ?? null }),
  });
}
