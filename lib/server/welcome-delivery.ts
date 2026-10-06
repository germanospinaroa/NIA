import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendWhatsAppText } from '@/lib/server/whatsapp';

type DbClient = SupabaseClient;

export type WelcomeDeliveryRow = {
  id: string;
  user_id: string;
  interaction_id: string;
  due_at: string;
  status: 'pending' | 'claimed' | 'sent' | 'failed';
  attempt_count: number;
  provider_message_id: string | null;
  sent_at: string | null;
  last_error: string | null;
  locked_until: string | null;
  claim_token: string | null;
};

export async function scheduleWelcomeDelivery(
  admin: DbClient,
  input: { userId: string; interactionId: string; dueAt: Date },
) {
  const { data: existing, error: lookupError } = await admin
    .from('whatsapp_welcome_deliveries')
    .select('*')
    .eq('user_id', input.userId)
    .maybeSingle();
  if (lookupError) throw new Error('welcome_delivery_lookup_failed');
  if (existing) return existing as WelcomeDeliveryRow;

  const { data, error } = await admin
    .from('whatsapp_welcome_deliveries')
    .insert({ user_id: input.userId, interaction_id: input.interactionId, due_at: input.dueAt.toISOString() })
    .select('*')
    .single();
  if (error?.code === '23505') {
    const { data: winner } = await admin.from('whatsapp_welcome_deliveries').select('*').eq('user_id', input.userId).maybeSingle();
    if (!winner) throw new Error('welcome_delivery_persistence_failed');
    return winner as WelcomeDeliveryRow;
  }
  if (error || !data) throw new Error('welcome_delivery_persistence_failed');
  return data as WelcomeDeliveryRow;
}

async function claimNextWelcomeDelivery(admin: DbClient, now: Date) {
  const nowIso = now.toISOString();
  const { data: candidates, error } = await admin
    .from('whatsapp_welcome_deliveries')
    .select('*')
    .in('status', ['pending', 'failed', 'claimed'])
    .lte('due_at', nowIso)
    .or(`locked_until.is.null,locked_until.lt.${nowIso}`)
    .order('due_at', { ascending: true })
    .limit(10);
  if (error) throw new Error('welcome_delivery_queue_unavailable');
  for (const candidate of (candidates ?? []) as WelcomeDeliveryRow[]) {
    const claimToken = randomUUID();
    const { data: claimed, error: claimError } = await admin
      .from('whatsapp_welcome_deliveries')
      .update({ status: 'claimed', claim_token: claimToken, locked_until: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), attempt_count: Number(candidate.attempt_count ?? 0) + 1 })
      .eq('id', candidate.id)
      .in('status', ['pending', 'failed', 'claimed'])
      .or(`locked_until.is.null,locked_until.lt.${nowIso}`)
      .select('*')
      .maybeSingle();
    if (!claimError && claimed) return claimed as WelcomeDeliveryRow;
  }
  return null;
}

export async function sendDueWelcomeDeliveries(admin: DbClient, now = new Date()) {
  const results: Array<{ id: string; status: 'sent' | 'failed'; reason?: string }> = [];
  for (let count = 0; count < 20; count += 1) {
    const claim = await claimNextWelcomeDelivery(admin, now);
    if (!claim) break;
    const [{ data: interaction }, { data: connection }] = await Promise.all([
      admin.from('interactions').select('id,content').eq('id', claim.interaction_id).maybeSingle(),
      admin.from('whatsapp_connections').select('wa_id,status').eq('user_id', claim.user_id).eq('provider', 'evolution').eq('status', 'connected').maybeSingle(),
    ]);
    const reason = !interaction?.content ? 'welcome_interaction_missing' : !connection?.wa_id ? 'whatsapp_not_connected' : null;
    const sent = reason ? { ok: false as const, reason } : await sendWhatsAppText(connection!.wa_id, interaction!.content);
    if (sent.ok) {
      const sentAt = new Date().toISOString();
      await admin.from('whatsapp_welcome_deliveries').update({ status: 'sent', provider_message_id: sent.providerMessageId ?? null, sent_at: sentAt, last_error: null, locked_until: null, claim_token: null }).eq('id', claim.id).eq('claim_token', claim.claim_token);
      await admin.from('whatsapp_connections').update({ last_message_at: sentAt }).eq('user_id', claim.user_id).eq('provider', 'evolution').eq('status', 'connected');
      results.push({ id: claim.id, status: 'sent' });
    } else {
      const failure = 'reason' in sent ? sent.reason : 'welcome_send_failed';
      await admin.from('whatsapp_welcome_deliveries').update({ status: 'failed', last_error: failure, locked_until: null, claim_token: null }).eq('id', claim.id).eq('claim_token', claim.claim_token);
      results.push({ id: claim.id, status: 'failed', reason: failure });
    }
  }
  return results;
}
