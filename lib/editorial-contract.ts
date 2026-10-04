export const canonicalEditorialTypes = [
  'context_mirror', 'reframe', 'distinction', 'precision_question',
  'situational_preparation', 'micro_action', 'brief_interrupt',
  'recovery', 'longitudinal_evidence', 'recalibration',
] as const;
export type CanonicalEditorialType = typeof canonicalEditorialTypes[number];

export const functionalEmotions = ['alivio', 'claridad', 'determinacion', 'seguridad', 'curiosidad', 'impulso', 'calma', 'confrontacion'] as const;
export type FunctionalEmotion = typeof functionalEmotions[number];
export const directivenessLevels = ['reflective', 'suggestive', 'directive'] as const;
export type Directiveness = typeof directivenessLevels[number];
export const closingTypes = ['none', 'question', 'choice', 'micro_action', 'prepared_phrase', 'operational_reminder', 'recognition'] as const;
export type ClosingType = typeof closingTypes[number];
export type SaturationState = 'normal' | 'watch' | 'saturated' | 'paused';

export type EditorialSignature = {
  topic?: string | null;
  situation?: string | null;
  intention?: string | null;
  interventionType?: CanonicalEditorialType | string | null;
  insightId?: string | null;
  editorialTake?: string | null;
  editorialIdea?: string | null;
  angle?: string | null;
  experienceType?: string | null;
  functionalEmotion?: FunctionalEmotion | string | null;
  directiveness?: Directiveness | string | null;
  closingType?: ClosingType | string | null;
  actionId?: string | null;
  territoryKey?: string | null;
  structure?: string | null;
  depth?: string | null;
  psychologicalContract?: Record<string, unknown> | null;
  mechanismId?: string | null;
  mechanismConfidence?: string | null;
  interventionPurpose?: string | null;
  psychologicalMove?: string | null;
  expectedMovement?: string | null;
  takeaway?: string | null;
  optionalAction?: string | null;
  whyNow?: string | null;
  riskFlags?: string[] | null;
};

export type EditorialGates = {
  truth: boolean;
  safety: boolean;
  scope: boolean;
  one_move: boolean;
  memory_integrity: boolean;
};

export type EditorialScore = {
  relevance: number;
  specificity: number;
  psychological_utility: number;
  memory_integrity: number;
  autonomy: number;
  naturalness: number;
  functional_novelty: number;
  timing_fit: number;
  closing_fit: number;
  total: number;
};

export function sameDayRepetition(candidate: EditorialSignature, previous?: EditorialSignature | null) {
  if (!previous) return { repeated: false, reasons: [] as string[] };
  const reasons: string[] = [];
  if (candidate.insightId && candidate.insightId === previous.insightId) reasons.push('insight');
  if (candidate.editorialTake && candidate.editorialTake === previous.editorialTake) reasons.push('editorial_take');
  if (candidate.experienceType && candidate.experienceType === previous.experienceType) reasons.push('experience');
  if (candidate.functionalEmotion && candidate.functionalEmotion === previous.functionalEmotion) reasons.push('functional_emotion');
  if (candidate.interventionType && candidate.interventionType === previous.interventionType) reasons.push('movement');
  if (candidate.actionId && candidate.actionId === previous.actionId) reasons.push('action');
  if (candidate.closingType && candidate.closingType !== 'none' && candidate.closingType === previous.closingType) reasons.push('closing');
  if (candidate.structure && candidate.structure === previous.structure) reasons.push('structure');
  return { repeated: reasons.length >= 2, reasons };
}

export function hasLongitudinalEvidence(refs?: string[] | null) {
  return new Set((refs ?? []).map(value => value.trim()).filter(Boolean)).size >= 2;
}

export function territoryState(rows: Array<{ territoryKey?: string | null; createdAt?: string; hasNewEvidence?: boolean; hasNewSituation?: boolean; hasNewDecision?: boolean; hasNewBehaviour?: boolean }>, territory: string, now = new Date()): SaturationState {
  const cutoff = now.getTime() - 7 * 86400000;
  const recent = rows.filter(row => row.territoryKey === territory && (!row.createdAt || new Date(row.createdAt).getTime() >= cutoff));
  if (recent.length < 3) return recent.length === 2 ? 'watch' : 'normal';
  if (recent.some(row => row.hasNewEvidence || row.hasNewSituation || row.hasNewDecision || row.hasNewBehaviour)) return 'watch';
  return 'paused';
}

export function editorialFamilyKey(signature: Pick<EditorialSignature, 'interventionType' | 'experienceType' | 'functionalEmotion'>) {
  return [signature.interventionType, signature.experienceType, signature.functionalEmotion].filter(Boolean).join(':') || 'unknown';
}

export function evaluateEditorialGates(input: {
  text: string;
  hasTruthfulContext: boolean;
  hasUnsupportedContext: boolean;
  hasTherapyLanguage: boolean;
  hasPsychologicalInterpretation: boolean;
  movement?: string | null;
  editorialType?: string | null;
  longitudinalEvidenceRefs?: string[] | null;
}) : EditorialGates & { reasons: string[] } {
  const text = input.text.toLowerCase();
  const scopeViolation = /\b(soy terapeuta|diagnostico|diagnóstico|tratamiento clínico|sustituyo a|sustituye ayuda profesional|autoridad clínica)\b/i.test(text);
  const safety = !input.hasTherapyLanguage && !input.hasPsychologicalInterpretation && !/\b(dependes de mi|solo me necesitas|abandona tu tratamiento)\b/i.test(text);
  const oneMove = Boolean(input.movement?.trim()) && !/[|;]/.test(input.movement ?? '') && !/\b(y|además)\b.{0,30}\b(y|además)\b/i.test(input.movement ?? '');
  const longitudinal = input.editorialType !== 'longitudinal_evidence' || hasLongitudinalEvidence(input.longitudinalEvidenceRefs);
  const truth = input.hasTruthfulContext && !input.hasUnsupportedContext;
  const reasons: string[] = [];
  if (!truth) reasons.push('truth_gate');
  if (!safety) reasons.push('safety_gate');
  if (scopeViolation) reasons.push('scope_gate');
  if (!oneMove) reasons.push('one_move_gate');
  if (!input.hasTruthfulContext || input.hasUnsupportedContext) reasons.push('memory_integrity');
  if (!longitudinal) reasons.push('longitudinal_evidence_insufficient');
  return { truth, safety, scope: !scopeViolation, one_move: oneMove, memory_integrity: truth, reasons };
}

export function scoreEditorialCandidate(input: {
  gates: EditorialGates;
  relevant: boolean;
  specific: boolean;
  useful: boolean;
  novel: boolean;
  natural: boolean;
  autonomy: boolean;
  timing: boolean;
  closingFit: boolean;
}): EditorialScore | null {
  if (!Object.values(input.gates).every(Boolean)) return null;
  const score: EditorialScore = {
    relevance: input.relevant ? 20 : 0,
    specificity: input.specific ? 15 : 0,
    psychological_utility: input.useful ? 15 : 0,
    memory_integrity: 10,
    autonomy: input.autonomy ? 10 : 0,
    naturalness: input.natural ? 10 : 0,
    functional_novelty: input.novel ? 10 : 0,
    timing_fit: input.timing ? 5 : 0,
    closing_fit: input.closingFit ? 5 : 0,
    total: 0,
  };
  score.total = Object.entries(score).filter(([key]) => key !== 'total').reduce((sum, [, value]) => sum + value, 0);
  return score;
}
