import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { error } = await supabase.from('profiles').update({ account_status: 'active', must_set_password: false, first_activated_at: new Date().toISOString() }).eq('id', user.id);
  if (error) return NextResponse.json({ error: 'activation_complete_failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
