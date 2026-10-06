import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: current, error: currentError } = await supabase.from('profiles').select('first_activated_at,account_status,must_set_password,onboarding_completed').eq('id', user.id).maybeSingle();
  if (currentError) return NextResponse.json({ error: 'activation_profile_failed' }, { status: 400 });
  const now = new Date().toISOString();
  const { error } = await supabase.from('profiles').update({ account_status: 'active', must_set_password: false, first_activated_at: current?.first_activated_at ?? now }).eq('id', user.id);
  if (error) return NextResponse.json({ error: 'activation_complete_failed' }, { status: 400 });
  return NextResponse.json({ success: true, onboarding_completed: Boolean(current?.onboarding_completed) });
}
