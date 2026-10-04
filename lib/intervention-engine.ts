import type { VoiceStyle } from './mvp';
import type { CanonicalEditorialType, ClosingType, Directiveness, EditorialGates, EditorialScore, FunctionalEmotion } from './editorial-contract.ts';
import { evaluateEditorialGates, sameDayRepetition, scoreEditorialCandidate } from './editorial-contract.ts';

export type InterventionFunction = 'remind' | 'anticipate' | 'reframe' | 'distinguish' | 'interrupt' | 'permit' | 'anchor' | 'redirect';
export type InterventionStructure = 'context_does_not_mean' | 'before_then' | 'you_can_without' | 'distinguish_between' | 'when_then' | 'specific_permission';
export type AuditStatus = 'approved' | 'rejected';
export type EditorialInterventionType = 'brief_insight' | 'reflection' | 'practical_guidance' | 'tool' | 'step_by_step' | 'example' | 'deep_dive';
export type EditorialExperienceType = 'brief_insight' | 'reflection' | 'encouragement' | 'perspective_shift' | 'practical_tool' | 'exercise' | 'challenge' | 'question' | 'check_in' | 'validation' | 'direct_push' | 'concrete_example' | 'story_or_scenario' | 'feedback_request';
export type EditorialDepth = 'brief' | 'medium' | 'deep';
export type EditorialBlockType = 'idea' | 'recognition' | 'explanation' | 'insight' | 'question' | 'tool' | 'step' | 'example' | 'action' | 'closing';
export type EditorialBlock = { type: EditorialBlockType; text: string };
export type EditorialPlan = { strategy: string; recommended_topic: string; topic_reason: string; preferred_or_recommended_intervention_type: EditorialInterventionType; recommended_experience_type?: EditorialExperienceType; recommended_depth: EditorialDepth; recent_topics_to_avoid: string[]; recent_angles_to_avoid: string[]; recent_concepts_to_avoid: string[]; recent_editorial_ideas_to_avoid?: string[]; recent_experiences_to_avoid?: EditorialExperienceType[]; diversity_notes: string; recommended_editorial_type?: CanonicalEditorialType; recommended_functional_emotion?: FunctionalEmotion; recommended_directiveness?: Directiveness; recommended_closing_type?: ClosingType };

export type SemanticMatch = {
  intervention_id: string;
  text: string;
  similarity: number;
  concept?: string | null;
  angle?: string | null;
  function?: string | null;
  structure?: string | null;
  created_at?: string;
};

export type SemanticRelationship = 'duplicate' | 'same_theme_different_angle' | 'distinct';
export type SemanticJudgeMatch = {
  intervention_id: string;
  relationship: SemanticRelationship;
  same_actionable_idea: boolean;
  same_angle: boolean;
  reason: string;
};
export type SemanticJudgeResult = { matches: SemanticJudgeMatch[] };
export type SemanticSimilarityBand = 'below_review' | 'review_range' | 'high_similarity';

export type LearningSignal = {
  signal: string;
  value: Record<string, unknown> | string | null;
  confidence?: number | null;
  expires_at?: string | null;
  created_at?: string;
  decayWeight?: number;
};

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
  recentEditorialIdeas?: string[];
  recentEditorialTakes?: string[];
  recentExperienceTypes?: EditorialExperienceType[];
  forbiddenLanguage?: string[];
  preferredLanguage?: string[];
  voiceStyle?: VoiceStyle | null;
  function?: InterventionFunction;
  feedbackDimension?: FeedbackDimension;
  relevantSituations?: string[];
  recurringPatterns?: string[];
  successfulPatterns?: string[];
  rejectedPatterns?: string[];
  learningSignals?: LearningSignal[];
  interventionFunction?: InterventionFunction;
  feedbackGoal?: FeedbackDimension | 'specific_context' | 'new_angle' | 'new_wording' | 'recalibration';
  generationConstraints?: string[];
  communicationPreference?: 'idea' | 'practical' | 'structured' | 'adaptive';
  editorialPlan?: EditorialPlan;
  sameDayEditorialSignature?: { topic?: string | null; interventionType?: string | null; editorialTake?: string | null; editorialIdea?: string | null; experienceType?: string | null; functionalEmotion?: string | null; directiveness?: string | null; closingType?: string | null; actionId?: string | null; insightId?: string | null; structure?: string | null };
};

export type CalibrationOption = { id: string; label: string; context_value: string };
export type CalibrationPrompt = {
  question: string;
  options: CalibrationOption[];
  allow_free_text: true;
  reason: 'too_general' | 'missing_context' | 'context_changed' | 'desired_change_changed';
  missing_context_field: 'current_context' | 'active_context' | 'relevant_situations' | 'desired_change';
};

export type ContextSufficiency = {
  sufficient: boolean;
  evidence: string[];
  missing: ('current_context' | 'active_context' | 'relevant_situations')[];
};

export type CandidateAudit = {
  status: AuditStatus;
  approved: boolean;
  reasons: string[];
  hard_failures: string[];
  warnings: string[];
  checks: Record<string, boolean | number | string>;
  similarInterventions: string[];
  similarity: number;
  semanticStatus?: 'pass' | 'review' | 'fail';
  similarityBand?: SemanticSimilarityBand;
  semanticJudge?: SemanticJudgeResult;
  deterministic?: CandidateAudit;
  semantic?: CandidateAudit;
  llm?: Record<string, unknown>;
};

