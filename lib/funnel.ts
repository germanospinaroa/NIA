export type FunnelFeedback = 'as_is' | 'grounded' | 'different';
export type FunnelPlan = 'monthly' | 'annual';
export const checkoutMode: 'bypass' | 'hotmart' = 'bypass';
export type FunnelState = {
  recognitionComplete: boolean;
  feedback?: FunnelFeedback;
  microdemoComplete?: boolean;
  plan?: FunnelPlan;
  email?: string;
  firstName?: string;
  directionText?: string;
  contexts?: string[];
  voiceStyle?: 'direct' | 'warm' | 'thoughtful';
};
const KEY = 'nia_funnel_state';
export function readFunnelState(): FunnelState {
  if (typeof window === 'undefined') return { recognitionComplete: false };
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || '{}';
    return { recognitionComplete: false, ...JSON.parse(raw) };
  } catch { return { recognitionComplete: false }; }
}
export function saveFunnelState(patch: Partial<FunnelState>) {
  if (typeof window === 'undefined') return;
  const next = JSON.stringify({ ...readFunnelState(), ...patch });
  sessionStorage.setItem(KEY, next);
  localStorage.setItem(KEY, next);
}
export function trackFunnel(name: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const event = { name, properties, timestamp: new Date().toISOString(), path: window.location.pathname };
  const w = window as Window & { __niaFunnelEvents?: unknown[] };
  (w.__niaFunnelEvents ??= []).push(event);
  window.dispatchEvent(new CustomEvent('nia:funnel', { detail: event }));
}
