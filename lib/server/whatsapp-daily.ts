import { randomUUID } from 'node:crypto';
import { getOrCreateDailyInteraction } from '@/lib/server/daily-message';
import { sendWhatsAppText } from '@/lib/server/whatsapp';
import { dueSlots } from '@/lib/server/whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient;
type Profile = { id: string; first_name: string | null; timezone: string | null; message_frequency: number | null; message_time_1: string | null; message_time_2: string | null; whatsapp_enabled: boolean | null };
type Connection = { user_id: string; wa_id: string | null; status: string };
type DeliveryClaim = { id: string; claimToken: string; userId: string; interactionId: string; localDate: string; slot: string };

function deliveryError(code: string) {
  return new Error(code);
}

export async function claimDelivery(admin: DbClient, input: { userId: string; interactionId: string; localDate: string; slot: string }) {
  const { error: insertError } = await admin.from('whatsapp_daily_deliveries').insert({ user_id: input.userId, interaction_id: input.interactionId, local_date: input.localDate, slot: input.slot, status: 'pending' });
  if (insertError && insertError.code !== '23505') throw new Error(insertError.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  const { data: current, error: selectError } = await admin.from('whatsapp_daily_deliveries').select('id,status,locked_until,attempt_count').eq('user_id', input.userId).eq('local_date', input.localDate).eq('slot', input.slot).maybeSingle();
  if (selectError) throw new Error(selectError.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  if (!current || current.status === 'sent' || (current.locked_until && new Date(current.locked_until).getTime() > Date.now())) return null;
  const claimToken = randomUUID();
  const update = admin.from('whatsapp_daily_deliveries').update({ status: 'pending', claim_token: claimToken, locked_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(), attempt_count: Number(current.attempt_count ?? 0) + 1, interaction_id: input.interactionId }).eq('id', current.id).in('status', ['pending', 'failed']);
  const result = current.locked_until ? await update.eq('locked_until', current.locked_until).select('id,claim_token').maybeSingle() : await update.is('locked_until', null).select('id,claim_token').maybeSingle();
  if (result.error) throw new Error(result.error.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  return result.data?.claim_token === claimToken ? { id: current.id, claimToken } : null;
}

export async function claimExistingFailedDelivery(admin: DbClient, deliveryId: string): Promise<{ kind: 'claimed'; claim: DeliveryClaim } | { kind: 'already_sent' | 'locked' | 'not_retryable' | 'not_found'; status?: string }> {
  const { data: delivery, error } = await admin.from('whatsapp_daily_deliveries').select('id,user_id,interaction_id,local_date,slot,status,locked_until,attempt_count').eq('id', deliveryId).maybeSingle();
  if (error) throw deliveryError(error.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  if (!delivery) return { kind: 'not_found' };
  if (delivery.status === 'sent') return { kind: 'already_sent', status: delivery.status };
  if (delivery.status !== 'failed') return { kind: 'not_retryable', status: delivery.status };
  if (delivery.locked_until && new Date(delivery.locked_until).getTime() > Date.now()) return { kind: 'locked', status: delivery.status };

  const claimToken = randomUUID();
  let update = admin.from('whatsapp_daily_deliveries').update({
    status: 'pending',
    claim_token: claimToken,
    locked_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    attempt_count: Number(delivery.attempt_count ?? 0) + 1,
  }).eq('id', delivery.id).eq('status', 'failed');
  update = delivery.locked_until ? update.eq('locked_until', delivery.locked_until) : update.is('locked_until', null);
  const { data: claimed, error: claimError } = await update.select('id,claim_token').maybeSingle();
  if (claimError) throw deliveryError(claimError.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  if (!claimed || claimed.claim_token !== claimToken) return { kind: 'locked', status: delivery.status };
  return { kind: 'claimed', claim: { id: delivery.id, claimToken, userId: delivery.user_id, interactionId: delivery.interaction_id, localDate: delivery.local_date, slot: delivery.slot } };
}

export async function sendClaimedDelivery(admin: DbClient, claim: DeliveryClaim, waId: string, content: string) {
  const delivery = await sendWhatsAppText(waId, content);
  if (delivery.ok) {
    const { error } = await admin.from('whatsapp_daily_deliveries').update({ status: 'sent', provider_message_id: delivery.providerMessageId, sent_at: new Date().toISOString(), locked_until: null, claim_token: null, last_error: null }).eq('id', claim.id).eq('claim_token', claim.claimToken);
    if (error) throw deliveryError(error.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
    return delivery;
  }
  const { error } = await admin.from('whatsapp_daily_deliveries').update({ status: 'failed', last_error: delivery.reason, locked_until: null, claim_token: null }).eq('id', claim.id).eq('claim_token', claim.claimToken);
  if (error) throw deliveryError(error.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
  return delivery;
}

export async function runDailyWhatsApp(admin: DbClient, now = new Date(), options: { dryRun?: boolean } = {}) {
  const { error: deliverySchemaError } = await admin.from('whatsapp_daily_deliveries').select('id').limit(1);
  if (deliverySchemaError) throw new Error(deliverySchemaError.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_unavailable');
  const [{ data: profiles, error: profilesError }, { data: connections, error: connectionsError }] = await Promise.all([
    admin.from('profiles').select('id,first_name,timezone,message_frequency,message_time_1,message_time_2,whatsapp_enabled').eq('whatsapp_enabled', true),
    admin.from('whatsapp_connections').select('user_id,wa_id,status').eq('status', 'connected'),
  ]);
  if (profilesError || connectionsError) throw new Error('daily_whatsapp_unavailable');
  const byUser = new Map((connections ?? []).map(connection => [connection.user_id, connection as Connection]));
  const results: Array<Record<string, unknown>> = [];
  for (const profile of (profiles ?? []) as Profile[]) {
    const connection = byUser.get(profile.id);
    const slots = dueSlots(profile, now);
    if (!connection?.wa_id || !slots.length) continue;
    // A psychological subscription message is one intervention per local day;
    // configured legacy second slots must not create a second daily delivery.
    for (const due of slots.slice(0, 1)) {
      let daily;
      try { daily = await getOrCreateDailyInteraction(admin, profile.id, 'whatsapp', now, due.slot); } catch (error) {
        results.push({ userId: profile.id, slot: due.slot, status: 'skipped', reason: error instanceof Error ? error.message : 'generation_failed' });
        continue;
      }
      if (daily.kind === 'welcome') {
        results.push({ userId: profile.id, slot: 'welcome', status: 'sent_or_pending' });
        continue;
      }
      const claim = await claimDelivery(admin, { userId: profile.id, interactionId: String(daily.interaction.id), localDate: due.localDate, slot: due.slot });
      if (!claim) continue;
      if (options.dryRun) {
        const { error: releaseError } = await admin.from('whatsapp_daily_deliveries').update({ locked_until: null, claim_token: null }).eq('id', claim.id).eq('claim_token', claim.claimToken);
        if (releaseError) throw new Error(releaseError.code === '42P01' ? 'daily_whatsapp_schema_missing' : 'daily_whatsapp_delivery_unavailable');
        results.push({ userId: profile.id, slot: due.slot, status: 'dry_run' });
        continue;
      }
      const deliveryClaim = { id: claim.id, claimToken: claim.claimToken, userId: profile.id, interactionId: String(daily.interaction.id), localDate: due.localDate, slot: due.slot };
      const delivery = await sendClaimedDelivery(admin, deliveryClaim, connection.wa_id, String(daily.interaction.content));
      if (delivery.ok) {
        results.push({ userId: profile.id, slot: due.slot, status: 'sent', messageIdPresent: Boolean(delivery.providerMessageId) });
      } else {
        results.push({ userId: profile.id, slot: due.slot, status: 'failed', reason: delivery.reason });
      }
    }
  }
  return results;
}
