import type { VoiceStyle } from './mvp';

export type InterventionFunction = 'remind' | 'anticipate' | 'reframe' | 'distinguish' | 'interrupt' | 'permit' | 'anchor' | 'redirect';
export type InterventionStructure = 'context_does_not_mean' | 'before_then' | 'you_can_without' | 'distinguish_between' | 'when_then' | 'specific_permission';
export type AuditStatus = 'approved' | 'rejected';

export type InterventionBrief = {
  firstName?: string;
  desiredChange: string;
  currentContext: string;
  contextDomain?: string | null;
  userLanguage?: string[];
  recentInterventions?: string[];
  recentConcepts?: string[];
  recentAngles?: string[];
  recentStructures?: string[];
  forbiddenLanguage?: string[];
  preferredLanguage?: string[];
  voiceStyle?: VoiceStyle | null;
  function?: InterventionFunction;
  feedbackDimension?: FeedbackDimension;
};

export type CandidateAudit = {
  status: AuditStatus;
  reasons: string[];
  checks: Record<string, boolean | number | string>;
  similarInterventions: string[];
  similarity: number;
};

export type InterventionCandidate = {
  text: string;
  function: InterventionFunction;
  concept: string;
  angle: string;
  structure: InterventionStructure;
  audit?: CandidateAudit;
};

export type FeedbackDimension = 'relevance' | 'specificity' | 'angle' | 'context' | 'moment';
export type FeedbackSpec = {
  question: string;
  dimension: FeedbackDimension;
  options: { key: string; label: string }[];
};

const forbidden = ['sostener', 'mantener tu dirección', 'volver a tu intención', 'honrar tu proceso', 'alineada'];
const clichés = ['confía en ti', 'cree en ti', 'tú puedes', 'eres suficiente', 'sé tu mejor versión', 'todo estará bien', 'no tengas miedo', 'recuerda quién eres', 'escucha tu corazón', 'da el primer paso', 'sal de tu zona de confort', 'todo pasa por algo'];
const chatbotOpeners = ['entiendo que', 'es normal sentirse', 'recuerda que está bien', 'quizás podrías', 'te invito a reflexionar', 'es importante que', 'date permiso para'];

export const interventionConfig = {
  semanticDuplicateThreshold: 0.52,
  conceptSaturationThreshold: 2,
  recentHistoryWindow: 8,
  structureReuseWindow: 3,
  maxGenerationRounds: 3,
} as const;

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(value: string) { return new Set(normalize(value).split(' ').filter(token => token.length > 2)); }

export function lexicalSimilarity(a: string, b: string) {
  const left = tokens(a); const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let shared = 0; left.forEach(token => { if (right.has(token)) shared += 1; });
  return shared / (left.size + right.size - shared);
}

function situationClause(context: string) {
  const cleaned = context.trim().replace(/[.?!]+$/, '');
  return cleaned.replace(/^(me cuesta|me pasa|cuando|especialmente cuando|en situaciones donde)\s+/i, '').trim();
}

function desiredConcept(desired: string) {
  const value = normalize(desired);
  if (value.includes('limite') || value.includes('decir que no')) return 'boundaries';
  if (value.includes('aprobacion') || value.includes('opinion')) return 'approval_seeking';
  if (value.includes('decid') || value.includes('criterio')) return 'self_trust';
  if (value.includes('impuls')) return 'pause_before_reacting';
  if (value.includes('tranquil')) return 'decision_calm';
  if (value.includes('error') || value.includes('sale mal')) return 'self_response_after_failure';
  return 'desired_change';
}

function conceptFromText(value: string) {
  const text = normalize(value);
  if (text.includes('aprobacion') || text.includes('criterio') || text.includes('decid')) return 'self_trust';
  if (text.includes('limite') || text.includes('decir que no')) return 'boundaries';
  if (text.includes('error') || text.includes('salio mal')) return 'self_response_after_failure';
  return null;
}

