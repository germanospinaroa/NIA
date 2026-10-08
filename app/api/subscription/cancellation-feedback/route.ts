import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  CANCELLATION_FEEDBACK_MAX_LENGTH,
  isCancellationReasonCode,
  normalizeFeedbackText,
} from '@/lib/cancellation-feedback';

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const reasonCode = body.reason_code;
  const attemptId = body.cancellation_attempt_id;
  if (!isCancellationReasonCode(reasonCode)) return NextResponse.json({ error: 'invalid_reason_code' }, { status: 400 });
  if (!isUuid(attemptId)) return NextResponse.json({ error: 'invalid_cancellation_attempt' }, { status: 400 });

  const reasonText = normalizeFeedbackText(body.reason_text);
  const improvementText = normalizeFeedbackText(body.improvement_text);
  if (reasonText && reasonText.length > CANCELLATION_FEEDBACK_MAX_LENGTH) return NextResponse.json({ error: 'reason_text_too_long' }, { status: 400 });
  if (improvementText && improvementText.length > CANCELLATION_FEEDBACK_MAX_LENGTH) return NextResponse.json({ error: 'improvement_text_too_long' }, { status: 400 });

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('id, provider')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subscriptionError) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });

  const payload = {
    user_id: user.id,
    subscription_id: subscription?.id ?? null,
    provider: subscription?.provider ?? 'hotmart',
    reason_code: reasonCode,
    reason_text: reasonText,
    improvement_text: improvementText,
    cancellation_attempt_id: attemptId,
  };
  const { data, error } = await supabase
    .from('subscription_cancellation_feedback')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error?.code === '23505') {
    const existing = await supabase.from('subscription_cancellation_feedback').select('id').eq('user_id', user.id).eq('cancellation_attempt_id', attemptId).maybeSingle();
    if (existing.data?.id) return NextResponse.json({ feedback_id: existing.data.id });
  }
  if (error || !data?.id) return NextResponse.json({ error: 'cancellation_feedback_unavailable' }, { status: 503 });
  return NextResponse.json({ feedback_id: data.id });
}
