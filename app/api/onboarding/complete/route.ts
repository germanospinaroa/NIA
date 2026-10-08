import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { completeOnboardingAfterWhatsapp } from '@/lib/server/onboarding-finalization';

export const maxDuration = 300;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: connection, error: connectionError } = await supabase.from('whatsapp_connections').select('wa_id,status').eq('user_id', user.id).eq('provider', 'evolution').eq('status', 'connected').maybeSingle();
  if (connectionError) return NextResponse.json({ error: 'whatsapp_unavailable' }, { status: 503 });
  if (!connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected' }, { status: 409 });
  try {
    const result = await completeOnboardingAfterWhatsapp(createAdminClient(), user.id);
    return NextResponse.json({ success: true, intended_local_date: result.intendedLocalDate, welcome_scheduled: result.welcomeScheduled, welcome_due_at: result.welcomeDueAt ?? null, buffer_prepared: result.bufferPrepared, buffer_status: result.bufferStatus });
  } catch (error) {
    console.error('[onboarding complete] failed', { userId: user.id, reason: error instanceof Error ? error.message : 'unknown' });
    const reason = error instanceof Error ? error.message : 'onboarding_completion_failed';
    const required = ['identity_required', 'desired_change_required', 'current_context_required', 'personalization_required', 'timing_required'];
    return NextResponse.json({ error: required.includes(reason) ? reason : reason === 'first_buffer_not_prepared' ? 'first_buffer_not_prepared' : 'onboarding_completion_failed' }, { status: required.includes(reason) ? 422 : 503 });
  }
}
