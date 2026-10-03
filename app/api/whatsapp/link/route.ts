import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createLinkCode, hashLinkCode, whatsappConfigured, whatsappDeepLink, whatsappNumber, WHATSAPP_TOKEN_TTL_MS } from '@/lib/server/whatsapp';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!whatsappConfigured()) return NextResponse.json({ status: 'not_configured', message: 'La conexión de WhatsApp todavía no está disponible.' }, { status: 503 });
  const { data: existing } = await supabase.from('whatsapp_connections').select('id,status').eq('user_id', user.id).eq('status', 'connected').maybeSingle();
  if (existing) return NextResponse.json({ status: 'already_connected' }, { status: 409 });
  const admin = createAdminClient();
  await admin.from('whatsapp_link_tokens').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: 'superseded' }).eq('user_id', user.id).eq('status', 'pending');
  const code = createLinkCode();
  const expiresAt = new Date(Date.now() + WHATSAPP_TOKEN_TTL_MS).toISOString();
  const { error } = await admin.from('whatsapp_link_tokens').insert({ user_id: user.id, token_hash: hashLinkCode(code), status: 'pending', expires_at: expiresAt });
  if (error) return NextResponse.json({ error: 'link_unavailable' }, { status: error.code === '42P01' ? 503 : 500 });
  return NextResponse.json({ code, deep_link: whatsappDeepLink(code), nia_number: whatsappNumber(), expires_at: expiresAt });
}
