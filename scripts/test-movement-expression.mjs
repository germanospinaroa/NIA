import assert from 'node:assert/strict';
import { evaluateMovementExpression, evaluateMovementValue, canonicalMovementExpressionKeys, getMovementTargetGuidance } from '../lib/movement-expression.ts';
import { PSYCHOLOGICAL_MOVEMENT_PATHS } from '../lib/psychological-progression.ts';

const positives = {
  'external_validation:notice_the_consulting_pattern': 'Observa el momento en que ya tienes una primera respuesta y aun así empiezas a pedir varias opiniones.',
  'external_validation:information_vs_delegating_decision': 'Escuchar información nueva no significa entregar la decisión a otra persona.',
  'external_validation:define_decision_criterion': 'Define qué condiciones tendría que cumplir una opción para que la valores.',
  'external_validation:set_reconsideration_threshold': 'Define qué dato tendría que cambiar para reconsiderar la decisión.',
  'external_validation:decide_with_sufficient_information': 'Puedes decidir cuando tengas información suficiente aunque no exista certeza total.',
  'external_validation:review_outcome_without_self_punishment': 'Después de decidir, revisa qué ocurrió y qué aprendiste sin convertir el resultado en culpa.',
  'external_validation:build_evidence_of_own_capacity': 'Registra la evidencia de las decisiones que pudiste tomar y de lo que lograste resolver.',
  'uncertainty_clarification:name_the_concrete_question': 'Para empezar, necesito saber qué dato concreto falta.',
  'uncertainty_clarification:identify_what_is_known': 'Separa lo que ya sabes de lo que todavía no sabes.',
  'uncertainty_clarification:choose_a_sufficient_next_step': 'Elige un siguiente paso suficiente para avanzar ahora.',
  'uncertainty_clarification:act_without_total_certainty': 'Puedes avanzar aunque todavía no tengas certeza completa.',
  'decision_criteria:name_the_decision_rule': 'Nombra la regla que usarás para decidir.',
  'decision_criteria:set_reconsideration_threshold': 'Define qué dato tendría que cambiar para reconsiderar.',
  'decision_criteria:decide_with_sufficient_information': 'Decide con la información suficiente, aunque no tengas certeza total.',
  'decision_criteria:review_outcome_without_self_punishment': 'Después de decidir, revisa el resultado sin castigarte.',
  'situational_preparation:notice_the_trigger': 'Nota la señal que aparece cuando ocurre esa situación.',
  'situational_preparation:prepare_an_alternative_response': 'Si ocurre X, prepara una respuesta alternativa.',
  'situational_preparation:practice_the_response_in_context': 'Practica la respuesta antes de que llegue el momento.',
  'situational_preparation:review_what_happened': 'Después, revisa qué pasó y cómo respondiste.',
  'progress_monitoring:notice_two_observations': 'Observa el patrón en dos ocasiones distintas.',
  'progress_monitoring:name_what_changed': 'Nombra qué cambió entre antes y después.',
  'progress_monitoring:build_evidence_of_own_capacity': 'Registra la evidencia de lo que pudiste hacer y resolver.',
};

assert.deepEqual(new Set(canonicalMovementExpressionKeys()), new Set(Object.values(PSYCHOLOGICAL_MOVEMENT_PATHS).flat()));
for (const key of canonicalMovementExpressionKeys()) {
  const guidance = getMovementTargetGuidance(key);
  assert.equal(guidance?.target, key);
  assert.ok(guidance?.purpose);
  assert.ok(guidance?.inScope.length);
  assert.ok(guidance?.valueKind);
  const path = Object.values(PSYCHOLOGICAL_MOVEMENT_PATHS).find(movements => movements.includes(key)) ?? [];
  if (path.at(-1) !== key) assert.ok(guidance?.outOfScope.length, `missing boundary: ${key}`);
}
for (const [key, text] of Object.entries(positives)) assert.equal(evaluateMovementExpression(key, text).targetExpressed, true, `positive failed: ${key}`);

assert.equal(evaluateMovementExpression('uncertainty_clarification:name_the_concrete_question', 'Haz algo aunque todavía no tengas certeza completa.').adjacentMovementDrift, true);
assert.equal(evaluateMovementExpression('uncertainty_clarification:name_the_concrete_question', 'Separa lo que ya sabes de lo que todavía no sabes.').adjacentMovementDrift, true);
assert.equal(evaluateMovementExpression('external_validation:notice_the_consulting_pattern', 'Define qué dato nuevo tendría que aparecer para reconsiderar tu decisión.').adjacentMovementDrift, true);
assert.equal(evaluateMovementExpression('external_validation:notice_the_consulting_pattern', 'Decide cuando la información disponible sea suficiente aunque no tengas certeza total.').adjacentMovementDrift, true);
assert.equal(evaluateMovementExpression('external_validation:notice_the_consulting_pattern', 'Confía en ti y recuerda que todo saldrá bien.').targetExpressed, false);

const profile1Repair = 'Cuando recibes una oportunidad laboral, ya tienes una primera respuesta antes de pedir varias opiniones. Hay dos momentos distintos: lo que tú piensas al recibirla y el momento en que empiezas a consultar. Para reconocer esa secuencia, puede servirte fijarte en ese paso: «Mi primera respuesta fue esta; después empecé a pedir opiniones». Por ahora, se trata de hacer visible ese orden, sin tener que cambiar cómo decides.';
assert.equal(evaluateMovementValue('external_validation:notice_the_consulting_pattern', profile1Repair).approved, true);
for (const text of ['Te pasa que consultas muchas opiniones.', 'Sería bueno que observes más tus decisiones.', 'Recuerda confiar en tu criterio.', 'Ya tienes una respuesta antes de consultar.']) {
  assert.equal(evaluateMovementValue('external_validation:notice_the_consulting_pattern', text).approved, false);
}
for (const text of ['Antes de pedir otra opinión, nota si ya habías formado una primera respuesta.', 'Fíjate en la secuencia: primero aparece tu respuesta; después empiezas a consultar.', 'Cuando aparezca una decisión, identifica el momento exacto en que pasas de pensar qué quieres a empezar a preguntar qué harían otros.']) {
  assert.equal(evaluateMovementValue('external_validation:notice_the_consulting_pattern', text).approved, true);
}

console.log(`movement expression tests: PASS (${Object.keys(positives).length} canonical positives)`);
