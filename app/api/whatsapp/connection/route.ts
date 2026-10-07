import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { maskPhone, whatsappConfigured } from '@/lib/server/whatsapp';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!whatsappConfigured()) return NextResponse.json({ status: 'not_configured', message: 'La conexión de WhatsApp todavía no está disponible.' });
  const attemptId = new URL(request.url).searchParams.get('attempt_id');
  const [{ data, error }, { data: latestToken }] = await Promise.all([
    supabase.from('whatsapp_connections').select('id,status,phone_number,connected_at,last_message_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    (attemptId ? supabase.from('whatsapp_link_tokens').select('id,purpose,status,rejection_reason,expires_at,expected_phone').eq('user_id', user.id).eq('id', attemptId).maybeSingle() : supabase.from('whatsapp_link_tokens').select('id,purpose,status,rejection_reason,expires_at,expected_phone').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()),
  ]);
  if (error) return NextResponse.json({ status: 'unavailable', message: 'No pudimos consultar la conexión de WhatsApp.' }, { status: error.code === '42P01' ? 503 : 500 });
  const replacementToken = latestToken?.purpose === 'replace' ? latestToken : null;
  const replacementStatus = replacementToken?.status === 'rejected' && replacementToken.rejection_reason === 'already_connected'
    ? 'conflict'
    : replacementToken?.status === 'used' && data?.status === 'connected' && replacementToken.expected_phone && data.phone_number === replacementToken.expected_phone
      ? 'succeeded'
      : replacementToken?.status === 'pending' && replacementToken.expires_at && new Date(replacementToken.expires_at).getTime() > Date.now()
        ? 'pending'
        : 'none';
  const replacement = { status: replacementStatus, attempt_id: replacementToken?.id ?? null } as const;
  if (data) return NextResponse.json({ connection: { ...data, phone_number: maskPhone(data.phone_number), replacement } });
  if (latestToken?.status === 'rejected' && latestToken.rejection_reason === 'already_connected') return NextResponse.json({ connection: { status: 'conflict', message: 'Este número ya está conectado a otra cuenta de NIA.', replacement } });
  if (latestToken?.status === 'pending' && latestToken.expires_at && new Date(latestToken.expires_at).getTime() > Date.now()) return NextResponse.json({ connection: { status: 'connecting', replacement } });
  return NextResponse.json({ connection: { status: 'not_connected', replacement } });
}
