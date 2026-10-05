export type PsychologicalMovementRecord = {
  id?: string | null;
  topic?: string | null;
  mechanismId?: string | null;
  movement?: string | null;
  takeaway?: string | null;
  editorialIdea?: string | null;
  concept?: string | null;
  angle?: string | null;
  createdAt?: string | null;
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
};

const paths: Record<string, string[]> = {
  external_validation: ['external_validation:notice_the_consulting_pattern', 'external_validation:information_vs_delegating_decision', 'external_validation:define_decision_criterion', 'external_validation:set_reconsideration_threshold', 'external_validation:decide_with_sufficient_information', 'external_validation:review_outcome_without_self_punishment', 'external_validation:build_evidence_of_own_capacity'],
  uncertainty_clarification: ['uncertainty_clarification:name_the_concrete_question', 'uncertainty_clarification:identify_what_is_known', 'uncertainty_clarification:choose_a_sufficient_next_step', 'uncertainty_clarification:act_without_total_certainty'],
  decision_criteria: ['decision_criteria:name_the_decision_rule', 'decision_criteria:set_reconsideration_threshold', 'decision_criteria:decide_with_sufficient_information', 'decision_criteria:review_outcome_without_self_punishment'],
  implementation_intention: ['situational_preparation:notice_the_trigger', 'situational_preparation:prepare_an_alternative_response', 'situational_preparation:practice_the_response_in_context', 'situational_preparation:review_what_happened'],
  progress_monitoring: ['progress_monitoring:notice_two_observations', 'progress_monitoring:name_what_changed', 'progress_monitoring:build_evidence_of_own_capacity'],
};

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
  // Prefer the declared movement. Takeaways often contain words from a
  // neighboring phase (for example “criterio” and “decidir”) and must not
  // silently reclassify the intervention.
  const declaredMovement = normalized(record.movement);
  const text = declaredMovement || normalized([record.takeaway, record.editorialIdea, record.concept, record.angle].join(' '));
  if (mechanism === 'external_validation') {
    if (/(umbral|reconsider|cambiar|revisar)/.test(text)) return 'external_validation:set_reconsideration_threshold';
    // An explicit criterion-setting movement is a later phase. If the declared
    // movement is about defining a rule/condition for choosing, do not let the
    // mere presence of "información" or "decidir" collapse it into the earlier
    // information-vs-decision phase.
    const explicitCriterion = /(regla|condicion|definir|criterio|cumplir|elegir|opcion|prioridad|suficiente)/.test(text);
    const consultationLanguage = /(opinion|informacion|dato|consult|escuch|pregunt|consejo)/.test(text);
    if (explicitCriterion && !consultationLanguage) return 'external_validation:define_decision_criterion';
    // Information-vs-decision is the earlier phase when the declared movement
    // actually describes handling an external opinion or consultation.
    if (/(informacion|dato|opinion|consult|escuch|pregunt|consejo)/.test(text) && /(decision|decidir|criterio|ceder|delegar|entregar|sustit)/.test(text)) return 'external_validation:information_vs_delegating_decision';
    if (explicitCriterion) return 'external_validation:define_decision_criterion';
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

export function derivePsychologicalProgression(input: { goal: string; pattern: string; mechanismId: string; history: PsychologicalMovementRecord[] }): PsychologicalProgression {
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
  const available = path.slice(highestCompletedIndex + 1).filter(key => !completed.includes(key));
  const next = path.slice(highestCompletedIndex + 1).find(key => !completed.includes(key)) ?? (available[0] ?? (path.length ? path[path.length - 1] : null));
  const current = recent[0] ?? 'not_started';
  const reason = next ? completed.length ? `El movimiento reciente ${current} ya fue trabajado; el siguiente paso útil es ${next}.` : `No hay un movimiento histórico suficiente; se propone iniciar con ${next}.` : 'No existe una secuencia controlada para este mecanismo; conservar la decisión del planner sin inventar una fase.';
  return { current_goal: input.goal, current_pattern: input.pattern, current_psychological_state: current, completed_movements: completed, recent_movements: recent, available_next_movements: available, blocked_repeated_movements: blocked, recent_takeaways: takeaways, next_recommended_movement: next, progression_reason: reason };
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
