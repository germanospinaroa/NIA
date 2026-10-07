import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { maskPhone, whatsappConfigured } from '@/lib/server/whatsapp';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!whatsappConfigured()) return NextResponse.json({ status: 'not_configured', message: 'La conexión de WhatsApp todavía no está disponible.' });
  const [{ data, error }, { data: latestToken }] = await Promise.all([
    supabase.from('whatsapp_connections').select('id,status,phone_number,connected_at,last_message_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('whatsapp_link_tokens').select('status,rejection_reason,expires_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (error) return NextResponse.json({ status: 'unavailable', message: 'No pudimos consultar la conexión de WhatsApp.' }, { status: error.code === '42P01' ? 503 : 500 });
  if (latestToken?.status === 'rejected' && latestToken.rejection_reason === 'already_connected') return NextResponse.json({ connection: { status: 'conflict', message: 'Este número ya está conectado a otra cuenta de NIA.' } });
  if (latestToken?.status === 'pending' && latestToken.expires_at && new Date(latestToken.expires_at).getTime() > Date.now()) return NextResponse.json({ connection: { status: 'connecting' } });
  if (!data) return NextResponse.json({ connection: { status: 'not_connected' } });
  return NextResponse.json({ connection: { ...data, phone_number: maskPhone(data.phone_number) } });
}
