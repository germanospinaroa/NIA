export type DesiredChangeKey =
  | 'trust_decisions'
  | 'less_approval'
  | 'less_overthinking'
  | 'boundaries_less_guilt'
  | 'say_what_i_think'
  | 'act_without_total_certainty'
  | 'less_external_opinion'
  | 'other';

export type ContextChoiceKey =
  | 'important_decision'
  | 'disagreement'
  | 'say_no_or_boundary'
  | 'difficult_conversation'
  | 'post_decision_doubt'
  | 'fear_disappointing'
  | 'against_others_expectations'
  | 'other';

export type SupportChoiceKey =
  | 'organizing_question'
  | 'remember_own_decision'
  | 'separate_control'
  | 'concrete_criterion'
  | 'direct_no_roundabout'
  | 'confront_repeated_pattern'
  | 'discover_with_me'
  | 'other';

export type ChoiceOption<TKey extends string> = { key: TKey; label: string };

export const DESIRED_CHANGE_OPTIONS: readonly ChoiceOption<DesiredChangeKey>[] = [
  { key: 'trust_decisions', label: 'Confiar más en mis decisiones' },
  { key: 'less_approval', label: 'Dejar de buscar tanta aprobación' },
  { key: 'less_overthinking', label: 'Darle menos vueltas a las cosas' },
  { key: 'boundaries_less_guilt', label: 'Poner límites sin sentir tanta culpa' },
  { key: 'say_what_i_think', label: 'Decir lo que pienso aunque pueda incomodar' },
  { key: 'act_without_total_certainty', label: 'Actuar sin necesitar sentirme 100% segura' },
  { key: 'less_external_opinion', label: 'Dejar de cambiar de opinión por lo que otros piensan' },
  { key: 'other', label: 'Otro' },
];

export const CONTEXT_OPTIONS: readonly ChoiceOption<ContextChoiceKey>[] = [
  { key: 'important_decision', label: 'Cuando tengo que tomar una decisión importante' },
  { key: 'disagreement', label: 'Cuando alguien no está de acuerdo conmigo' },
  { key: 'say_no_or_boundary', label: 'Cuando tengo que decir que no o poner un límite' },
  { key: 'difficult_conversation', label: 'Antes de una conversación incómoda' },
  { key: 'post_decision_doubt', label: 'Después de decidir, empiezo a cuestionarme' },
  { key: 'fear_disappointing', label: 'Cuando siento que puedo decepcionar a alguien' },
  { key: 'against_others_expectations', label: 'Cuando quiero hacer algo distinto de lo que otros esperan' },
  { key: 'other', label: 'Otro' },
];

export const SUPPORT_OPTIONS: readonly ChoiceOption<SupportChoiceKey>[] = [
  { key: 'organizing_question', label: 'Que me hagan una pregunta que me ayude a ordenar lo que pienso' },
  { key: 'remember_own_decision', label: 'Que me recuerden lo que yo ya había decidido' },
  { key: 'separate_control', label: 'Que me ayuden a separar lo que depende de mí de lo que no' },
  { key: 'concrete_criterion', label: 'Que me den un criterio concreto para mirar la situación' },
  { key: 'direct_no_roundabout', label: 'Que me hablen de forma directa, sin rodeos' },
  { key: 'confront_repeated_pattern', label: 'Que me confronten cuando estoy volviendo al mismo patrón' },
  { key: 'discover_with_me', label: 'Prefiero que lo descubras conmigo' },
  { key: 'other', label: 'Otro' },
];

export const DESIRED_CHANGE_DIRECTION_KEYS: Record<Exclude<DesiredChangeKey, 'other'>, string> = {
  trust_decisions: 'trust_own_judgment',
  less_approval: 'less_validation',
  less_overthinking: 'custom',
  boundaries_less_guilt: 'hold_boundaries',
  say_what_i_think: 'say_what_i_mean',
  act_without_total_certainty: 'act_with_doubt',
  less_external_opinion: 'less_external_opinions',
};

export function optionLabel<TKey extends string>(options: readonly ChoiceOption<TKey>[], key: TKey) {
  return options.find(option => option.key === key)?.label ?? '';
}

export function normalizeChoiceText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function buildContextOriginal(labels: string[], customText: string) {
  return [...labels, customText].filter(Boolean).map(label => label.replace(/[.!?]+$/g, '')).join('. ') + '.';
}

export function buildContextSummary(labels: string[], customText: string) {
  return [...labels, customText].filter(Boolean).join(' · ').slice(0, 180);
}