export type InterventionCandidate = {
  text: string;
  topic?: string;
  interventionType?: EditorialInterventionType;
  depth?: EditorialDepth;
  blocks?: EditorialBlock[];
  editorialTake?: string;
  editorialIdea?: string;
  experienceType?: EditorialExperienceType;
  territoryKey?: string;
  exercisePresent?: boolean;
  questionPresent?: boolean;
  feedbackRequested?: boolean;
  recognition?: string;
  explanation?: string;
  insight?: string;
  steps?: string[];
  action?: string;
  closing?: string;
  function: InterventionFunction;
  concept: string;
  conceptKey?: string;
  angle: string;
  structure: InterventionStructure;
  editorialType?: CanonicalEditorialType;
  signal?: string;
  evidenceDirection?: string;
  movement?: string;
  openingClosing?: string;
  situation?: string;
  intention?: string;
  insightId?: string;
  functionalEmotion?: FunctionalEmotion;
  directiveness?: Directiveness;
  closingType?: ClosingType;
  actionId?: string;
  longitudinalEvidenceRefs?: string[];
  editorialScore?: EditorialScore | null;
  gateResults?: EditorialGates;
  sameDayRepetition?: boolean;
  saturationState?: 'normal' | 'watch' | 'saturated' | 'paused';
  regenerationReason?: string;
  audit?: CandidateAudit;
};

export type FeedbackDimension = 'relevance' | 'specificity' | 'angle' | 'context' | 'moment' | 'tone' | 'help_type' | 'action';
export type FeedbackSpec = {
  question: string;
  dimension: FeedbackDimension;
  options: { key: string; label: string }[];
};

const forbidden = ['sostener', 'mantener tu dirección', 'volver a tu intención', 'honrar tu proceso', 'alineada'];
const clichés = ['confía en ti', 'cree en ti', 'tú puedes', 'eres suficiente', 'sé tu mejor versión', 'todo estará bien', 'no tengas miedo', 'recuerda quién eres', 'escucha tu corazón', 'da el primer paso', 'sal de tu zona de confort', 'todo pasa por algo'];
const chatbotOpeners = ['entiendo que', 'es normal sentirse', 'recuerda que está bien', 'quizás podrías', 'te invito a reflexionar', 'es importante que', 'date permiso para'];
const performativeCoachingPatterns = [
  /\bte invito a (confiar|creer|conectar|trabajar en ti|transformarte|cambiar tu vida)\b/,
  /\bdate permiso para (confiar|creer|ser|conectar|vivir|avanzar)\b/,
  /\brecuerda que tu tienes (todas )?las respuestas\b/,
  /\bconecta con tu poder\b/,
  /\bes momento de (creer|confiar|ser|convertirte)\b/,
  /\bconfia en que eres capaz\b/,
  /\bdeberias trabajar en (tu )?(seguridad|autoestima|confianza)\b/,
  /\bpreguntate por que todavia no confias en ti\b/,
  /\bhaz un trabajo profundo para confiar en ti\b/,
  /\bpermitete ser la persona que quieres ser\b/,
];
const roboticOrAbstractPatterns = [
  /\bevalua la calidad de la objecion\b/,
  /\bdefine un umbral (?:verificable|de reconsideracion)\b/,
  /\bidentifica que informacion modifica tus criterios\b/,
  /\bsepara evidencia de preferencia\b/,
  /\bsepara la evidencia de la preferencia\b/,
  /\bestablece un mecanismo de validacion\b/,
  /\binformacion disponible al momento de decidir\b/,
  /\bumbral de reconsideracion\b/,
  /\breconsiderar tu criterio\b/,
];

export const interventionConfig = {
  semanticDuplicateThreshold: 0.52,
  vectorDuplicateThreshold: 0.63,
  semanticReviewThreshold: 0.58,
  conceptSaturationThreshold: 2,
  recentHistoryWindow: 8,
  structureReuseWindow: 3,
  maxGenerationRounds: 3,
  learningSignalHalfLifeDays: 30,
} as const;

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function hasPerformativeCoachingVoice(value: string) {
  const text = normalize(value);
  return performativeCoachingPatterns.some(pattern => pattern.test(text));
}

export function hasRoboticOrAbstractLanguage(value: string) {
  const text = normalize(value);
  return roboticOrAbstractPatterns.some(pattern => pattern.test(text));
}

export function firstReadComprehension(value: string) {
  const text = normalize(value);
  if (!text || hasRoboticOrAbstractLanguage(text)) return false;
  const words = text.split(' ').filter(Boolean);
  const nominalizations = words.filter(word => /(cion|sion|miento|mientos|idad|dades|encia|encias)$/.test(word)).length;
  return nominalizations < 4 || nominalizations / Math.max(words.length, 1) < 0.18;
}

export function editorialIdeaKey(value: string) {
  const text = normalize(value);
  if (!text) return '';
  if (/(confia|confiar|criterio).*(cuestion|dud|desacuerd|opinion)|no.*(entreg|camb|aband).*decision.*(dud|desacuerd|opinion)|decision.*(sigue siendo tuya|sigue siendo propia)/.test(text)) return 'disagreement_is_not_evidence_of_error';
  if (/(alguien|otra persona|opinion|desacuerdo|duda).*(equivoc|error|mala decision)|equivoc.*(desacuerdo|opinion)/.test(text)) return 'disagreement_is_not_evidence_of_error';
  if (/(escuchar|pedir|preguntar).*(opinion|consejo).*(ceder|entregar|dejar|decidir|decision|criterio)|opinion.*(instruccion|orden)|entregar.*decision/.test(text)) return 'seek_input_without_transferring_decision';
  if (/(dato nuevo|informacion nueva|evidencia).*(cambiar|revisar|modificar).*(decision|criterio)|cambiar.*(decision|criterio).*(dato|evidencia)/.test(text)) return 'new_evidence_can_change_a_decision';
  if (/(pausa|esperar|no responder).*(duda|incomodidad|reaccion)|incomodidad.*(cambio|decision)/.test(text)) return 'pause_separates_reaction_from_change';
  if (/(seguridad|completamente segura|claridad).*(mover|hacer|actuar)|claridad.*(segura|mover)/.test(text)) return 'movement_does_not_require_complete_certainty';
  return text.split(' ').filter(word => word.length > 3).slice(0, 8).join('_');
}

