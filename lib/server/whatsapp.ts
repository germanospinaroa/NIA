import { createHash, randomBytes } from 'node:crypto';

export const WHATSAPP_TOKEN_TTL_MS = 10 * 60 * 1000;

export function whatsappProvider() {
  return process.env.WHATSAPP_PROVIDER === 'evolution' ? 'evolution' as const : 'meta' as const;
}

export function createLinkCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(4);
  let suffix = '';
  for (let index = 0; index < 4; index += 1) suffix += alphabet[bytes[index] % alphabet.length];
  return `NIA-${suffix}`;
}

export function hashLinkCode(code: string) {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function extractLinkCode(text: string) {
  const match = text.toUpperCase().match(/\bNIA-[A-Z0-9]{4}\b/);
  return match?.[0] ?? null;
}

export type EvolutionInboundMessage = {
  providerMessageId: string | null;
  remoteJid: string;
  from: string;
  text: string;
  fromMe: boolean;
  messageType: 'conversation' | 'extendedTextMessage' | 'button' | 'unknown';
  isGroup: boolean;
  isBroadcast: boolean;
  buttonId: string | null;
  buttonText: string | null;
};

/** Normalizes the Evolution MESSAGES_UPSERT shape without inventing identity. */
export function parseEvolutionMessage(body: Record<string, unknown>): EvolutionInboundMessage {
  const data = (body.data ?? {}) as Record<string, unknown>;
  const key = (data.key ?? {}) as Record<string, unknown>;
  const message = (data.message ?? {}) as Record<string, unknown>;
  const extended = (message.extendedTextMessage ?? {}) as Record<string, unknown>;
  const button = (message.buttonsResponseMessage ?? message.templateButtonReplyMessage ?? {}) as Record<string, unknown>;
  const remoteJid = typeof key.remoteJid === 'string' ? key.remoteJid : '';
  const conversation = typeof message.conversation === 'string' ? message.conversation : '';
  const extendedText = typeof extended.text === 'string' ? extended.text : '';
  const buttonId = typeof button.selectedButtonId === 'string' ? button.selectedButtonId : typeof button.selectedId === 'string' ? button.selectedId : null;
  const buttonText = typeof button.selectedDisplayText === 'string' ? button.selectedDisplayText : typeof button.selectedName === 'string' ? button.selectedName : null;
  const messageType = buttonId || buttonText ? 'button' : conversation ? 'conversation' : extendedText ? 'extendedTextMessage' : 'unknown';
  return {
    providerMessageId: typeof key.id === 'string' && key.id.trim() ? key.id : null,
    remoteJid,
    from: remoteJid.replace(/@.*$/, ''),
    text: conversation || extendedText || buttonText || '',
    fromMe: key.fromMe === true,
    messageType,
    isGroup: remoteJid.endsWith('@g.us'),
    isBroadcast: remoteJid.endsWith('@broadcast') || remoteJid === 'status@broadcast',
    buttonId,
    buttonText,
  };
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return '••••';
  return `+${digits.slice(0, 2)} ${'•'.repeat(Math.max(0, digits.length - 5))}${digits.slice(-3)}`;
}

export function normalizeInboundPhone(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `+${digits}` : null;
}

export function whatsappNumber() {
  return process.env.WHATSAPP_BUSINESS_NUMBER?.replace(/\D/g, '') || null;
}

export function whatsappConfigured() {
  if (whatsappProvider() === 'evolution') return Boolean(whatsappNumber() && process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE && process.env.EVOLUTION_WEBHOOK_TOKEN);
  return Boolean(whatsappNumber() && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_VERIFY_TOKEN && process.env.WHATSAPP_APP_SECRET);
}

export function whatsappDeepLink(code: string) {
  const number = whatsappNumber();
  if (!number) return null;
  const message = `Hola NIA. Quiero conectar mi WhatsApp.\nCódigo: ${code}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppText(to: string, text: string) {
  if (whatsappProvider() === 'evolution') {
    const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;
    if (!baseUrl || !apiKey || !instance) return { ok: false as const, reason: 'not_configured' as const };
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(instance)}`;
    const number = to.replace(/\D/g, '');
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, text }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      console.error('whatsapp_outbound_request_failed', { provider: 'evolution', instance, endpoint, reason: error instanceof Error ? error.name : 'network_error' });
      return { ok: false as const, reason: 'network_error' as const };
    }
    const payload = await response.json().catch(() => ({}));
    const providerMessageId = payload?.key?.id ?? payload?.message?.key?.id ?? payload?.messages?.[0]?.id ?? null;
    const providerError = typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : typeof payload?.response?.message === 'string' ? payload.response.message : 'provider_error';
    console.info('whatsapp_outbound_result', { provider: 'evolution', instance, endpoint, status: response.status, ok: response.ok, messageIdPresent: Boolean(providerMessageId), error: response.ok ? undefined : providerError });
    if (!response.ok) return { ok: false as const, reason: 'provider_error' as const, status: response.status, providerError };
    return { ok: true as const, status: response.status, providerMessageId };
  }
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return { ok: false as const, reason: 'not_configured' as const };
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v22.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, reason: 'provider_error' as const, status: response.status, providerError: payload?.error?.code || 'provider_error' };
  return { ok: true as const, providerMessageId: payload?.messages?.[0]?.id ?? null };
}

export type WhatsAppReplyButton = { id: string; title: string };

export async function sendWhatsAppReplyButtons(to: string, body: string, buttons: WhatsAppReplyButton[]) {
  if (buttons.length < 1 || buttons.length > 3 || buttons.some(button => !button.id.trim() || !button.title.trim())) return { ok: false as const, reason: 'invalid_buttons' as const };
  if (whatsappProvider() !== 'evolution') return { ok: false as const, reason: 'buttons_not_supported_by_provider' as const };
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!baseUrl || !apiKey || !instance) return { ok: false as const, reason: 'not_configured' as const };
  const endpoint = `${baseUrl}/message/sendButtons/${encodeURIComponent(instance)}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: to.replace(/\D/g, ''), title: 'NIA', description: body, footer: 'NIA', buttons: buttons.map(button => ({ type: 'reply', displayText: button.title, id: button.id })) }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error('whatsapp_buttons_request_failed', { provider: 'evolution', instance, reason: error instanceof Error ? error.name : 'network_error' });
    return { ok: false as const, reason: 'network_error' as const };
  }
  const payload = await response.json().catch(() => ({}));
  const providerMessageId = payload?.key?.id ?? payload?.message?.key?.id ?? payload?.messages?.[0]?.id ?? null;
  if (!response.ok) return { ok: false as const, reason: 'provider_error' as const, status: response.status };
  console.info('whatsapp_buttons_result', { provider: 'evolution', instance, status: response.status, messageIdPresent: Boolean(providerMessageId) });
  return { ok: true as const, status: response.status, providerMessageId };
}
