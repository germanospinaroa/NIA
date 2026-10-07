import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { planConfig } from '@/lib/hotmart-checkout';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('subscriptions').select('plan_key,status,trial,trial_started_at,trial_ends_at,next_billing_at,current_period_end,access_until,cancel_requested_at,canceled_at,purchase_status,amount,currency').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });
  if (!data) return NextResponse.json({ subscription: null });
  const config = planConfig(data.plan_key);
  return NextResponse.json({ subscription: {
    ...data,
    plan_key: config?.key ?? null,
    plan_name: config?.displayName ?? null,
    amount: data.amount ?? config?.price ?? null,
    currency: data.currency ?? config?.currency ?? null,
  } });
}
