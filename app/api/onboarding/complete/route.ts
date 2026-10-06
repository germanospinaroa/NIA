import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureActivationWelcome } from '@/lib/server/reception-welcome';
import { scheduleWelcomeDelivery } from '@/lib/server/welcome-delivery';
import { refillApprovedBuffer } from '@/lib/server/refill-approved-buffer';
import { firstPsychologicalLocalDate } from '@/lib/server/whatsapp-schedule';

export const maxDuration = 300;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from('profiles').select('first_name,timezone,message_time_1,message_frequency,message_time_2,account_status').eq('id', user.id).maybeSingle();
  if (profileError || !profile) return NextResponse.json({ error: 'profile_unavailable' }, { status: 400 });
  const { data: connection, error: connectionError } = await supabase.from('whatsapp_connections').select('wa_id,status').eq('user_id', user.id).eq('provider', 'evolution').eq('status', 'connected').maybeSingle();
  if (connectionError) return NextResponse.json({ error: 'whatsapp_unavailable' }, { status: 503 });
  if (!connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected' }, { status: 409 });
  if (!profile.message_time_1) return NextResponse.json({ error: 'message_time_required' }, { status: 422 });

  const now = new Date();
  const timezone = profile.timezone || 'America/Bogota';
  const intendedLocalDate = firstPsychologicalLocalDate(timezone, profile.message_time_1, now);
  const admin = createAdminClient();
  try {
    const prepared = await refillApprovedBuffer(admin, user.id, { now, minBufferDays: 1, targetBufferDays: 1, maxCostUsd: Number(process.env.REFILL_MAX_COST_USD || 0.03), firstIntendedLocalDate: intendedLocalDate });
    if (prepared.created.length === 0 && !prepared.skipped.includes('buffer_at_target')) throw new Error('first_buffer_not_prepared');
    const welcome = await ensureActivationWelcome(admin, { userId: user.id, firstName: profile.first_name, timezone, now });
    const delivery = await scheduleWelcomeDelivery(admin, { userId: user.id, interactionId: String(welcome.interaction.id), dueAt: new Date(now.getTime() + 60_000) });
    const { error: completionError } = await admin.from('profiles').update({ onboarding_completed: true, onboarding_completed_at: now.toISOString(), message_frequency: 1, message_time_2: null, timezone }).eq('id', user.id);
    if (completionError) throw new Error('onboarding_completion_failed');
    return NextResponse.json({ success: true, intended_local_date: intendedLocalDate, welcome_scheduled: true, welcome_due_at: delivery.due_at, buffer_prepared: prepared.created.length > 0 || prepared.skipped.includes('buffer_at_target') });
  } catch (error) {
    console.error('[onboarding complete] failed', { userId: user.id, reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: error instanceof Error && error.message === 'first_buffer_not_prepared' ? 'first_buffer_not_prepared' : 'onboarding_completion_failed' }, { status: 503 });
  }
}
