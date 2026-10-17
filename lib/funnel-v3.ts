import { readMarketingAttribution } from './marketing-attribution';

export const FUNNEL_V3_VERSION = 'emotional_v3' as const;

export type V3Context = 'request' | 'conversation' | 'decision';

export type FunnelV3State = {
  context?: V3Context;
  preferredName?: string;
  plan?: 'monthly' | 'annual';
};

const STATE_KEY = 'nia_funnel_v3_epiphany_state';
const SESSION_KEY = 'nia_funnel_v3_epiphany_session_id';

export function readFunnelV3State(): FunnelV3State {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
export function saveFunnelV3State(patch: Partial<FunnelV3State>) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STATE_KEY, JSON.stringify({ ...readFunnelV3State(), ...patch }));
}

export function clearFunnelV3State() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(STATE_KEY);
}

export function readFunnelV3SessionId() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const value = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, value);
    return value;
  } catch {
    return null;
  }
}

export function trackFunnelV3(
  eventName: string,
  properties: Record<string, string | number | boolean> = {},
) {
  if (typeof window === 'undefined') return;
  const id = readFunnelV3SessionId();
  if (!id) return;
  const attribution = readMarketingAttribution();
  const event = {
    name: eventName,
    properties: { funnel_version: FUNNEL_V3_VERSION, ...properties },
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    session_id: id,
  };
  const globalWindow = window as Window & { __niaFunnelEvents?: unknown[] };
  (globalWindow.__niaFunnelEvents ??= []).push(event);
  window.dispatchEvent(new CustomEvent('nia:funnel', { detail: event }));
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || new URLSearchParams(window.location.search).get('qa') === '1') return;
  const body = JSON.stringify({
    session_id: id,
    event_name: eventName,
    funnel_version: FUNNEL_V3_VERSION,
    screen_index: typeof properties.screen === 'number' ? properties.screen : null,
    screen_key: typeof properties.screen_key === 'string' ? properties.screen_key : null,
    pathname: window.location.pathname,
    referrer: document.referrer.slice(0, 500) || null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
  });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/funnel/events', new Blob([body], { type: 'application/json' }));
    else void fetch('/api/funnel/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt the commercial journey.
  }
}
