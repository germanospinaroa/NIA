import type { SupabaseClient } from '@supabase/supabase-js';
import { buildWelcomeMessage, WELCOME_INTERACTION_TYPE, welcomeDeliveryNeeded } from './reception-progression';
import { localDate } from './whatsapp-schedule';

type DbClient = SupabaseClient;

export async function ensureWelcome(admin: DbClient, input: { userId: string; channel: 'web' | 'whatsapp'; firstName?: string | null; timezone?: string | null; waId?: string | null; now?: Date }) {
  const now = input.now ?? new Date();
  const date = localDate(input.timezone, now);
  const { data: existing, error: existingError } = await admin.from('interactions').select('*').eq('user_id', input.userId).eq('interaction_type', WELCOME_INTERACTION_TYPE).order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (existingError) throw new Error('welcome_lookup_failed');
  let interaction = existing as Record<string, unknown> | null;
  let created = false;
  if (!interaction) {
    const { data, error } = await admin.from('interactions').insert({ user_id: input.userId, interaction_type: WELCOME_INTERACTION_TYPE, content: buildWelcomeMessage(input.firstName, now, input.timezone), local_date: date }).select('*').single();
    if (error?.code === '23505') {
      const { data: winner } = await admin.from('interactions').select('*').eq('user_id', input.userId).eq('interaction_type', WELCOME_INTERACTION_TYPE).limit(1).maybeSingle();
      if (!winner) throw new Error('welcome_persistence_failed');
      interaction = winner as Record<string, unknown>;
    } else {
      if (error || !data) throw new Error('welcome_persistence_failed');
      interaction = data as Record<string, unknown>;
      created = true;
    }
  }
  if (input.channel === 'web') return { interaction, created, delivered: true };
  let waId = input.waId;
  if (!waId) {
    const { data: connection } = await admin.from('whatsapp_connections').select('wa_id').eq('user_id', input.userId).eq('provider', 'evolution').eq('status', 'connected').maybeSingle();
    waId = connection?.wa_id ?? null;
  }
  if (!waId) return { interaction, created, delivered: false };
  const { data: delivery, error: deliveryError } = await admin.from('whatsapp_daily_deliveries').select('id,status,locked_until,attempt_count').eq('user_id', input.userId).eq('local_date', date).eq('slot', `welcome:${date}`).maybeSingle();
  if (deliveryError) throw new Error('welcome_delivery_lookup_failed');
  if (delivery?.status === 'sent') return { interaction, created, delivered: true };
  if (!welcomeDeliveryNeeded({ exists: Boolean(interaction), delivered: delivery?.status === 'sent' })) return { interaction, created, delivered: true };
  const { claimDelivery, sendClaimedDelivery } = await import('./whatsapp-daily');
  const claim = await claimDelivery(admin, { userId: input.userId, interactionId: String(interaction.id), localDate: date, slot: `welcome:${date}` });
  if (!claim) return { interaction, created, delivered: false };
  const sent = await sendClaimedDelivery(admin, { ...claim, userId: input.userId, interactionId: String(interaction.id), localDate: date, slot: `welcome:${date}` }, waId, String(interaction.content));
  return { interaction, created, delivered: sent.ok };
}
