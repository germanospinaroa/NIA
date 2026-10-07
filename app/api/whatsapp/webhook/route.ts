import { createHmac, timingSafeEqual } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractLinkCode, hashLinkCode, normalizeInboundPhone, parseEvolutionMessage, sendWhatsAppText, whatsappProvider } from '@/lib/server/whatsapp';
import { persistInboundMessage, processInboundMessage, processUnresolvedInbound } from '@/lib/server/whatsapp-inbound';
import { completeOnboardingAfterWhatsapp } from '@/lib/server/onboarding-finalization';

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

export async function POST(request: Request) {
  const raw = await request.text();
  const authenticated = whatsappProvider() === 'evolution' ? validEvolutionToken(request) : validSignature(raw, request.headers.get('x-hub-signature-256'));
  if (!authenticated) return NextResponse.json({ error: 'invalid_webhook_auth' }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const evolution = whatsappProvider() === 'evolution' ? parseEvolutionMessage(body) : null;
  const metaMessage = (body.entry as Array<{ changes?: Array<{ value?: { messages?: Array<{ from?: string; text?: { body?: string } }> } }> }> | undefined)?.flatMap(entry => entry.changes ?? []).flatMap(change => change.value?.messages ?? [])[0];
  const from = evolution ? evolution.from : metaMessage?.from?.trim();
  const text = evolution ? evolution.text : metaMessage?.text?.body;
  const code = text ? extractLinkCode(text) : null;
  if (evolution?.fromMe) return NextResponse.json({ received: true });
  if (evolution?.isGroup || evolution?.isBroadcast) return NextResponse.json({ received: true, ignored: 'unsupported_jid' });
  if (evolution?.buttonId && from) {
    console.info('whatsapp_feedback_button_received', { buttonId: evolution.buttonId, buttonTextPresent: Boolean(evolution.buttonText), messageIdPresent: Boolean(evolution.providerMessageId), waIdSuffix: from.slice(-4) });
    const admin = createAdminClient();
    await admin.from('event_log').insert({ user_id: null, event_type: 'whatsapp_feedback_received', entity_type: 'whatsapp', metadata: { button_id: evolution.buttonId, button_text: evolution.buttonText, provider_message_id: evolution.providerMessageId, wa_id_suffix: from.slice(-4) } });
    return NextResponse.json({ received: true, feedback: 'identified' });
  }
  if (whatsappProvider() === 'evolution' && evolution && from && !code && evolution.messageType !== 'button') {
    const admin = createAdminClient();
    if (!evolution.providerMessageId) {
      await admin.from('event_log').insert({ event_type: 'whatsapp_inbound_missing_id', entity_type: 'whatsapp', metadata: { wa_id_suffix: from.slice(-4), message_type: evolution.messageType } });
      return NextResponse.json({ received: true, ignored: 'missing_message_id' }, { status: 202 });
    }
    if (!evolution.text.trim()) return NextResponse.json({ received: true, ignored: 'unsupported_message' }, { status: 202 });
    const { data: connection } = await admin.from('whatsapp_connections').select('user_id,wa_id,status').eq('provider', 'evolution').eq('wa_id', from).eq('status', 'connected').maybeSingle();
    const persisted = await persistInboundMessage(admin, evolution, connection?.user_id ?? null);
    if (!persisted.created) return NextResponse.json({ received: true, duplicate: true, status: persisted.row.status }, { status: 202 });
    await admin.from('event_log').insert({ user_id: connection?.user_id ?? null, event_type: 'inbound_received', entity_type: 'whatsapp_inbound', entity_id: persisted.row.id, metadata: { provider: 'evolution', provider_message_id: evolution.providerMessageId, wa_id_suffix: from.slice(-4) } });
    if (!connection?.user_id) {
      after(() => processUnresolvedInbound(admin, evolution, persisted.row).catch(error => console.error('[nia-inbound-unresolved-failed]', error instanceof Error ? error.message : String(error))));
      return NextResponse.json({ received: true, processing: 'scheduled', user_resolved: false }, { status: 202 });
    }
    after(() => processInboundMessage(admin, evolution, persisted.row, connection.user_id).catch(error => console.error('[nia-inbound-processing-failed]', error instanceof Error ? error.message : String(error))));
    return NextResponse.json({ received: true, processing: 'scheduled', user_resolved: true }, { status: 202 });
  }
  if (!from || !code) return NextResponse.json({ received: true });
  const admin = createAdminClient();
  const { data: token, error: tokenError } = await admin.from('whatsapp_link_tokens').select('id,user_id,status,expires_at,expected_phone').eq('token_hash', hashLinkCode(code)).maybeSingle();
  if (tokenError || !token || token.status !== 'pending' || new Date(token.expires_at).getTime() < Date.now()) return NextResponse.json({ received: true });
  const normalizedFrom = normalizeInboundPhone(from);
  if (token.expected_phone && normalizedFrom !== token.expected_phone) {
    await admin.from('event_log').insert({ user_id: token.user_id, event_type: 'whatsapp_link_phone_mismatch', entity_type: 'whatsapp_link_token', entity_id: token.id, metadata: { wa_id_suffix: normalizedFrom?.slice(-4) || null, expected_phone_suffix: token.expected_phone.slice(-4) } });
    console.info('whatsapp_link_phone_mismatch', { userId: token.user_id, tokenId: token.id, waIdSuffix: normalizedFrom?.slice(-4) || null, expectedPhoneSuffix: token.expected_phone.slice(-4) });
    return NextResponse.json({ received: true, connected: false, mismatch: true });
  }
  const verifiedFrom = normalizedFrom || from;
  const provider = whatsappProvider();
  const { data: existing } = await admin.from('whatsapp_connections').select('user_id').eq('provider', provider).in('wa_id', Array.from(new Set([from, verifiedFrom]))).eq('status', 'connected').maybeSingle();
  if (existing && existing.user_id !== token.user_id) {
    await admin.from('whatsapp_link_tokens').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: 'already_connected' }).eq('id', token.id);
    await sendWhatsAppText(verifiedFrom, 'Este número ya está conectado a otra cuenta de NIA. Vuelve a NIA para usar otro número.');
    return NextResponse.json({ received: true, connected: false, conflict: true });
  }
  const now = new Date().toISOString();
  const { data: connection, error: connectionError } = await admin.from('whatsapp_connections').upsert({ user_id: token.user_id, provider, wa_id: verifiedFrom, phone_number: verifiedFrom, status: 'connected', connected_at: now, last_message_at: now, updated_at: now }, { onConflict: 'user_id,provider' }).select('id').single();
  if (connectionError) return NextResponse.json({ error: 'connection_save_failed' }, { status: 500 });
  const { data: consumed, error: consumeError } = await admin.from('whatsapp_link_tokens').update({ status: 'used', used_at: now }).eq('id', token.id).eq('status', 'pending').select('id').maybeSingle();
  if (consumeError) return NextResponse.json({ error: 'link_consume_failed' }, { status: 500 });
  if (!consumed) {
    if (token.status === 'used') {
      try {
        const retry = await completeOnboardingAfterWhatsapp(admin, token.user_id);
        return NextResponse.json({ received: true, duplicate: true, onboarding_completed: Boolean(retry.alreadyCompleted || retry.welcomeScheduled) });
      } catch { /* The original webhook already persisted the connection; a later retry can finish it. */ }
    }
    return NextResponse.json({ received: true, duplicate: true });
  }
  const { data: profile } = await admin.from('profiles').select('first_name,preferred_name').eq('id', token.user_id).maybeSingle();
  await admin.from('profiles').update({ whatsapp_enabled: true, whatsapp_phone: verifiedFrom }).eq('id', token.user_id);
  let onboarding;
  try {
    onboarding = await completeOnboardingAfterWhatsapp(admin, token.user_id);
  } catch (error) {
    console.error('[whatsapp onboarding completion failed]', { userId: token.user_id, reason: error instanceof Error ? error.message : 'unknown' });
  }
  const name = profile?.preferred_name?.trim() || profile?.first_name?.trim();
  const greeting = name ? `Hola, ${name}.` : 'Hola.';
  console.info('whatsapp_link_outbound_started', { userId: token.user_id, connectionId: connection.id, waIdSuffix: verifiedFrom.slice(-4) });
  const delivery = await sendWhatsAppText(verifiedFrom, `${greeting}\n\nListo. Ya reconocí este número y quedó conectado con tu cuenta de NIA.\n\nAhora podrás recibir aquí tus mensajes.`);
  if (!delivery.ok) {
    console.error('whatsapp_link_confirmation_failed', { userId: token.user_id, connectionId: connection.id, waIdSuffix: from.slice(-4), reason: delivery.reason, status: 'status' in delivery ? delivery.status : undefined });
    return NextResponse.json({ received: true, connected: true, confirmation_sent: false, onboarding_completed: Boolean(onboarding?.alreadyCompleted || onboarding?.welcomeScheduled) });
  }
  console.info('whatsapp_link_confirmation_sent', { userId: token.user_id, connectionId: connection.id, waIdSuffix: from.slice(-4), status: delivery.status, messageIdPresent: Boolean(delivery.providerMessageId) });
  return NextResponse.json({ received: true, connected: true, confirmation_sent: true, provider_message_id: delivery.providerMessageId, onboarding_completed: Boolean(onboarding?.alreadyCompleted || onboarding?.welcomeScheduled) });
}
