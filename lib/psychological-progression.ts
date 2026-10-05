import { getMovementTargetGuidance } from './movement-expression.ts';

export type PsychologicalMovementRecord = {
  id?: string | null;
  topic?: string | null;
  mechanismId?: string | null;
  psychologicalMovementKey?: string | null;
  movement?: string | null;
  takeaway?: string | null;
  editorialIdea?: string | null;
  concept?: string | null;
  angle?: string | null;
  text?: string | null;
  createdAt?: string | null;
};

export type PsychologicalContinuity = {
  previousDeliveredMovement: string | null;
  previousDeliveredTakeaway: string | null;
  previousDeliveredMessage: string | null;
  continuityGuidance: string[];
};

export type PsychologicalProgression = {
  current_goal: string;
  current_pattern: string;
  current_psychological_state: string;
  completed_movements: string[];
  recent_movements: string[];
  available_next_movements: string[];
  blocked_repeated_movements: string[];
  recent_takeaways: string[];
  next_recommended_movement: string | null;
  progression_reason: string;
  theoretical_next_movement: string | null;
  ineligible_next_movements: string[];
  pending_conditional_movements: string[];
  continuity: PsychologicalContinuity;
};

export const PSYCHOLOGICAL_MOVEMENT_PATHS: Record<string, string[]> = {
  external_validation: ['external_validation:notice_the_consulting_pattern', 'external_validation:information_vs_delegating_decision', 'external_validation:define_decision_criterion', 'external_validation:set_reconsideration_threshold', 'external_validation:decide_with_sufficient_information', 'external_validation:review_outcome_without_self_punishment', 'external_validation:build_evidence_of_own_capacity'],
  uncertainty_clarification: ['uncertainty_clarification:name_the_concrete_question', 'uncertainty_clarification:identify_what_is_known', 'uncertainty_clarification:choose_a_sufficient_next_step', 'uncertainty_clarification:act_without_total_certainty'],
  decision_criteria: ['decision_criteria:name_the_decision_rule', 'decision_criteria:set_reconsideration_threshold', 'decision_criteria:decide_with_sufficient_information', 'decision_criteria:review_outcome_without_self_punishment'],
  implementation_intention: ['situational_preparation:notice_the_trigger', 'situational_preparation:prepare_an_alternative_response', 'situational_preparation:practice_the_response_in_context', 'situational_preparation:review_what_happened'],
  progress_monitoring: ['progress_monitoring:notice_two_observations', 'progress_monitoring:name_what_changed', 'progress_monitoring:build_evidence_of_own_capacity'],
};
const paths = PSYCHOLOGICAL_MOVEMENT_PATHS;

