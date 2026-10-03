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
export type OnboardingStage = 'name' | 'connection' | 'problem' | 'evidence' | 'nia' | 'demo_intro' | 'situation' | 'response' | 'explain' | 'personalization' | 'mechanism' | 'direction' | 'context' | 'contexts' | 'voice' | 'communication' | 'ready' | 'intro' | 'timing' | 'generating' | 'calibration' | 'first_intervention';
export const checkoutMode: 'bypass' | 'hotmart' = 'bypass';
export type FunnelState = {
  recognitionComplete: boolean;
  recognitionStep?: 1 | 2 | 3;
  recognitionContext?: RecognitionContext;
  feedback?: FunnelFeedback;
  microdemoComplete?: boolean;
  plan?: FunnelPlan;
  email?: string;
  firstName?: string;
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