function chooseFunction(brief: InterventionBrief, index: number): InterventionFunction {
  if (brief.function) return brief.function;
  const functions: InterventionFunction[] = ['anticipate', 'distinguish', 'reframe'];
  return functions[index % functions.length];
}

export function generateCandidates(brief: InterventionBrief): InterventionCandidate[] {
  const clause = situationClause(brief.currentContext);
  const concept = desiredConcept(brief.desiredChange);
  const candidates: InterventionCandidate[] = [
    { text: `Que ${clause || 'aparezca esta situación'} no significa que tengas que abandonar lo que decidiste.`, function: chooseFunction(brief, 0), concept, angle: 'context_without_abandonment', structure: 'context_does_not_mean' },
    { text: `Antes de responder cuando ${clause || 'aparezca la duda'}, distingue entre necesitar información y necesitar aprobación.`, function: chooseFunction(brief, 1), concept: concept === 'self_trust' ? 'approval_seeking' : concept, angle: 'information_vs_approval', structure: 'distinguish_between' },
    { text: `Puedes escuchar lo que ocurra en ${clause || 'ese momento'} sin convertirlo automáticamente en tu decisión.`, function: chooseFunction(brief, 2), concept, angle: 'listen_without_replacing_own_view', structure: 'you_can_without' },
  ];
  return candidates;
}

export function auditCandidate(candidate: InterventionCandidate, brief: InterventionBrief): CandidateAudit {
  const text = normalize(candidate.text);
  const recent = (brief.recentInterventions ?? []).slice(0, interventionConfig.recentHistoryWindow);
  const similarities = recent.map(previous => ({ previous, score: Math.max(lexicalSimilarity(text, previous), conceptFromText(text) && conceptFromText(previous) === conceptFromText(text) ? 0.6 : 0) })).filter(item => item.score >= interventionConfig.semanticDuplicateThreshold);
  const conceptCount = (brief.recentConcepts ?? []).filter(value => value === candidate.concept).length;
  const structureCount = (brief.recentStructures ?? []).slice(0, interventionConfig.structureReuseWindow).filter(value => value === candidate.structure).length;
  const reasons: string[] = [];
  const hasContext = clauseHasSignal(candidate.text, brief.currentContext);
  const isGeneric = !hasContext || candidate.text.includes('tu dirección') || candidate.text.includes('tu intención');
  const hasCliche = clichés.some(value => text.includes(normalize(value)));
  const hasForbidden = [...forbidden, ...(brief.forbiddenLanguage ?? [])].some(value => text.includes(normalize(value)));
  const hasChatbotLanguage = chatbotOpeners.some(value => text.startsWith(normalize(value)));
  const length = text.split(' ').filter(Boolean).length;
  if (isGeneric) reasons.push('generic_or_missing_user_context');
  if (hasCliche) reasons.push('generic_motivation');
  if (hasForbidden) reasons.push('forbidden_framework_language');
  if (hasChatbotLanguage) reasons.push('chatbot_language');
  if (similarities.length) reasons.push('semantic_duplicate');
  if (conceptCount >= interventionConfig.conceptSaturationThreshold) reasons.push('concept_saturated');
  if (structureCount >= 1) reasons.push('recent_structure_reuse');
  if (length < 8 || length > 35) reasons.push('unacceptable_length');
  if (candidate.text.includes('?')) reasons.push('unnecessary_question');
  const checks = {
    fits_desired_change: Boolean(brief.desiredChange), fits_current_context: hasContext,
    uses_real_user_context: hasContext, feels_personal: hasContext,
    duplicate_literal: recent.some(previous => normalize(previous) === text), duplicate_semantic: similarities.length === 0,
    repeated_concept: conceptCount < interventionConfig.conceptSaturationThreshold, repeated_angle: !(brief.recentAngles ?? []).slice(0, interventionConfig.recentHistoryWindow).includes(candidate.angle),
    repeated_structure: structureCount === 0, one_clear_idea: !candidate.text.includes(' y ') || candidate.text.split(' y ').length <= 2,
    clear_function: Boolean(candidate.function), specific: hasContext, concrete: hasContext, natural: !hasChatbotLanguage,
    sounds_human: !hasChatbotLanguage, sounds_like_nia: !hasCliche && !hasForbidden, sounds_specific_to_user: hasContext,
    generic_motivation: !hasCliche, chatbot_language: !hasChatbotLanguage, coaching_language: !hasChatbotLanguage,
    therapy_language: true, cliché: !hasCliche, unnecessary_advice: true, absolute_claim: true,
    psychological_interpretation: true, acceptable_length: length >= 8 && length <= 35, no_unnecessary_question: !candidate.text.includes('?'),
    no_multi_step_instruction: true, no_paragraph: !candidate.text.includes('\n'), no_repetition: similarities.length === 0,
  };
  return { status: reasons.length ? 'rejected' : 'approved', reasons, checks, similarInterventions: similarities.map(item => item.previous), similarity: similarities[0]?.score ?? 0 };
}

