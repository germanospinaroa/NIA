import { createHash, randomBytes } from 'node:crypto';

export const WHATSAPP_TOKEN_TTL_MS = 10 * 60 * 1000;

export function whatsappProvider() {
  return process.env.WHATSAPP_PROVIDER === 'evolution' ? 'evolution' as const : 'meta' as const;
}

export function createLinkCode() {
  return `NIA-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function hashLinkCode(code: string) {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function extractLinkCode(text: string) {
  const match = text.toUpperCase().match(/\bNIA-[A-Z0-9]{6}\b/);
  return match?.[0] ?? null;
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return '••••';
  return `+${digits.slice(0, 2)} ${'•'.repeat(Math.max(0, digits.length - 5))}${digits.slice(-3)}`;
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
    const response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, { method: 'POST', headers: { apikey: apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ number: to.replace(/\D/g, ''), text }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false as const, reason: 'provider_error' as const, status: response.status, providerError: payload?.message || payload?.error || 'provider_error' };
    return { ok: true as const, providerMessageId: payload?.key?.id ?? payload?.message?.key?.id ?? null };
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