function normalized(value: string | null | undefined) {
  return (value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
}

function comparableTokens(value: string | null | undefined) {
  return new Set(normalized(value).split(/\s+/).filter(token => token.length > 3));
}

function sameTakeaway(left: string | null | undefined, right: string | null | undefined) {
  const a = comparableTokens(left);
  const b = comparableTokens(right);
  if (!a.size || !b.size) return false;
  if (normalized(left) === normalized(right)) return true;
  const overlap = [...a].filter(token => b.has(token)).length;
  return overlap / Math.min(a.size, b.size) >= 0.75;
}

export function movementKey(record: PsychologicalMovementRecord): string | null {
  const mechanism = record.mechanismId?.trim();
  if (!mechanism) return null;
  const path = paths[mechanism] ?? [];
  const persistedKey = record.psychologicalMovementKey?.trim();
  if (persistedKey && path.includes(persistedKey)) return persistedKey;
  const declared = record.movement?.trim();
  if (declared && path.includes(declared)) return declared;
  // Prefer the declared movement. Takeaways often contain words from a
  // neighboring phase (for example “criterio” and “decidir”) and must not
  // silently reclassify the intervention.
  const declaredMovement = normalized(record.movement);
  const text = declaredMovement || normalized([record.takeaway, record.editorialIdea, record.concept, record.angle].join(' '));
  if (mechanism === 'external_validation') {
    if (/define[ _]+decision[ _]+criterion/.test(text)) return 'external_validation:define_decision_criterion';
    if (/set[ _]+reconsideration[ _]+threshold/.test(text)) return 'external_validation:set_reconsideration_threshold';
    if (/(umbral|reconsider|cambiar|revisar)/.test(text)) return 'external_validation:set_reconsideration_threshold';
    if (/(regla|suficiente|prioridad|pesa|peso|resultado|condicion|definir|identificar|nombrar|expresar|explicito|cumplir|convertir|traducir|senal|elegir|que .*criterio|criterio .*decidir)/.test(text)) return 'external_validation:define_decision_criterion';
    if (/(informacion|dato|opinion|consult|escuch|pregunt|consejo)/.test(text) && /(decision|decidir|criterio|ceder|delegar)/.test(text)) return 'external_validation:information_vs_delegating_decision';
    if (/(informacion|dato|opinion|consult|escuch|pregunt|consejo|registrar)/.test(text)) return 'external_validation:information_vs_delegating_decision';
    if (/(incertidumbre|seguridad|certeza|duda)/.test(text)) return 'external_validation:decide_with_sufficient_information';
    if (/(despues|resultado|salio|revisar|ocurrio)/.test(text)) return 'external_validation:review_outcome_without_self_punishment';
    return 'external_validation:notice_the_consulting_pattern';
  }
  if (mechanism === 'decision_criteria' && /(umbral|condicion|que cambiar|criterio)/.test(text)) return text.includes('umbral') ? 'decision_criteria:set_reconsideration_threshold' : 'decision_criteria:name_the_decision_rule';
  if (mechanism === 'uncertainty_clarification') {
    if (/(dato|conoc|informacion)/.test(text)) return 'uncertainty_clarification:identify_what_is_known';
    if (/(accion|paso|probar|hacer)/.test(text)) return 'uncertainty_clarification:choose_a_sufficient_next_step';
    return 'uncertainty_clarification:name_the_concrete_question';
  }
  if ((mechanism === 'implementation_intention' || mechanism === 'avoidance_preparation') && /(respuesta|frase|prepar|practic)/.test(text)) return text.includes('practic') ? 'situational_preparation:practice_the_response_in_context' : 'situational_preparation:prepare_an_alternative_response';
  if (mechanism === 'progress_monitoring') return /(cambio|avance|dos|ocasiones)/.test(text) ? 'progress_monitoring:name_what_changed' : 'progress_monitoring:notice_two_observations';
  return `${mechanism}:new_functional_move`;
}

function hasConfirmedEvent(evidence: string[]) {
  // A generic mention of “una decisión” is not evidence that a decision was
  // taken or that an outcome occurred. Require an observable past event or
  // its consequence before enabling review movements.
  return evidence.some(value => /(tom[eé]|decid[ií]|resultado|sali[oó]|ocurri[oó]|pas[oó]|despu[eé]s|desde entonces|esperaba|termin[oó])/i.test(value));
}

function hasConfirmedBehavior(evidence: string[]) {
  return evidence.some(value => /(suele|hace|hizo|tom[eé]|decid[ií]|pudo|pude|logr[oó]|actu[oó]|complet[oó]|avanz[oó]|primera respuesta|ya tiene|ya tienes|ya tenga|tenga)/i.test(value));
}

function movementEligible(key: string, history: PsychologicalMovementRecord[], evidence: string[]) {
  const guidance = getMovementTargetGuidance(key);
  if (!guidance) return { eligible: true, reason: null as string | null };
  const completed = history.map(movementKey).filter((value): value is string => Boolean(value));
  if (guidance.buildsOn && !completed.includes(guidance.buildsOn)) return { eligible: false, reason: `requires:${guidance.buildsOn}` };
  const requirements = guidance.evidenceRequirements;
  if (requirements.includes('base_context') && evidence.filter(Boolean).length === 0) return { eligible: false, reason: 'missing_base_context' };
  if (requirements.includes('delivered_learning') && !guidance.buildsOn) return { eligible: false, reason: 'missing_delivered_learning' };
  if (requirements.includes('confirmed_event') && !hasConfirmedEvent(evidence)) return { eligible: false, reason: 'missing_confirmed_event' };
  if (requirements.includes('confirmed_behavior') && !hasConfirmedBehavior(evidence)) return { eligible: false, reason: 'missing_confirmed_behavior' };
  return { eligible: true, reason: null as string | null };
}

export function isPsychologicalMovementEligible(key: string, history: PsychologicalMovementRecord[], evidence: string[]) {
  return movementEligible(key, history, evidence);
}

export function derivePsychologicalProgression(input: { goal: string; pattern: string; mechanismId: string; history: PsychologicalMovementRecord[]; confirmedEvidence?: string[] }): PsychologicalProgression {
  const path = paths[input.mechanismId] ?? [];
  const allRecords = input.history.map(record => ({ ...record, key: movementKey(record) })).filter(record => record.key);
  // A new mechanism starts its own trajectory. Historical work from another
  // mechanism remains useful context, but must not block its first movement.
  const records = path.length ? allRecords.filter(record => path.includes(record.key as string)) : allRecords;
  const recent = records.slice(0, 10).map(record => record.key as string);
  const completed = [...new Set(records.map(record => record.key as string))];
  const blocked = recent.length >= 2 ? [...new Set(recent.filter((key, index) => recent.indexOf(key) !== index))] : [];
  const takeaways = records.slice(0, 10).map(record => record.takeaway).filter((value): value is string => Boolean(value));
  const completedIndexes = completed.map(key => path.indexOf(key)).filter(index => index >= 0);
  const highestCompletedIndex = completedIndexes.length ? Math.max(...completedIndexes) : -1;
  // A later eligible movement may be selected while an earlier conditional
  // movement remains pending. Keep that branch visible without changing the
  // legacy behavior for histories that begin in the middle of a path.
  const pendingBeforeHighest = path.slice(0, highestCompletedIndex + 1).filter(key => !completed.includes(key));
  const pendingConditional = pendingBeforeHighest.filter(key => getMovementTargetGuidance(key)?.conditional === true);
  const afterHighest = path.slice(highestCompletedIndex + 1).filter(key => !completed.includes(key));
  const theoreticalCandidates = [...afterHighest, ...pendingConditional];
  const theoretical = theoreticalCandidates;
  const eligibility = theoretical.map(key => ({ key, ...movementEligible(key, records, input.confirmedEvidence ?? [input.pattern]) }));
  const available = eligibility.filter(item => item.eligible).map(item => item.key);
  const ineligible = eligibility.filter(item => !item.eligible).map(item => item.key);
  const next = available[0] ?? null;
  const theoreticalNext = theoretical[0] ?? null;
  const current = recent[0] ?? 'not_started';
  const trajectoryComplete = Boolean(path.length && completed.length >= path.length && available.length === 0);
  const reason = trajectoryComplete
    ? 'trajectory_complete'
    : next
      ? completed.length ? `El movimiento reciente ${current} ya fue trabajado; el siguiente movimiento elegible es ${next}.` : `No hay un movimiento histórico suficiente; se propone iniciar con ${next}.`
      : theoretical.length ? 'no_eligible_next_movement' : 'No existe una secuencia controlada para este mecanismo; conservar la decisión del planner sin inventar una fase.';
  const previous = records[0];
  const continuity: PsychologicalContinuity = {
    previousDeliveredMovement: previous ? movementKey(previous) : null,
    previousDeliveredTakeaway: previous?.takeaway ?? null,
    previousDeliveredMessage: previous?.text ?? null,
    continuityGuidance: previous ? ['Construye desde el aprendizaje entregado inmediatamente antes.', 'No afirmes que la persona lo aplicó o lo logró sin evidencia confirmada.', 'Evita reiniciar innecesariamente desde la introducción del contexto.'] : [],
  };
  return { current_goal: input.goal, current_pattern: input.pattern, current_psychological_state: current, completed_movements: completed, recent_movements: recent, available_next_movements: available, blocked_repeated_movements: blocked, recent_takeaways: takeaways, next_recommended_movement: next, progression_reason: reason, theoretical_next_movement: theoreticalNext, ineligible_next_movements: ineligible, pending_conditional_movements: pendingConditional, continuity };
}

export function progressionForCandidate(candidate: PsychologicalMovementRecord, progression?: PsychologicalProgression | null) {
  const key = movementKey(candidate);
  if (!progression || !key) return { approved: true, key, reason: null, validDeepening: false };
  // The first intervention establishes the trajectory. It must still pass the
  // psychological-value gates, but cannot be rejected for not matching a
  // later phase that does not exist yet.
  if (progression.completed_movements.length === 0) return { approved: true, key, reason: 'trajectory_start', validDeepening: false };
  const repeated = progression.recent_movements.includes(key) || progression.completed_movements.includes(key);
  if (repeated) return { approved: false, key, reason: 'repeated_movement', validDeepening: false };
  if (progression.recent_takeaways.some(previous => sameTakeaway(candidate.takeaway, previous))) return { approved: false, key, reason: 'repeated_takeaway', validDeepening: false };
  if (progression.next_recommended_movement && key !== progression.next_recommended_movement && progression.available_next_movements.length > 0) return { approved: false, key, reason: 'insufficient_progression', validDeepening: false };
  return { approved: true, key, reason: progression.next_recommended_movement === key ? 'valid_new_phase' : 'valid_deepening', validDeepening: progression.next_recommended_movement === key };
}