function clauseHasSignal(text: string, context: string) {
  const contextTokens = [...tokens(situationClause(context))].filter(token => token.length > 3);
  if (!contextTokens.length) return false;
  const textTokens = tokens(text);
  return contextTokens.some(token => textTokens.has(token));
}

export function selectCandidate(brief: InterventionBrief) {
  const candidates = generateCandidates(brief).map(candidate => ({ ...candidate, audit: auditCandidate(candidate, brief) }));
  const approved = candidates.find(candidate => candidate.audit?.status === 'approved');
  return { selected: approved, candidates };
}

export function feedbackFor(candidate: Pick<InterventionCandidate, 'function' | 'concept'>): FeedbackSpec {
  if (candidate.function === 'anticipate' || candidate.function === 'reframe') return { question: '¿Esto sigue teniendo que ver con lo que estás viviendo?', dimension: 'relevance', options: [{ key: 'relevant', label: 'Sí, totalmente' }, { key: 'almost', label: 'Se parece, pero no es eso' }, { key: 'context_changed', label: 'Mi situación cambió' }] };
  if (candidate.function === 'distinguish') return { question: '¿Este enfoque te sirve?', dimension: 'angle', options: [{ key: 'angle_works', label: 'Sí, sigue por aquí' }, { key: 'angle_change', label: 'La idea sirve, prueba otro ángulo' }, { key: 'not_me', label: 'Esto no me representa' }] };
  return { question: '¿Esto se sintió realmente tuyo?', dimension: 'specificity', options: [{ key: 'specific', label: 'Sí' }, { key: 'wording_off', label: 'La idea sí, pero la frase no' }, { key: 'too_general', label: 'Sonó demasiado general' }] };
}

export function learningFromFeedback(dimension: FeedbackDimension, option: string) {
  if (option === 'context_changed') return { signal: 'current_context_status', value: 'changed', confidence: 1, triggerRecalibration: true };
  if (option === 'wording_off') return { signal: 'wording_quality', value: 'negative', preserveConcept: true, avoidRecentWordingPattern: true };
  if (option === 'too_general') return { signal: 'specificity', value: 'low', increaseContextWeight: true };
  if (option === 'angle_change') return { signal: 'angle_quality', value: 'negative', preserveConcept: true, avoidAngleForRecentWindow: true };
  if (option === 'relevant' || option === 'specific' || option === 'angle_works') return { signal: dimension, value: 'high', confidence: 1 };
  return { signal: dimension, value: option, confidence: 0.5 };
}

export function contextStatusForDays(lastConfirmedAt: string | null | undefined, startedAt: string | null | undefined, now = new Date()) {
  const reference = lastConfirmedAt || startedAt;
  if (!reference) return false;
  return now.getTime() - new Date(reference).getTime() >= 7 * 24 * 60 * 60 * 1000;
}

export type InterventionResult = { intervention: InterventionCandidate; interventionId: string; feedback: FeedbackSpec; candidates: InterventionCandidate[] };
