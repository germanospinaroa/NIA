import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelHotmartSubscription } from '@/lib/server/hotmart';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: subscription, error } = await supabase.from('subscriptions').select('id,provider,subscriber_code,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });
  if (!subscription || subscription.provider !== 'hotmart' || !subscription.subscriber_code) return NextResponse.json({ error: 'cancellation_unavailable' }, { status: 409 });
  try {
    await cancelHotmartSubscription(subscription.subscriber_code);
  } catch (cancelError) {
    console.error('[subscription cancel] provider failed', { userId: user.id, subscriptionId: subscription.id, code: cancelError instanceof Error ? cancelError.message : 'unknown' });
    return NextResponse.json({ error: cancelError instanceof Error && cancelError.message === 'hotmart_not_configured' ? 'cancellation_not_configured' : 'cancellation_failed' }, { status: 502 });
  }
  const { data: updated, error: updateError } = await supabase.from('subscriptions').update({ cancel_requested_at: new Date().toISOString() }).eq('id', subscription.id).select('*').single();
  if (updateError) return NextResponse.json({ error: 'cancellation_state_failed' }, { status: 500 });
  return NextResponse.json({ subscription: updated });
}
