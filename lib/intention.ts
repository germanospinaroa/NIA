export const intentionOptions = [
  { key: 'trust_own_judgment', label: 'Confiar más en mi criterio.' },
  { key: 'less_external_opinions', label: 'Dejar de cambiar de opinión por lo que otros piensan.' },
  { key: 'say_what_i_mean', label: 'Decir lo que realmente quiero decir.' },
  { key: 'hold_boundaries', label: 'Poner límites sin sentirme mal.' },
  { key: 'decide_and_stay', label: 'Tomar decisiones y mantenerme firme.' },
  { key: 'less_validation', label: 'Dejar de necesitar tantas opiniones para sentirme segura.' },
  { key: 'act_with_doubt', label: 'Actuar aunque todavía tenga dudas.' },
  { key: 'self_response_after_failure', label: 'Tratarme diferente cuando algo no sale como esperaba.' },
] as const;

export type IntentionKey = typeof intentionOptions[number]['key'] | 'custom' | 'intention_unclear';

export const unclearGuidanceOptions = [
  'Le doy demasiadas vueltas.',
  'Busco que alguien me diga qué hacer.',
  'Sé lo que quiero, pero termino haciendo otra cosa.',
  'Me cuesta decir lo que realmente pienso.',
  'Me cuesta poner límites.',
  'No sé muy bien, solo siento que quiero estar diferente.',
] as const;

export const guidedSuggestions = [
  { key: 'trust_own_judgment', label: 'Confiar más en mi criterio.' },
  { key: 'say_what_i_mean', label: 'Decir lo que realmente quiero decir.' },
  { key: 'hold_boundaries', label: 'Poner límites sin sentirme mal.' },
  { key: 'decide_and_stay', label: 'Tomar decisiones y mantenerme firme.' },
] as const;

export function intentionLabel(key: string | null | undefined) {
  return intentionOptions.find(option => option.key === key)?.label ?? null;
}

export function invalidIntention(value: unknown) {
  if (typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return !normalized || normalized === 'no se' || normalized === 'null' || normalized === 'undefined';
}

export function validCustomIntention(value: unknown) {
  return typeof value === 'string' && value.trim().length >= 3 && !invalidIntention(value);
}

export function isValidIntention(key: string | null | undefined, text: unknown) {
  if (key === 'intention_unclear') return false;
  if (intentionLabel(key)) return true;
  return key === 'custom' && validCustomIntention(text);
}
