import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureActivationWelcome } from '@/lib/server/reception-welcome';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { error } = await supabase.from('profiles').update({ account_status: 'active', must_set_password: false, first_activated_at: new Date().toISOString() }).eq('id', user.id);
  if (error) return NextResponse.json({ error: 'activation_complete_failed' }, { status: 400 });
  const { data: profile, error: profileError } = await supabase.from('profiles').select('first_name,timezone').eq('id', user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: 'activation_profile_failed' }, { status: 400 });
  try {
    const welcome = await ensureActivationWelcome(supabase, { userId: user.id, firstName: profile?.first_name ?? null, timezone: profile?.timezone ?? null });
    return NextResponse.json({ success: true, welcome });
  } catch {
    return NextResponse.json({ error: 'activation_welcome_failed' }, { status: 400 });
  }
}
