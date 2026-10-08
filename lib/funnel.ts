export type FunnelFeedback = 'as_is' | 'grounded' | 'different';
export type FunnelPlan = 'monthly' | 'annual';
export type DemoChoice = 'new_information' | 'doubt' | 'unsure';
export type DiscoverDemoChoice = 'doubt' | 'influenced' | 'firm_but_hard';
export type DiscoverContext = 'opinion' | 'conversation' | 'limit';
export type DiscoverFeedback = 'serves' | 'different' | 'not_me';
export type FunnelTiming = 'morning' | 'midday' | 'afternoon' | 'night';
export type CommunicationPreference = 'idea' | 'practical' | 'structured' | 'adaptive';
export type RecognitionContext = 'decision_doubt';
export type OnboardingSituationChoice = 'doubt' | 'firm' | 'source_dependent';
export type OnboardingFollowupChoice = 'new_information' | 'only_doubt' | 'unsure' | 'yes' | 'no' | 'think' | 'decision_changed' | 'confidence_changed';
export type OnboardingStage = 'name' | 'identity' | 'connection' | 'problem' | 'evidence' | 'nia' | 'demo_intro' | 'situation' | 'response' | 'explain' | 'personalization' | 'mechanism' | 'direction' | 'desired_change' | 'context' | 'contexts' | 'voice' | 'communication' | 'ready' | 'intro' | 'timing' | 'generating' | 'calibration' | 'whatsapp';
export const checkoutMode: 'bypass' | 'hotmart' = 'hotmart';
export type FunnelState = {
  recognitionComplete: boolean;
  discoverScreenIndex?: number;
  recognitionStep?: 1 | 2 | 3;
  recognitionContext?: RecognitionContext;
  feedback?: FunnelFeedback;
  microdemoComplete?: boolean;
  plan?: FunnelPlan;
  email?: string;
  firstName?: string;
  preferredName?: string;
  preferredNameConfirmed?: boolean;
  directionText?: string;
  onboardingContext?: string;
  firstInterventionContent?: string;
  contexts?: string[];
  voiceStyle?: 'direct' | 'warm' | 'thoughtful';
  demoChoice?: DemoChoice;
  discoverDemoChoice?: DiscoverDemoChoice;
  discoverContext?: DiscoverContext;
  discoverFeedback?: DiscoverFeedback;
  timing?: FunnelTiming;
  communicationPreference?: CommunicationPreference;
  firstInterventionFeedback?: DiscoverFeedback;
  onboardingStage?: OnboardingStage;
  onboardingSituationChoice?: OnboardingSituationChoice;
  onboardingFollowupChoice?: OnboardingFollowupChoice;
};
const KEY = 'nia_funnel_state';

function readStoredState(storage: Storage): Partial<FunnelState> {
  try {
    const raw = storage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Partial<FunnelState> : {};
  } catch {
    return {};
  }
}

export function readFunnelState(): FunnelState {
  if (typeof window === 'undefined') return { recognitionComplete: false };
  const localState = readStoredState(window.localStorage);
  const sessionState = readStoredState(window.sessionStorage);
  const state = { recognitionComplete: false, ...localState, ...sessionState };
  if (!Object.prototype.hasOwnProperty.call(sessionState, 'discoverScreenIndex')) delete state.discoverScreenIndex;
  return state;
}
export function saveFunnelState(patch: Partial<FunnelState>) {
  if (typeof window === 'undefined') return;
  const next = JSON.stringify({ ...readFunnelState(), ...patch });
  sessionStorage.setItem(KEY, next);
  const durable = { ...readFunnelState(), ...patch };
  delete durable.discoverScreenIndex;
  localStorage.setItem(KEY, JSON.stringify(durable));
}
export function resetDiscoverProgress() {
  if (typeof window === 'undefined') return;
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const state = readStoredState(storage);
    delete state.discoverScreenIndex;
    storage.setItem(KEY, JSON.stringify(state));
  }
}
export function resetFunnelState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
export function trackFunnel(name: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const event = { name, properties, timestamp: new Date().toISOString(), path: window.location.pathname };
  const w = window as Window & { __niaFunnelEvents?: unknown[] };
  (w.__niaFunnelEvents ??= []).push(event);
  window.dispatchEvent(new CustomEvent('nia:funnel', { detail: event }));
}
