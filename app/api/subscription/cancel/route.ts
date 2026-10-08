import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelHotmartSubscription, HotmartCancellationError, dateValue } from '@/lib/server/hotmart';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const feedbackId = typeof body.feedback_id === 'string' ? body.feedback_id : null;
  const { data: subscription, error } = await supabase.from('subscriptions').select('id,provider,subscriber_code,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });
  if (!subscription || subscription.provider !== 'hotmart' || !subscription.subscriber_code) return NextResponse.json({ error: 'cancellation_unavailable' }, { status: 409 });

  let feedbackAttached = false;
  if (feedbackId) {
    const { data: feedback } = await supabase.from('subscription_cancellation_feedback').select('id,subscription_id').eq('id', feedbackId).eq('user_id', user.id).maybeSingle();
    if (!feedback || (feedback.subscription_id && feedback.subscription_id !== subscription.id)) return NextResponse.json({ error: 'cancellation_feedback_invalid' }, { status: 409 });
    feedbackAttached = true;
    const { error: feedbackError } = await supabase.from('subscription_cancellation_feedback').update({ cancellation_requested_at: new Date().toISOString(), cancellation_error_code: null }).eq('id', feedbackId).eq('user_id', user.id);
    if (feedbackError) console.error('[subscription cancel] feedback request marker failed', { code: 'feedback_request_marker_failed' });
  }

  const updateFeedback = async (values: Record<string, string | null>) => {
    if (!feedbackAttached || !feedbackId) return;
    const { error: feedbackError } = await supabase.from('subscription_cancellation_feedback').update(values).eq('id', feedbackId).eq('user_id', user.id);
    if (feedbackError) console.error('[subscription cancel] feedback lifecycle update failed', { code: 'feedback_lifecycle_update_failed' });
  };

  let cancellation;
  try {
    cancellation = await cancelHotmartSubscription(subscription.subscriber_code);
  } catch (cancelError) {
    const error = cancelError instanceof HotmartCancellationError ? cancelError : null;
    console.error('[subscription cancel] provider failed', { stage: error?.stage ?? 'cancel', status: error?.providerStatus ?? null, providerCode: error?.providerCode ?? null, code: error?.code ?? 'hotmart_cancel_failed' });
    await updateFeedback({ cancellation_failed_at: new Date().toISOString(), cancellation_error_code: error?.code ?? 'hotmart_cancel_failed' });
    if (error?.code === 'hotmart_not_configured') return NextResponse.json({ error: 'hotmart_not_configured' }, { status: 503 });
    if (error?.code === 'hotmart_auth_failed') return NextResponse.json({ error: 'hotmart_auth_failed' }, { status: 502 });
    return NextResponse.json({ error: 'hotmart_cancel_failed' }, { status: 502 });
  }
  const cancelRequestedAt = new Date().toISOString();
  const accessUntil = dateValue((cancellation.response as Record<string, unknown>)?.date_next_charge ?? (cancellation.response as Record<string, unknown>)?.access_until);
  const updateValues: Record<string, string> = { cancel_requested_at: cancelRequestedAt };
  if (accessUntil) updateValues.access_until = accessUntil;
  const { data: updated, error: updateError } = await supabase.from('subscriptions').update(updateValues).eq('id', subscription.id).select('*').single();
  await updateFeedback({ cancellation_confirmed_at: new Date().toISOString(), cancellation_failed_at: null, cancellation_error_code: null });
  if (updateError) return NextResponse.json({ error: 'provider_cancelled_local_sync_pending', provider_confirmed: true, access_until: accessUntil }, { status: 202 });
  return NextResponse.json({ subscription: updated, already_canceled: cancellation.alreadyCanceled });
}
