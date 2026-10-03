import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('subscriptions').select('id,provider,plan_key,plan_name,status,trial,trial_ends_at,current_period_end,next_billing_at,access_until,cancel_requested_at,canceled_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: 'subscription_unavailable' }, { status: 500 });
  return NextResponse.json({ subscription: data });
}