export function sameEditorialIdea(candidate: Pick<InterventionCandidate, 'editorialIdea' | 'editorialTake' | 'text'>, previous: string) {
  const candidateKey = editorialIdeaKey(candidate.editorialIdea || candidate.editorialTake || candidate.text);
  const previousKey = editorialIdeaKey(previous);
  return Boolean(candidateKey && previousKey && candidateKey === previousKey) || lexicalSimilarity(candidate.editorialIdea || candidate.editorialTake || candidate.text, previous) >= 0.62;
}

export function canonicalConceptKey(value: string) {
  const text = normalize(value);
  if (/(aprobacion|aprobación|opinion|opinión|validacion|validación|criterio ajeno|decepcionar)/i.test(text)) return 'external_validation';
  if (/(limite|límite|decir que no|rechazar|negar|si automatico|sí automático|aceptar por culpa)/i.test(text)) return 'boundaries';
  if (/(criterio|decidir|decision|decisión|duda de mi)/i.test(text)) return 'self_trust';
  if (/(impuls|pausa|responder rapido|responder rápido|reaccion)/i.test(text)) return 'pause_before_reacting';
  if (/(error|fallo|salio mal|salió mal|equivoc)/i.test(text)) return 'self_response_after_failure';
  return text.split(' ').filter(Boolean).slice(0, 4).join('_') || 'desired_change';
}

function tokens(value: string) { return new Set(normalize(value).split(' ').filter(token => token.length > 2)); }

/**
 * Repairs only detectable formatting emitted by a candidate generator.
 * It never adds, removes, or rewrites words.
 */
export function formatCandidateText(text: string) {
  return text.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n');
}

export function lexicalSimilarity(a: string, b: string) {
  const left = tokens(a); const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let shared = 0; left.forEach(token => { if (right.has(token)) shared += 1; });
  return shared / (left.size + right.size - shared);
}

const genericContexts = new Set(['trabajo', 'pareja', 'familia', 'amigos', 'relaciones', 'decisiones', 'vida personal']);
const contextStopwords = new Set(['al', 'algo', 'ante', 'con', 'como', 'cuando', 'cual', 'cuales', 'de', 'del', 'desde', 'el', 'ella', 'en', 'es', 'esa', 'ese', 'esta', 'este', 'la', 'las', 'lo', 'los', 'me', 'mi', 'mis', 'no', 'para', 'por', 'que', 'se', 'si', 'sin', 'su', 'sus', 'te', 'tu', 'tus', 'un', 'una', 'uno', 'y', 'ya']);

function stemContextToken(value: string) {
  return value.replace(/(amientos?|imientos?|aciones?|iciones?|mente|ando|iendo|isteis|iste|amos|emos|imos|es|as|os|en|an|s)$/i, '').replace(/(a|o|e)$/i, '');
}

const contextFamilies: Array<{ key: string; patterns: RegExp[] }> = [
  { key: 'questioning', patterns: [/cuestion/, /dud/, /desacuerd/, /objec/, /critic/, /opinion/, /pon.*duda/] },
  { key: 'decision', patterns: [/decision/, /decid/, /criterio/, /eleg/, /opcion/] },
  { key: 'boundaries', patterns: [/limit/, /decir.*no/, /negar/, /aceptar/] },
  { key: 'reaction', patterns: [/respuest/, /reaccion/, /impuls/, /responder/] },
  { key: 'failure', patterns: [/error/, /fall/, /equivoc/, /salio.*mal/] },
];

function contextEvidence(value: string) {
  const normalized = normalize(value);
  const words = normalized.split(' ').filter(word => word.length > 2 && !contextStopwords.has(word));
  const stems = new Set(words.map(stemContextToken).filter(word => word.length > 2));
  const families = new Set(contextFamilies.filter(family => family.patterns.some(pattern => pattern.test(normalized))).map(family => family.key));
  return { stems, families };
}

function contextEvidenceMatches(source: string, candidate: string) {
  const sourceEvidence = contextEvidence(source);
  const candidateEvidence = contextEvidence(candidate);
  const sharedStems = [...sourceEvidence.stems].filter(token => candidateEvidence.stems.has(token)).length;
  const sharedFamilies = [...sourceEvidence.families].filter(family => candidateEvidence.families.has(family)).length;
  return sharedStems >= 2 || sharedFamilies >= 2 || (sharedStems >= 1 && sharedFamilies >= 1);
}

function meaningfulContext(value: string | null | undefined) {
  if (!value) return false;
  const normalized = normalize(value);
  const words = normalized.split(' ').filter(word => word.length > 2);
  return words.length >= 4 || (words.length >= 2 && !genericContexts.has(normalized));
}

