export type DirectionKey = 'trust_own_judgment' | 'say_what_i_mean' | 'hold_boundaries' | 'act_with_doubt' | 'less_validation' | 'self_response_after_failure';
export type VoiceStyle = 'grounded' | 'warm' | 'direct';
export type MessageFrequency = 0 | 1 | 2;
export type ContextKey = 'doubting' | 'decision' | 'conversation' | 'failure' | 'intention';
export type FeedbackType = 'resonates' | 'needs_grounding' | 'different_angle';

export const directionLabels: Record<DirectionKey, string> = {
  trust_own_judgment: 'Confiar más en mi criterio incluso cuando todavía tenga dudas.',
  say_what_i_mean: 'Decir lo que realmente quiero decir.',
  hold_boundaries: 'Poner límites sin explicarme tanto.',
  act_with_doubt: 'Actuar aunque todavía tenga dudas.',
  less_validation: 'Necesitar menos opiniones para sentirme segura.',
  self_response_after_failure: 'Tratarme diferente cuando algo sale mal.',
};

export const voiceSamples: Record<VoiceStyle, string> = {
  grounded: 'La duda puede estar aquí sin borrar lo que ya pensabas.',
  warm: 'Que haya aparecido la duda no significa que tu criterio desapareció con ella.',
  direct: 'Antes de buscar otra respuesta, vuelve un momento a la que ya tenías.',
};

export const contextLabels: Record<ContextKey, string> = {
  doubting: 'Estoy dudando de mí.',
  decision: 'Tengo que decidir algo.',
  conversation: 'Voy a tener una conversación.',
  failure: 'Algo no salió como esperaba.',
  intention: 'Solo necesito pensar con más claridad.',
};

export type MvpState = {
  firstName: string;
  email: string;
  directionKey: DirectionKey;
  directionText?: string;
  voiceStyle: VoiceStyle;
  messageFrequency: MessageFrequency;
  messageTime1: string;
  messageTime2?: string;
  timezone: string;
  whatsappEnabled: boolean;
  onboardingComplete: boolean;
  activated: boolean;
  evidence: { id: string; date: string; context: string; text: string }[];
  desiredChangeOriginal?: string;
  desiredChangeSummary?: string;
  currentContextOriginal?: string;
  currentContextSummary?: string;
  currentContextDomain?: string;
  preferredLanguage?: string[];
};

export const defaultMvpState: MvpState = {
  firstName: '', email: '', directionKey: 'trust_own_judgment', voiceStyle: 'grounded',
  messageFrequency: 0, messageTime1: '', timezone: '', whatsappEnabled: false,
  onboardingComplete: false, activated: false, evidence: [],
};

export function readMvpState(): MvpState {
  if (typeof window === 'undefined') return defaultMvpState;
  try {
    const local = JSON.parse(localStorage.getItem('nia_mvp_state') ?? 'null') as Partial<MvpState> | null;
    const discover = JSON.parse(sessionStorage.getItem('nia_discover_state') ?? 'null') as { firstName?: string; chosenDirection?: DirectionKey } | null;
    return { ...defaultMvpState, ...local, ...(discover?.firstName ? { firstName: discover.firstName } : {}), ...(discover?.chosenDirection ? { directionKey: discover.chosenDirection } : {}) };
  } catch { return defaultMvpState; }
}

export function saveMvpState(state: MvpState) { if (typeof window !== 'undefined') localStorage.setItem('nia_mvp_state', JSON.stringify(state)); }

export function trackMvp(name: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const event = { name, properties, timestamp: new Date().toISOString() };
  const w = window as Window & { __niaMvpEvents?: unknown[] };
  (w.__niaMvpEvents ??= []).push(event);
  window.dispatchEvent(new CustomEvent('nia:mvp', { detail: event }));
}
