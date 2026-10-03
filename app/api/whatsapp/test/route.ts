import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppText } from '@/lib/server/whatsapp';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [{ data: connection, error: connectionError }, { data: profile }] = await Promise.all([supabase.from('whatsapp_connections').select('wa_id,status').eq('user_id', user.id).eq('status', 'connected').maybeSingle(), supabase.from('profiles').select('first_name').eq('id', user.id).single()]);
  if (connectionError?.code === '42P01') return NextResponse.json({ error: 'whatsapp_unavailable', message: 'La conexión de WhatsApp todavía no está disponible.' }, { status: 503 });
  if (!connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected', message: 'Conecta tu WhatsApp antes de enviar una prueba.' }, { status: 409 });
  const name = profile?.first_name?.trim();
  if (!name) return NextResponse.json({ error: 'profile_incomplete', message: 'Completa tu nombre antes de enviar una prueba.' }, { status: 400 });
  const result = await sendWhatsAppText(connection.wa_id, `Hola, ${name}.\n\nEste es un mensaje de prueba de NIA.\n\nSi lo recibiste, tu WhatsApp está listo para recibir tus mensajes.`);
  if (!result.ok) return NextResponse.json({ error: result.reason, message: result.reason === 'not_configured' ? 'El proveedor de WhatsApp todavía no está configurado.' : 'No pudimos enviar el mensaje de prueba.' }, { status: result.reason === 'not_configured' ? 503 : 502 });
  await supabase.from('whatsapp_connections').update({ last_message_at: new Date().toISOString() }).eq('user_id', user.id).eq('status', 'connected');
  return NextResponse.json({ success: true, provider_message_id: result.providerMessageId });
}