export function hasSufficientContext(brief: Pick<InterventionBrief, 'currentContext' | 'relevantSituations' | 'recurringPatterns' | 'userLanguage' | 'recentInterventions' | 'learningSignals'>): ContextSufficiency {
  const evidence: string[] = [];
  if (meaningfulContext(brief.currentContext)) evidence.push('current_context');
  if ((brief.relevantSituations ?? []).some(meaningfulContext)) evidence.push('relevant_situations');
  if ((brief.recurringPatterns ?? []).some(meaningfulContext)) evidence.push('recurring_patterns');
  if ((brief.userLanguage ?? []).some(meaningfulContext)) evidence.push('user_language');
  const signalContext = (brief.learningSignals ?? []).some(signal => typeof signal.value === 'object' && signal.value && meaningfulContext(typeof signal.value.context === 'string' ? signal.value.context : null));
  if (signalContext) evidence.push('feedback_context');
  const missing: ContextSufficiency['missing'] = [];
  if (!evidence.includes('current_context') && !evidence.includes('feedback_context')) missing.push('current_context');
  if (!evidence.includes('relevant_situations') && !evidence.includes('recurring_patterns') && !evidence.includes('user_language')) missing.push('relevant_situations');
  return { sufficient: evidence.length > 0, evidence, missing };
}

const unambiguousPersonalContextAnchors = [
  'jefe', 'jefa', 'pareja', 'novio', 'novia', 'esposo', 'esposa',
  'amigo', 'amiga', 'cliente', 'colega', 'madre', 'padre',
  'hijo', 'hija',
];
const ambiguousPersonalContextPatterns = [
  /\b(en|de|del|con|para) (tu|mi|su) (trabajo|casa|proyecto|equipo|familia|reunion)\b/,
  /\b(tu|mi|su) (trabajo|casa|proyecto|equipo|familia|reunion)\b/,
  /\b(en|durante|despues de|antes de) la reunion\b/,
  /\b(en|de|del) casa\b/,
];

function personalContextAnchorMatches(candidate: string) {
  const matches = unambiguousPersonalContextAnchors.filter(anchor => new RegExp(`\\b${anchor}\\b`).test(candidate));
  for (const pattern of ambiguousPersonalContextPatterns) if (pattern.test(candidate)) matches.push(pattern.source);
  return matches;
}

export function hasUnsupportedPersonalContext(text: string, brief: InterventionBrief) {
  const source = normalize([
    brief.currentContext,
    ...(brief.relevantSituations ?? []),
    ...(brief.recurringPatterns ?? []),
    ...(brief.userLanguage ?? []),
    ...(brief.learningSignals ?? []).flatMap(signal => typeof signal.value === 'object' && signal.value && typeof signal.value.context === 'string' ? [signal.value.context] : []),
  ].join(' '));
  const candidate = normalize(text);
  return personalContextAnchorMatches(candidate).some(anchor => {
    if (anchor.startsWith('\\b')) {
      const sourceMatches = personalContextAnchorMatches(source);
      return !sourceMatches.includes(anchor);
    }
    return !source.includes(normalize(anchor));
  });
}

