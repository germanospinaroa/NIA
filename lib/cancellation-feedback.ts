export const CANCELLATION_FEEDBACK_MAX_LENGTH = 2000;

export const CANCELLATION_REASONS = [
  { code: 'not_using_enough', label: 'No estoy usando NIA tanto como esperaba' },
  { code: 'not_enough_value', label: 'Los mensajes no me están aportando suficiente valor' },
  { code: 'not_personalized_enough', label: 'Los mensajes no se sienten suficientemente personalizados para mí' },
  { code: 'expected_something_different', label: 'Esperaba algo diferente de NIA' },
  { code: 'technical_problems', label: 'Tuve problemas técnicos' },
  { code: 'price', label: 'El precio no me funciona en este momento' },
  { code: 'just_testing', label: 'Solo quería probar NIA' },
  { code: 'no_longer_needed', label: 'Ya no necesito trabajar esto' },
  { code: 'other', label: 'Otra razón' },
] as const;

export type CancellationReasonCode = (typeof CANCELLATION_REASONS)[number]['code'] | 'prefer_not_to_say';

export function isCancellationReasonCode(value: unknown): value is CancellationReasonCode {
  return value === 'prefer_not_to_say' || CANCELLATION_REASONS.some(reason => reason.code === value);
}

export function normalizeFeedbackText(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}
