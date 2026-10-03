import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { error } = await supabase.from('whatsapp_connections').update({ status: 'disconnected', updated_at: new Date().toISOString() }).eq('user_id', user.id).eq('status', 'connected');
  if (error) return NextResponse.json({ error: 'disconnect_failed' }, { status: error.code === '42P01' ? 503 : 400 });
  await supabase.from('profiles').update({ whatsapp_enabled: false, whatsapp_phone: null }).eq('id', user.id);
  return NextResponse.json({ success: true });
}
