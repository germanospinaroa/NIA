import { auditCandidate, feedbackFor, selectCandidate, type InterventionCandidate, type InterventionResult } from '@/lib/intervention-engine';
import type { ContextKey } from '@/lib/mvp';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient;

export async function resolveIntervention(supabase: DbClient, userId: string, contextKey: ContextKey, channel: 'web' | 'whatsapp' = 'web'): Promise<InterventionResult> {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) throw new Error('profile_unavailable');
  const { data: history } = await supabase.from('interventions').select('text, concept, angle, structure').eq('user_id', userId).order('created_at', { ascending: false }).limit(8);
  const brief = {
    firstName: profile.first_name,
    desiredChange: profile.desired_change_original || profile.direction_text || 'Quiero actuar de una manera diferente.',
    currentContext: profile.current_context_original || contextKey,
    contextDomain: profile.current_context_domain,
    recentInterventions: (history ?? []).map((row: { text: string }) => row.text),
    recentConcepts: (history ?? []).map((row: { concept: string }) => row.concept),
    recentAngles: (history ?? []).map((row: { angle: string }) => row.angle),
    recentStructures: (history ?? []).map((row: { structure: string }) => row.structure),
    preferredLanguage: profile.learning_profile?.preferredLanguage ?? [],
    voiceStyle: profile.voice_style,
  };
  const { selected, candidates } = selectCandidate(brief);
  if (!selected) throw new Error('no_approved_intervention');
  const selectedCandidate = selected as InterventionCandidate;
  const { data: intervention, error: interventionError } = await supabase.from('interventions').insert({
    user_id: userId,
    text: selectedCandidate.text,
    function: selectedCandidate.function,
    concept: selectedCandidate.concept,
    angle: selectedCandidate.angle,
    structure: selectedCandidate.structure,
    context_key: contextKey,
    desired_change_snapshot: brief.desiredChange,
    current_context_snapshot: brief.currentContext,
    audit_status: 'approved',
    audit_results: selectedCandidate.audit,
    channel,
    status: 'created',
  }).select('*').single();
  if (interventionError || !intervention) throw new Error('intervention_save_failed');
  const candidateRows = candidates.map(candidate => ({
    intervention_id: intervention.id,
    user_id: userId,
    candidate_text: candidate.text,
    function: candidate.function,
    concept: candidate.concept,
    angle: candidate.angle,
    structure: candidate.structure,
    audit_results: candidate.audit,
    rejection_reason: candidate.audit?.status === 'rejected' ? candidate.audit.reasons.join(',') : null,
  }));
  await supabase.from('intervention_candidates').insert(candidateRows);
  return { intervention: selectedCandidate, interventionId: intervention.id, feedback: feedbackFor(selectedCandidate), candidates };
}

export { auditCandidate };
