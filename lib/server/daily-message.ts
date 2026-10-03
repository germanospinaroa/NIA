import { CalibrationRequiredError, resolveIntervention } from '@/lib/server/intervention';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { recordEvent, startExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import { intentionLabel, invalidIntention, validCustomIntention } from '@/lib/intention';
import { localDate } from '@/lib/server/whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient;

export type DailyInteractionResult = { interaction: Record<string, unknown>; localDate: string; created: boolean };

export async function getOrCreateDailyInteraction(supabase: DbClient, userId: string, channel: 'web' | 'whatsapp' = 'web', now = new Date(), slot: string | null = null): Promise<DailyInteractionResult> {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) throw new Error('profile_unavailable');
  const storedDirection = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const direction = validCustomIntention(storedDirection) ? storedDirection : intentionLabel(profile.direction_key);
  if (!direction || invalidIntention(direction) || profile.direction_key === 'intention_unclear') throw new Error('valid_intention_required');
  const date = localDate(profile.timezone, now);
  const existingQuery = supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date);
  const [{ data: existing }, { data: recent }] = await Promise.all([
    (slot === null ? existingQuery.is('slot', null) : existingQuery.eq('slot', slot)).maybeSingle(),
    supabase.from('interactions').select('content').eq('user_id', userId).eq('interaction_type', 'daily_message').order('created_at', { ascending: false }).limit(8),
  ]);
  if (existing) return { interaction: existing as Record<string, unknown>, localDate: date, created: false };
  const idempotencyKey = `daily:${date}:${slot ?? 'web'}`;
  let execution;
  try { execution = await startExecutionRun(supabase, { userId, channel, triggerSource: 'daily', idempotencyKey }); } catch { throw new Error('daily_unavailable'); }
  let result;
  try { result = await resolveIntervention(supabase, userId, 'intention', channel, idempotencyKey, execution); } catch (error) {
    await updateExecutionRun(supabase, execution, { status: error instanceof CalibrationRequiredError ? 'failed' : error instanceof Error && error.message === 'no_approved_intervention' ? 'no_approved_intervention' : 'failed', failure: error });
    if (error instanceof CalibrationRequiredError) await recordEvent(supabase, { userId, eventType: 'recalibration_started', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { reason: error.calibration.reason } });
    else await recordEvent(supabase, { userId, eventType: 'intervention_failed', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { error: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
  const message = composeNiaMessage({ content: result.intervention.text, firstName: typeof profile.first_name === 'string' ? profile.first_name : null, timezone: typeof profile.timezone === 'string' ? profile.timezone : null, userKey: userId, now, recentContents: (recent ?? []).map(row => row.content).filter((value): value is string => typeof value === 'string') });
  const { data: created, error } = await supabase.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content: message, local_date: date, slot }).select('*').single();
  if (!error && created) return { interaction: created as Record<string, unknown>, localDate: date, created: true };
  const winnerQuery = supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date);
  const { data: winner } = await (slot === null ? winnerQuery.is('slot', null) : winnerQuery.eq('slot', slot)).single();
  if (winner) return { interaction: winner as Record<string, unknown>, localDate: date, created: false };
  await updateExecutionRun(supabase, execution, { status: 'failed', interventionId: result.interventionId, failure: new Error('persistence_error') });
  throw new Error('daily_unavailable');
}