/** Detects repeated ideas inside one composed candidate without judging historical similarity. */
export function hasInternalRepetition(parts: string[]) {
  const normalizedParts = parts.filter((part): part is string => typeof part === 'string').map(part => normalize(part)).filter(Boolean);
  for (let left = 0; left < normalizedParts.length; left += 1) {
    for (let right = left + 1; right < normalizedParts.length; right += 1) {
      if (lexicalSimilarity(normalizedParts[left], normalizedParts[right]) >= 0.4) return true;
    }
  }
  return false;
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

function chooseFunction(brief: InterventionBrief, index: number): InterventionFunction {
  if (brief.function) return brief.function;
  const functions: InterventionFunction[] = ['anticipate', 'distinguish', 'reframe'];
  return functions[index % functions.length];
}

export function generateCandidates(brief: InterventionBrief): InterventionCandidate[] {
  const clause = situationClause(brief.currentContext);
  const concept = desiredConcept(brief.desiredChange);
  const focus = clause || 'aparezca una situación difícil';
  const candidates: InterventionCandidate[] = [
    { text: `Cuando aparece ${focus}, es fácil confundir una opinión nueva con una razón para abandonar lo que querías. Pero escuchar a alguien y cambiar de criterio son dos cosas distintas.\n\nAntes de decidir otra vez, prueba esta pausa:\n1. ¿Qué pensaba yo antes de escuchar esta opinión?\n2. ¿Apareció un dato nuevo o solo apareció la duda?\n3. Si nadie hubiera opinado, ¿seguiría pensando lo mismo?\n\nHoy vuelve primero a tu respuesta inicial. Si todavía tiene sentido, puedes escuchar sin dejar de decidir tú.`, function: chooseFunction(brief, 0), concept, angle: 'context_without_abandonment', structure: 'context_does_not_mean' },
    { text: `Cuando ${focus}, quizá no necesitas otra respuesta: quizá necesitas separar información de aprobación. Que alguien cuestione lo que pensabas puede hacer que busques certeza fuera, aunque la decisión ya tuviera razones tuyas.\n\nHazlo así la próxima vez:\n1. Anota en una frase por qué lo habías elegido.\n2. Escribe qué dato concreto cambió.\n3. Si no cambió ningún dato, espera antes de cambiar de opinión.\n\nEsta vez prueba a pedir información solo si la necesitas, no permiso para confiar en tu criterio.`, function: chooseFunction(brief, 1), concept: concept === 'self_trust' ? 'approval_seeking' : concept, angle: 'information_vs_approval', structure: 'distinguish_between' },
    { text: `En ${focus}, no tienes que resolverlo todo en el instante. Una pausa breve puede devolverte la diferencia entre lo que realmente cambió y lo que se volvió incómodo.\n\nPrueba este gesto concreto:\n1. Respira y no respondas de inmediato.\n2. Di: “Lo voy a pensar y te digo”.\n3. Revisa si tu decisión sigue encajando con lo que necesitabas al tomarla.\n\nHoy ensaya la frase en voz baja. Tener una salida pequeña te permite escuchar sin convertir la reacción de otra persona en una orden.`, function: chooseFunction(brief, 2), concept, angle: 'pause_before_replacing_own_view', structure: 'you_can_without' },
  ];
  const insights = [
    'Escuchar una opinión y convertirla en una razón para cambiar son cosas distintas.',
    'Una opinión puede pedir precisión sin convertirse por sí sola en una razón para cambiar.',
    'Una pausa separa el cambio real de la incomodidad inmediata.',
  ];
  return candidates.map((candidate, index) => ({ ...candidate, insight: insights[index] }));
}

export function auditCandidate(candidate: InterventionCandidate, brief: InterventionBrief): CandidateAudit {
  const text = normalize(candidate.text);
  const recent = (brief.recentInterventions ?? []).slice(0, interventionConfig.recentHistoryWindow);
  const similarities = recent.map(previous => ({ previous, score: lexicalSimilarity(text, previous) })).filter(item => item.score >= interventionConfig.semanticDuplicateThreshold);
  const conceptKey = candidate.conceptKey ?? canonicalConceptKey(candidate.concept);
  const conceptCount = (brief.recentConcepts ?? []).map(canonicalConceptKey).filter(value => value === conceptKey).length;
  const structureCount = (brief.recentStructures ?? []).slice(0, interventionConfig.structureReuseWindow).filter(value => value === candidate.structure).length;
  const reasons: string[] = [];
  const warnings: string[] = [];
  const hasContext = hasContextEvidence(candidate, brief);
  const isGeneric = !hasContext || candidate.text.includes('tu dirección') || candidate.text.includes('tu intención');
  const hasCliche = clichés.some(value => text.includes(normalize(value)));
  const hasForbidden = [...forbidden, ...(brief.forbiddenLanguage ?? [])].some(value => text.includes(normalize(value)));
  const hasChatbotLanguage = chatbotOpeners.some(value => text.startsWith(normalize(value)));
  const hasCoachingLanguage = hasPerformativeCoachingVoice(candidate.text);
  const hasRoboticLanguage = hasRoboticOrAbstractLanguage(candidate.text);
  const firstReadPasses = firstReadComprehension(candidate.text);
  const hasTherapyLanguage = /\b(terapia|terapeut|trauma|sanar|curar|diagnost|ansiedad|depresion)\b/i.test(text);
  const hasUnnecessaryAdvice = /\b(deberias|debes|haz esto|empieza por|intenta)\b/i.test(text);
  const hasAbsoluteClaim = /\b(siempre|nunca|todo|nada|sin duda|garantiza)\b/i.test(text);
  const hasPsychologicalInterpretation = /\b(en el fondo|tu herida|tu trauma|tu miedo es|eres una persona|eres perezos[ao]|no respondes porque eres|te autosaboteas|por miedo a)\b/i.test(text);
  const hasUnsupportedContext = hasUnsupportedPersonalContext(candidate.text, brief);
  const repeatedEditorialIdea = (brief.recentEditorialIdeas ?? []).some(previous => sameEditorialIdea(candidate, previous));
  const sameDay = sameDayRepetition({ topic: candidate.topic, interventionType: candidate.editorialType, editorialTake: candidate.editorialTake, editorialIdea: candidate.editorialIdea, experienceType: candidate.experienceType, functionalEmotion: candidate.functionalEmotion, directiveness: candidate.directiveness, closingType: candidate.closingType, actionId: candidate.actionId, insightId: candidate.insightId, territoryKey: candidate.territoryKey, structure: candidate.structure, depth: candidate.depth }, brief.sameDayEditorialSignature);
  const hasParagraph = candidate.text.includes('\n');
  const wordCount = text.split(' ').filter(Boolean).length;
  const structuredParts = [candidate.recognition, candidate.explanation, candidate.insight].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
  const blocks = candidate.blocks ?? [];
  const hasValue = blocks.length > 0 ? blocks.some(block => block.text.trim().length > 0 && ['idea', 'insight', 'explanation', 'question', 'tool', 'example', 'action', 'step'].includes(block.type)) : Boolean(candidate.text.trim());
  const hasInsight = blocks.length > 0 ? hasValue : typeof candidate.insight === 'string' && Boolean(candidate.insight.trim()) && !hasInternalRepetition(structuredParts);
  if (isGeneric) reasons.push('generic_or_missing_user_context');
  if (hasCliche) reasons.push('generic_motivation');
  if (hasForbidden) reasons.push('forbidden_framework_language');
  if (hasChatbotLanguage) reasons.push('chatbot_language');
  if (hasCoachingLanguage) reasons.push('coaching_language');
  if (hasRoboticLanguage) reasons.push('robotic_or_abstract_language');
  if (hasTherapyLanguage) reasons.push('therapy_language');
  if (hasUnnecessaryAdvice) reasons.push('unnecessary_advice');
  if (hasAbsoluteClaim) warnings.push('absolute_claim');
  if (hasPsychologicalInterpretation) reasons.push('psychological_interpretation');
  if (hasUnsupportedContext) reasons.push('unsupported_personal_context');
  if (repeatedEditorialIdea) reasons.push('same_editorial_idea');
  if (sameDay.repeated) reasons.push('same_day_repetition');
  if (!hasParagraph && blocks.length === 0) reasons.push('missing_structure');
  if (blocks.length === 0 && (wordCount < 45 || wordCount > 180)) reasons.push('insufficient_value_length');
  if (!hasInsight) reasons.push('empty_value');
  if (candidate.interventionType === 'step_by_step' && blocks.filter(block => block.type === 'step').length < 2) reasons.push('missing_steps_for_type');
  if (candidate.interventionType === 'tool' && !blocks.some(block => block.type === 'tool')) reasons.push('missing_tool_for_type');
  if (similarities.length) reasons.push('semantic_duplicate');
  if (conceptCount >= interventionConfig.conceptSaturationThreshold) warnings.push('concept_saturated');
  const internalParts = blocks.length ? blocks.map(block => block.text) : [candidate.recognition!, candidate.explanation!, candidate.insight!, ...(candidate.steps ?? []), candidate.action ?? '', candidate.closing ?? ''];
  if (internalParts.length >= 2 && hasInternalRepetition(internalParts)) reasons.push('internal_repetition');
  const gateResults = evaluateEditorialGates({
    text: candidate.text,
    hasTruthfulContext: hasContext,
    hasUnsupportedContext,
    hasTherapyLanguage,
    hasPsychologicalInterpretation,
    movement: candidate.movement ?? candidate.function,
    editorialType: candidate.editorialType,
    longitudinalEvidenceRefs: candidate.longitudinalEvidenceRefs,
  });
  if (candidate.editorialType === 'longitudinal_evidence' && gateResults.reasons.includes('longitudinal_evidence_insufficient')) reasons.push('longitudinal_evidence_insufficient');
  if (!gateResults.safety) reasons.push('safety_gate');
  if (!gateResults.scope) reasons.push('scope_gate');
  if (!gateResults.one_move) reasons.push('one_move_gate');
  if (!gateResults.memory_integrity && !reasons.includes('unsupported_personal_context')) reasons.push('memory_integrity');
  if (structureCount >= 1) warnings.push('recent_structure_reuse');
  if (!firstReadPasses && !hasRoboticLanguage) warnings.push('first_read_comprehension');
  const excludedAngles = (brief.learningSignals ?? []).flatMap(signal => {
    if (signal.signal !== 'angle_quality' || typeof signal.value !== 'object' || !signal.value) return [];
    const angle = signal.value.angle;
    return typeof angle === 'string' ? [angle] : [];
  });
  if (excludedAngles.includes(candidate.angle)) reasons.push('rejected_recent_angle');
  const requiresSpecificContext = (brief.learningSignals ?? []).some(signal => signal.signal === 'specificity' && typeof signal.value === 'object' && signal.value?.value === 'low');
  if (requiresSpecificContext && !hasContext) reasons.push('low_specificity');
  const checks: Record<string, boolean | number | string> = {
    fits_desired_change: Boolean(brief.desiredChange), fits_current_context: hasContext, concept_key: conceptKey,
    uses_real_user_context: hasContext, feels_personal: hasContext,
    duplicate_literal: recent.some(previous => normalize(previous) === text), duplicate_semantic: similarities.length === 0,
    repeated_concept: conceptCount < interventionConfig.conceptSaturationThreshold, repeated_angle: !(brief.recentAngles ?? []).slice(0, interventionConfig.recentHistoryWindow).includes(candidate.angle),
    repeated_structure: structureCount === 0, one_clear_idea: !candidate.text.includes(' y ') || candidate.text.split(' y ').length <= 2,
    clear_function: Boolean(candidate.function), specific: hasContext, concrete: hasContext, natural: !hasChatbotLanguage && !hasCoachingLanguage && !hasRoboticLanguage,
    sounds_human: !hasChatbotLanguage && !hasCoachingLanguage && !hasRoboticLanguage, sounds_like_nia: !hasCliche && !hasForbidden, sounds_specific_to_user: hasContext,
    generic_motivation: !hasCliche, chatbot_language: !hasChatbotLanguage, coaching_language: !hasCoachingLanguage,
    therapy_language: !hasTherapyLanguage, cliché: !hasCliche, unnecessary_advice: !hasUnnecessaryAdvice, absolute_claim: !hasAbsoluteClaim,
    psychological_interpretation: !hasPsychologicalInterpretation, unsupported_personal_context: !hasUnsupportedContext, first_read_comprehension: firstReadPasses, robotic_or_abstract_language: !hasRoboticLanguage, editorial_novelty: !repeatedEditorialIdea, acceptable_length: wordCount >= 45 && wordCount <= 180, no_unnecessary_question: true,
    value_structure: hasValue, no_multi_step_instruction: true, no_paragraph: !hasParagraph, no_repetition: similarities.length === 0 && !reasons.includes('internal_repetition'), internal_repetition: !reasons.includes('internal_repetition'),
  };
  const gates: EditorialGates = { truth: gateResults.truth, safety: gateResults.safety, scope: gateResults.scope, one_move: gateResults.one_move, memory_integrity: gateResults.memory_integrity };
  const editorialScore = scoreEditorialCandidate({
    gates,
    relevant: Boolean(brief.desiredChange),
    specific: hasContext,
    useful: hasValue,
    novel: similarities.length === 0 && !repeatedEditorialIdea,
    natural: firstReadPasses && !hasChatbotLanguage && !hasCoachingLanguage && !hasRoboticLanguage,
    autonomy: !hasAbsoluteClaim,
    timing: !structureCount && !sameDay.repeated,
    closingFit: true,
  });
  if (editorialScore && editorialScore.total < 60) reasons.push('editorial_score_too_low');
  if (editorialScore) checks.editorial_score = editorialScore.total;
  checks.truth_gate = gateResults.truth; checks.safety_gate = gateResults.safety; checks.scope_gate = gateResults.scope; checks.one_move_gate = gateResults.one_move; checks.memory_integrity = gateResults.memory_integrity; checks.same_day_repetition = !sameDay.repeated;
  candidate.gateResults = { truth: gateResults.truth, safety: gateResults.safety, scope: gateResults.scope, one_move: gateResults.one_move, memory_integrity: gateResults.memory_integrity };
  candidate.editorialScore = editorialScore;
  return { status: reasons.length ? 'rejected' : 'approved', approved: reasons.length === 0, reasons, hard_failures: reasons, warnings, checks, similarInterventions: similarities.map(item => item.previous), similarity: similarities[0]?.score ?? 0 };
}

export function auditSemanticCandidate(candidate: InterventionCandidate, matches: SemanticMatch[], semanticJudge?: SemanticJudgeResult): CandidateAudit {
  const orderedMatches = [...matches].sort((a, b) => b.similarity - a.similarity);
  const relevantMatches = orderedMatches.filter(match => match.similarity >= interventionConfig.semanticReviewThreshold).slice(0, 3);
  const strongest = relevantMatches[0]?.similarity ?? 0;
  const similarityBand: SemanticSimilarityBand = strongest < interventionConfig.semanticReviewThreshold ? 'below_review' : strongest < interventionConfig.vectorDuplicateThreshold ? 'review_range' : 'high_similarity';
  const candidateConceptKey = candidate.conceptKey ?? canonicalConceptKey(candidate.concept);
  const conceptMatches = matches.filter(match => match.concept && canonicalConceptKey(match.concept) === candidateConceptKey).length;
  const structureMatches = relevantMatches.filter(match => match.angle === candidate.angle).length;
  const reasons: string[] = [];
  const warnings: string[] = [];
  const duplicateMatches = semanticJudge?.matches.filter(match => match.relationship === 'duplicate') ?? [];
  if (relevantMatches.length > 0 && !semanticJudge) reasons.push('semantic_judge_required');
  if (duplicateMatches.length > 0) reasons.push('semantic_duplicate');
  if (conceptMatches >= interventionConfig.conceptSaturationThreshold) warnings.push('concept_saturated');
  if (structureMatches >= interventionConfig.structureReuseWindow) reasons.push('semantic_structure_reuse');
  if (similarityBand === 'review_range') warnings.push('semantic_review');
  if (semanticJudge?.matches.some(match => match.relationship === 'same_theme_different_angle')) warnings.push('same_theme_different_angle');
  if (similarityBand === 'below_review') warnings.push('distinct_by_retrieval');
  const semanticStatus = reasons.length ? 'fail' : 'pass';
  return {
    status: semanticStatus === 'pass' ? 'approved' : 'rejected',
    approved: semanticStatus === 'pass',
    reasons,
    hard_failures: reasons,
    warnings,
    checks: { semantic_duplicate: !reasons.includes('semantic_duplicate'), concept_saturation: !reasons.includes('concept_saturated'), structure_repetition: !reasons.includes('semantic_structure_reuse'), semantic_judge_ran: relevantMatches.length === 0 || Boolean(semanticJudge), similarity_band: similarityBand },
    similarInterventions: relevantMatches.map(match => match.text),
    similarity: strongest,
    semanticStatus,
    similarityBand,
    semanticJudge,
  };
}

export function applyLearningSignals(brief: InterventionBrief, signals: LearningSignal[], now = new Date()): InterventionBrief {
  const active = signals.filter(signal => !signal.expires_at || new Date(signal.expires_at).getTime() > now.getTime()).map(signal => {
    const ageDays = signal.created_at ? Math.max(0, now.getTime() - new Date(signal.created_at).getTime()) / (24 * 60 * 60 * 1000) : 0;
    return { ...signal, decayWeight: Math.exp(-ageDays / interventionConfig.learningSignalHalfLifeDays) };
  });
  const rejectedPatterns = [...(brief.rejectedPatterns ?? [])];
  const successfulPatterns = [...(brief.successfulPatterns ?? [])];
  const generationConstraints = [...(brief.generationConstraints ?? [])];
  for (const signal of active) {
    const value = typeof signal.value === 'object' && signal.value ? signal.value : {};
    if (signal.signal === 'wording_quality' && value.value === 'negative') rejectedPatterns.push(`wording:${String(value.structure ?? 'recent')}`);
    if (signal.signal === 'angle_quality' && value.value === 'negative') rejectedPatterns.push(`angle:${String(value.angle ?? 'recent')}`);
    if (signal.signal === 'help_type_quality' && value.value === 'negative') {
      rejectedPatterns.push(`family:${String(value.family ?? 'recent')}`);
      generationConstraints.push('Cambia deliberadamente la función editorial; no respondas con otra reformulación del mismo tipo de ayuda.');
    }
    if (signal.signal === 'action_feedback' && value.value === 'no_longer_relevant') generationConstraints.push('No reutilices esta microacción: la situación que la justificaba ya no está vigente.');
    if (signal.signal === 'specificity' && value.value === 'high') successfulPatterns.push('specific_context');
    if (signal.signal === 'relevance' && value.value === 'high') successfulPatterns.push('relevant_context');
    if (signal.signal === 'specificity' && value.value === 'low') generationConstraints.push('Ancla la intervención a una situación real confirmada por la usuaria; no introduzcas hechos personales nuevos ni formulaciones universales.');
    if (signal.signal === 'wording_quality' && value.value === 'negative') generationConstraints.push('Conserva el concepto si es pertinente, pero cambia la formulación y evita la estructura señalada.');
    if (signal.signal === 'angle_quality' && value.value === 'negative') generationConstraints.push('Conserva el concepto si es pertinente, pero utiliza un ángulo distinto al rechazado.');
  }
  const latest = active[0];
  let feedbackGoal = brief.feedbackGoal;
  if (latest?.signal === 'specificity' && typeof latest.value === 'object' && latest.value?.value === 'low') feedbackGoal = 'specific_context';
  if (latest?.signal === 'wording_quality') feedbackGoal = 'new_wording';
  if (latest?.signal === 'angle_quality') feedbackGoal = 'new_angle';
  if (latest?.signal === 'help_type_quality') feedbackGoal = 'new_angle';
  if (latest?.signal === 'current_context_status' && typeof latest.value === 'object' && latest.value?.value === 'changed') feedbackGoal = 'recalibration';
  if (latest?.signal === 'desired_change_status' && typeof latest.value === 'object' && latest.value?.value === 'changed') feedbackGoal = 'recalibration';
  return { ...brief, learningSignals: active, rejectedPatterns, successfulPatterns, generationConstraints: [...new Set(generationConstraints)], feedbackGoal };
}

export function hasContextEvidence(candidate: Pick<InterventionCandidate, 'text' | 'recognition'>, brief: Pick<InterventionBrief, 'currentContext' | 'relevantSituations' | 'desiredChange' | 'contextDomain'>) {
  const candidateText = [candidate.recognition, candidate.text].filter(Boolean).join(' ');
  const primarySources = [brief.currentContext, ...(brief.relevantSituations ?? [])].filter((value): value is string => Boolean(value?.trim()));
  if (primarySources.some(source => contextEvidenceMatches(source, candidateText))) return true;
  const secondarySources = [brief.contextDomain, brief.desiredChange].filter((value): value is string => Boolean(value?.trim()));
  return secondarySources.some(source => contextEvidenceMatches(source, candidateText) && contextEvidence(candidateText).families.size >= 1);
}

export function selectCandidate(brief: InterventionBrief) {
  const candidates = generateCandidates(brief).map(candidate => ({ ...candidate, audit: auditCandidate(candidate, brief) }));
  const approved = candidates.find(candidate => candidate.audit?.status === 'approved');
  return { selected: approved, candidates };
}

export function feedbackFor(candidate: Pick<InterventionCandidate, 'function' | 'concept'>): FeedbackSpec {
  const contextChanged = { key: 'context_changed', label: 'Mi situación cambió' };
  const desiredChangeChanged = { key: 'desired_change_changed', label: 'Ya no quiero trabajar esto' };
  if (candidate.function === 'anticipate' || candidate.function === 'reframe') return { question: '¿Esto sigue teniendo que ver con lo que estás viviendo?', dimension: 'relevance', options: [{ key: 'relevant', label: 'Sí, totalmente' }, { key: 'almost', label: 'Se parece, pero no es eso' }, contextChanged, desiredChangeChanged] };
  if (candidate.function === 'distinguish') return { question: '¿Este enfoque te sirve?', dimension: 'angle', options: [{ key: 'angle_works', label: 'Sí, sigue por aquí' }, { key: 'angle_change', label: 'La idea sirve, prueba otro ángulo' }, { key: 'not_me', label: 'Esto no me representa' }, contextChanged, desiredChangeChanged] };
  return { question: '¿Esto se sintió realmente tuyo?', dimension: 'specificity', options: [{ key: 'specific', label: 'Sí' }, { key: 'wording_off', label: 'La idea sí, pero la frase no' }, { key: 'too_general', label: 'Sonó demasiado general' }, { key: 'tone_off', label: 'El tono no me sirvió' }, { key: 'help_type_change', label: 'Quiero otro tipo de ayuda' }, contextChanged, desiredChangeChanged] };
}

export function learningFromFeedback(dimension: FeedbackDimension, option: string) {
  if (option === 'context_changed') return { signal: 'current_context_status', value: 'changed', confidence: 1, triggerRecalibration: true };
  if (option === 'desired_change_changed') return { signal: 'desired_change_status', value: 'changed', confidence: 1, triggerRecalibration: true };
  if (option === 'wording_off') return { signal: 'wording_quality', value: 'negative', preserveConcept: true, avoidRecentWordingPattern: true };
  if (option === 'too_general') return { signal: 'specificity', value: 'low', increaseContextWeight: true };
  if (option === 'angle_change') return { signal: 'angle_quality', value: 'negative', preserveConcept: true, avoidAngleForRecentWindow: true };
  if (option === 'tone_off') return { signal: 'tone_quality', value: 'negative', confidence: 1 };
  if (option === 'help_type_change') return { signal: 'help_type_quality', value: 'negative', confidence: 1, triggerFunctionChange: true };
  if (option === 'done' || option === 'not_done' || option === 'no_longer_relevant') return { signal: 'action_feedback', value: option, confidence: 1 };
  if (option === 'relevant' || option === 'specific' || option === 'angle_works') return { signal: dimension, value: 'high', confidence: 1 };
  return { signal: dimension, value: option, confidence: 0.5 };
}

export function contextStatusForDays(lastConfirmedAt: string | null | undefined, startedAt: string | null | undefined, now = new Date()) {
  const reference = lastConfirmedAt || startedAt;
  if (!reference) return false;
  return now.getTime() - new Date(reference).getTime() >= 7 * 24 * 60 * 60 * 1000;
}

export type InterventionResult = { intervention: InterventionCandidate; interventionId: string; feedback: FeedbackSpec; candidates: InterventionCandidate[] };
