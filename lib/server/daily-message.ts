import { recordEvent } from '@/lib/server/operational-observability';
import { intentionLabel, invalidIntention, validCustomIntention } from '@/lib/intention';
import { localDate } from '@/lib/server/whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BUFFER_DEPENDENCY_NOT_DELIVERED, consumeApprovedMessage, loadApprovedMessageForDate, releaseConsumedMessage } from '@/lib/server/approved-message-buffer';
import { composeNiaMessage, evaluateFinalNiaMessage } from '@/lib/server/message-composer';
import { preferredAddressName } from '@/lib/profile-name';

type DbClient = SupabaseClient;

export type DailyInteractionResult = { interaction: Record<string, unknown>; localDate: string; created: boolean; kind: 'intervention' };

export async function getOrCreateDailyInteraction(supabase: DbClient, userId: string, channel: 'web' | 'whatsapp' = 'web', now = new Date(), slot: string | null = null): Promise<DailyInteractionResult> {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) throw new Error('profile_unavailable');
  const date = localDate(profile.timezone, now);
  const storedDirection = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const direction = validCustomIntention(storedDirection) ? storedDirection : intentionLabel(profile.direction_key);
  if (!direction || invalidIntention(direction) || profile.direction_key === 'intention_unclear') throw new Error('valid_intention_required');
  // One psychological intervention per user's local day. The legacy `slot`
  // column remains for compatibility, but it is not part of the daily quota.
  const { data: existing } = await supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date).limit(1).maybeSingle();
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
    const content = composeNiaMessage({ content: buffered.message, firstName: preferredAddressName(profile), timezone: profile.timezone, userKey: userId, now });
    const finalEvaluation = evaluateFinalNiaMessage(content, { firstName: preferredAddressName(profile) });
    if (!finalEvaluation.approved) {
      await releaseConsumedMessage(supabase, buffered);
      throw new Error(`final_message_contract_failed:${finalEvaluation.hardFailures.join('|')}`);
    }
    const { data: bufferedInteraction, error: bufferedError } = await supabase.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content, local_date: date, slot }).select('*').single();
    if (!bufferedError && bufferedInteraction) return { interaction: bufferedInteraction as Record<string, unknown>, localDate: date, created: true, kind: 'intervention' };
    const { data: winner } = await supabase.from('interactions').select('*').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', date).limit(1).maybeSingle();
    if (winner) return { interaction: winner as Record<string, unknown>, localDate: date, created: false, kind: 'intervention' };
    await releaseConsumedMessage(supabase, buffered);
    throw new Error('daily_unavailable');
  }
  try {
    await recordEvent(supabase, { userId, eventType: 'buffer_underflow', entityType: 'daily_delivery', entityId: date, metadata: { user: userId, localDate: date, channel } });
  } catch {
    // Underflow must remain deterministic even if observability is unavailable.
  }
  throw new Error('approved_buffer_underflow');
}
