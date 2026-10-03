import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractLinkCode, hashLinkCode, sendWhatsAppText, whatsappProvider } from '@/lib/server/whatsapp';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verifyToken = whatsappProvider() === 'evolution' ? process.env.EVOLUTION_WEBHOOK_TOKEN : process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken || url.searchParams.get('hub.verify_token') !== verifyToken) return new NextResponse('Forbidden', { status: 403 });
  return new NextResponse(url.searchParams.get('hub.challenge') || '', { status: 200 });
}

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function validEvolutionToken(request: Request) {
  const expected = process.env.EVOLUTION_WEBHOOK_TOKEN;
  const received = request.headers.get('x-evolution-token') || request.headers.get('apikey');
  return Boolean(expected && received && received === expected);
}

function evolutionMessage(body: Record<string, unknown>) {
  const data = (body.data ?? {}) as Record<string, unknown>;
  const key = (data.key ?? {}) as Record<string, unknown>;
  const message = (data.message ?? {}) as Record<string, unknown>;
  const extended = (message.extendedTextMessage ?? {}) as Record<string, unknown>;
  const text = typeof message.conversation === 'string' ? message.conversation : typeof extended.text === 'string' ? extended.text : '';
  const remoteJid = typeof key.remoteJid === 'string' ? key.remoteJid : '';
  return { from: remoteJid.replace(/@.*$/, ''), text, fromMe: key.fromMe === true };
}

export async function POST(request: Request) {
  const raw = await request.text();
  const authenticated = whatsappProvider() === 'evolution' ? validEvolutionToken(request) : validSignature(raw, request.headers.get('x-hub-signature-256'));
  if (!authenticated) return NextResponse.json({ error: 'invalid_webhook_auth' }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const evolution = whatsappProvider() === 'evolution' ? evolutionMessage(body) : null;
  const metaMessage = (body.entry as Array<{ changes?: Array<{ value?: { messages?: Array<{ from?: string; text?: { body?: string } }> } }> }> | undefined)?.flatMap(entry => entry.changes ?? []).flatMap(change => change.value?.messages ?? [])[0];
  const from = evolution ? evolution.from : metaMessage?.from?.trim();
  const text = evolution ? evolution.text : metaMessage?.text?.body;
  if (evolution?.fromMe) return NextResponse.json({ received: true });
  const code = text ? extractLinkCode(text) : null;
  if (!from || !code) return NextResponse.json({ received: true });
  const admin = createAdminClient();
  const { data: token, error: tokenError } = await admin.from('whatsapp_link_tokens').select('id,user_id,status,expires_at').eq('token_hash', hashLinkCode(code)).maybeSingle();
  if (tokenError || !token || token.status !== 'pending' || new Date(token.expires_at).getTime() < Date.now()) return NextResponse.json({ received: true });
  const provider = whatsappProvider();
  const { data: existing } = await admin.from('whatsapp_connections').select('user_id').eq('provider', provider).eq('wa_id', from).eq('status', 'connected').maybeSingle();
  if (existing && existing.user_id !== token.user_id) { await admin.from('whatsapp_link_tokens').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: 'already_connected' }).eq('id', token.id); return NextResponse.json({ received: true }); }
  const now = new Date().toISOString();
  const { error: connectionError } = await admin.from('whatsapp_connections').upsert({ user_id: token.user_id, provider, wa_id: from, phone_number: from, status: 'connected', connected_at: now, last_message_at: now, updated_at: now }, { onConflict: 'user_id,provider' });
  if (connectionError) return NextResponse.json({ error: 'connection_save_failed' }, { status: 500 });
  await admin.from('whatsapp_link_tokens').update({ status: 'used', used_at: now }).eq('id', token.id);
  const { data: profile } = await admin.from('profiles').select('first_name').eq('id', token.user_id).maybeSingle();
  await admin.from('profiles').update({ whatsapp_enabled: true, whatsapp_phone: from }).eq('id', token.user_id);
  const name = profile?.first_name?.trim();
  const greeting = name ? `Hola, ${name}.` : 'Hola.';
  const delivery = await sendWhatsAppText(from, `${greeting}\n\nListo. Ya reconocí este número y quedó conectado con tu cuenta de NIA.\n\nAhora podrás recibir aquí tus mensajes.`);
  if (!delivery.ok) console.error('whatsapp_link_confirmation_failed', { userId: token.user_id, reason: delivery.reason, status: 'status' in delivery ? delivery.status : undefined });
  return NextResponse.json({ received: true });
}
