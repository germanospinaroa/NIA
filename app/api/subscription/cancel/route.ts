import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelHotmartSubscription, HotmartCancellationError, dateValue } from '@/lib/server/hotmart';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: subscription, error } = await supabase.from('subscriptions').select('id,provider,subscriber_code,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });
  if (!subscription || subscription.provider !== 'hotmart' || !subscription.subscriber_code) return NextResponse.json({ error: 'cancellation_unavailable' }, { status: 409 });
  let cancellation;
  try {
    cancellation = await cancelHotmartSubscription(subscription.subscriber_code);
  } catch (cancelError) {
    const error = cancelError instanceof HotmartCancellationError ? cancelError : null;
    console.error('[subscription cancel] provider failed', { stage: error?.stage ?? 'cancel', status: error?.providerStatus ?? null, providerCode: error?.providerCode ?? null, code: error?.code ?? 'hotmart_cancel_failed' });
    if (error?.code === 'hotmart_not_configured') return NextResponse.json({ error: 'hotmart_not_configured' }, { status: 503 });
    if (error?.code === 'hotmart_auth_failed') return NextResponse.json({ error: 'hotmart_auth_failed' }, { status: 502 });
    return NextResponse.json({ error: 'hotmart_cancel_failed' }, { status: 502 });
  }
  const cancelRequestedAt = new Date().toISOString();
  const accessUntil = dateValue((cancellation.response as Record<string, unknown>)?.date_next_charge ?? (cancellation.response as Record<string, unknown>)?.access_until);
  const updateValues: Record<string, string> = { cancel_requested_at: cancelRequestedAt };
  if (accessUntil) updateValues.access_until = accessUntil;
  const { data: updated, error: updateError } = await supabase.from('subscriptions').update(updateValues).eq('id', subscription.id).select('*').single();
  if (updateError) return NextResponse.json({ error: 'cancellation_state_failed' }, { status: 500 });
  return NextResponse.json({ subscription: updated, already_canceled: cancellation.alreadyCanceled });
}
