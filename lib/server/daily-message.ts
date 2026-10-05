import { CalibrationRequiredError, resolveIntervention } from '@/lib/server/intervention';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { recordEvent, startExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import { intentionLabel, invalidIntention, validCustomIntention } from '@/lib/intention';
import { localDate } from '@/lib/server/whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureWelcome } from '@/lib/server/reception-welcome';
import { dailyIdempotencyKey } from '@/lib/recurrent-daily';
import { BUFFER_DEPENDENCY_NOT_DELIVERED, consumeApprovedMessage, loadApprovedMessageForDate, releaseConsumedMessage } from '@/lib/server/approved-message-buffer';

type DbClient = SupabaseClient;

export type DailyInteractionResult = { interaction: Record<string, unknown>; localDate: string; created: boolean; kind?: 'welcome' | 'intervention' };

export async function getOrCreateDailyInteraction(supabase: DbClient, userId: string, channel: 'web' | 'whatsapp' = 'web', now = new Date(), slot: string | null = null): Promise<DailyInteractionResult> {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) throw new Error('profile_unavailable');
  const date = localDate(profile.timezone, now);
  const welcome = await ensureWelcome(supabase, { userId, channel, firstName: typeof profile.first_name === 'string' ? profile.first_name : null, timezone: typeof profile.timezone === 'string' ? profile.timezone : null, now });
  if (!welcome.delivered || welcome.created) return { interaction: welcome.interaction, localDate: date, created: welcome.created, kind: 'welcome' };
  const storedDirection = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const direction = validCustomIntention(storedDirection) ? storedDirection : intentionLabel(profile.direction_key);
  if (!direction || invalidIntention(direction) || profile.direction_key === 'intention_unclear') throw new Error('valid_intention_required');
  // One psychological intervention per user's local day. The legacy `slot`
  // column remains for compatibility, but it is not part of the daily quota.
  const existingQuery = supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date);
  const [{ data: existing }, { data: recent }] = await Promise.all([
    existingQuery.limit(1).maybeSingle(),
    supabase.from('interactions').select('content,slot').eq('user_id', userId).eq('interaction_type', 'daily_message').order('created_at', { ascending: false }).limit(16),
  ]);
  if (existing) return { interaction: existing as Record<string, unknown>, localDate: date, created: false, kind: 'intervention' };
  // Prefer an already approved future message. Delivery must not wait for a
  // provider call at the user's scheduled time.
  let buffered;
  try {
    buffered = await loadApprovedMessageForDate(supabase, userId, date);
  } catch (error) {
    if (error instanceof Error && error.message === BUFFER_DEPENDENCY_NOT_DELIVERED) throw new Error('daily_unavailable');
    throw error;
  }
  if (buffered) {
    const consumed = await consumeApprovedMessage(supabase, buffered);
    if (!consumed) throw new Error('daily_unavailable');
    const { data: bufferedInteraction, error: bufferedError } = await supabase.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content: buffered.message, local_date: date, slot }).select('*').single();
    if (!bufferedError && bufferedInteraction) return { interaction: bufferedInteraction as Record<string, unknown>, localDate: date, created: true, kind: 'intervention' };
    const { data: winner } = await supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date).limit(1).maybeSingle();
    if (winner) return { interaction: winner as Record<string, unknown>, localDate: date, created: false, kind: 'intervention' };
    await releaseConsumedMessage(supabase, buffered);
    throw new Error('daily_unavailable');
  }
  const idempotencyKey = dailyIdempotencyKey(userId, date);
  let execution;
  try { execution = await startExecutionRun(supabase, { userId, channel, triggerSource: 'daily', idempotencyKey }); } catch { throw new Error('daily_unavailable'); }
  let result;
  try { result = await resolveIntervention(supabase, userId, 'intention', channel, idempotencyKey, execution, { slot, localDate: date, writerVersion: 'v2' }); } catch (error) {
    await updateExecutionRun(supabase, execution, { status: error instanceof CalibrationRequiredError ? 'failed' : error instanceof Error && ['no_approved_intervention', 'no_approved_intervention_after_repair'].includes(error.message) ? 'no_approved_intervention' : 'failed', failure: error });
    if (error instanceof CalibrationRequiredError) await recordEvent(supabase, { userId, eventType: 'recalibration_started', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { reason: error.calibration.reason } });
    else await recordEvent(supabase, { userId, eventType: 'intervention_failed', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { error: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
  const recentContents = (recent ?? []).filter(row => typeof row.slot !== 'string' || !row.slot.startsWith('qa:')).slice(0, 8).map(row => row.content).filter((value): value is string => typeof value === 'string');
  const message = composeNiaMessage({ content: result.intervention.text, firstName: typeof profile.first_name === 'string' ? profile.first_name : null, timezone: typeof profile.timezone === 'string' ? profile.timezone : null, userKey: userId, now, recentContents });
  const { data: created, error } = await supabase.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content: message, local_date: date, slot }).select('*').single();
  if (!error && created) return { interaction: created as Record<string, unknown>, localDate: date, created: true, kind: 'intervention' };
  const winnerQuery = supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date);
  const { data: winner } = await winnerQuery.limit(1).single();
  if (winner) return { interaction: winner as Record<string, unknown>, localDate: date, created: false, kind: 'intervention' };
  await updateExecutionRun(supabase, execution, { status: 'failed', interventionId: result.interventionId, failure: new Error('persistence_error') });
  throw new Error('daily_unavailable');
}
