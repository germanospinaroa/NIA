import type { SupabaseClient } from '@supabase/supabase-js';
import { buildWelcomeMessage, WELCOME_INTERACTION_TYPE } from './reception-progression';
import { localDate } from './whatsapp-schedule';

type DbClient = SupabaseClient;

export async function ensureActivationWelcome(
  admin: DbClient,
  input: { userId: string; firstName?: string | null; preferredName?: string | null; timezone?: string | null; now?: Date },
) {
  const now = input.now ?? new Date();
  const date = localDate(input.timezone, now);
  const { data: existing, error: existingError } = await admin
    .from('interactions')
    .select('*')
    .eq('user_id', input.userId)
    .eq('interaction_type', WELCOME_INTERACTION_TYPE)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existingError) throw new Error('welcome_lookup_failed');
  if (existing) return { interaction: existing as Record<string, unknown>, created: false };

  const { data, error } = await admin
    .from('interactions')
    .insert({ user_id: input.userId, interaction_type: WELCOME_INTERACTION_TYPE, content: buildWelcomeMessage(input.preferredName || input.firstName, now, input.timezone), local_date: date })
    .select('*')
    .single();
  if (error?.code === '23505') {
    const { data: winner } = await admin.from('interactions').select('*').eq('user_id', input.userId).eq('interaction_type', WELCOME_INTERACTION_TYPE).order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (!winner) throw new Error('welcome_persistence_failed');
    return { interaction: winner as Record<string, unknown>, created: false };
  }
  if (error || !data) throw new Error('welcome_persistence_failed');
  return { interaction: data as Record<string, unknown>, created: true };
}
