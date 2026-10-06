import assert from 'node:assert/strict';
import { derivePsychologicalProgression } from '../lib/psychological-progression.ts';
import { allMovementTargetGuidance, getMovementTargetGuidance } from '../lib/movement-expression.ts';

const adrianaContext = 'Al recibir una oportunidad laboral, suele pedir varias opiniones aunque ya tenga una primera respuesta.';
const base = { goal: 'Confiar más en mis decisiones laborales.', pattern: adrianaContext, mechanismId: 'external_validation' };
const history = (...keys) => keys.map((psychologicalMovementKey, index) => ({
  id: String(index), mechanismId: psychologicalMovementKey.split(':')[0], psychologicalMovementKey,
  movement: psychologicalMovementKey, takeaway: `Aprendizaje entregado de ${psychologicalMovementKey}.`,
  text: `Mensaje entregado sobre ${psychologicalMovementKey}.`, createdAt: `2026-10-0${index + 1}T12:00:00Z`,
})).reverse();

const p1FirstFive = [
  'external_validation:notice_the_consulting_pattern',
  'external_validation:information_vs_delegating_decision',
  'external_validation:define_decision_criterion',
  'external_validation:set_reconsideration_threshold',
  'external_validation:decide_with_sufficient_information',
];

const withoutOutcome = derivePsychologicalProgression({ ...base, history: history(...p1FirstFive), confirmedEvidence: [adrianaContext] });
assert.equal(withoutOutcome.theoretical_next_movement, 'external_validation:review_outcome_without_self_punishment');
assert.equal(withoutOutcome.ineligible_next_movements.includes('external_validation:review_outcome_without_self_punishment'), true);
assert.equal(withoutOutcome.next_recommended_movement, 'external_validation:build_evidence_of_own_capacity');
assert.equal(withoutOutcome.progression_reason.includes('siguiente movimiento elegible'), true);

const withOutcome = derivePsychologicalProgression({
  ...base,
  history: history(...p1FirstFive),
  confirmedEvidence: [adrianaContext, 'Tomé una decisión laboral que salió diferente de lo esperado y desde entonces pienso que no sé decidir bien.'],
});
assert.equal(withOutcome.next_recommended_movement, 'external_validation:review_outcome_without_self_punishment');

const noEvidence = derivePsychologicalProgression({ ...base, history: [], confirmedEvidence: [] });
assert.equal(noEvidence.next_recommended_movement, null);
assert.equal(noEvidence.progression_reason, 'no_eligible_next_movement');

const p2 = derivePsychologicalProgression({
  goal: 'Aclarar qué necesito para avanzar.',
  pattern: 'Al empezar una tarea nueva, revisa varias veces las instrucciones y no logra identificar qué dato le falta.',
  mechanismId: 'uncertainty_clarification',
  history: history('uncertainty_clarification:name_the_concrete_question', 'uncertainty_clarification:identify_what_is_known'),
  confirmedEvidence: ['Al empezar una tarea nueva, revisa varias veces las instrucciones y no logra identificar qué dato le falta.'],
});
assert.equal(p2.next_recommended_movement, 'uncertainty_clarification:choose_a_sufficient_next_step');

const adrianaAfterSkip = derivePsychologicalProgression({
  ...base,
  history: history(...p1FirstFive, 'external_validation:build_evidence_of_own_capacity'),
  confirmedEvidence: [adrianaContext],
});
assert.equal(adrianaAfterSkip.next_recommended_movement, null);
assert.equal(adrianaAfterSkip.progression_reason, 'no_eligible_next_movement');
assert.deepEqual(adrianaAfterSkip.pending_conditional_movements, ['external_validation:review_outcome_without_self_punishment']);

const luciaComplete = derivePsychologicalProgression({
  goal: 'Aclarar qué necesito para avanzar.',
  pattern: 'Al empezar una tarea nueva, revisa varias veces las instrucciones y no logra identificar qué dato le falta.',
  mechanismId: 'uncertainty_clarification',
  history: history('uncertainty_clarification:name_the_concrete_question', 'uncertainty_clarification:identify_what_is_known', 'uncertainty_clarification:choose_a_sufficient_next_step', 'uncertainty_clarification:act_without_total_certainty'),
  confirmedEvidence: ['Al empezar una tarea nueva, revisa varias veces las instrucciones y no logra identificar qué dato le falta.'],
});
assert.equal(luciaComplete.next_recommended_movement, null);
assert.equal(luciaComplete.progression_reason, 'trajectory_complete');
assert.deepEqual(luciaComplete.pending_conditional_movements, []);

const previous = withoutOutcome.continuity;
assert.equal(previous.previousDeliveredMovement, 'external_validation:decide_with_sufficient_information');
assert.match(previous.previousDeliveredTakeaway, /decide_with_sufficient_information/);
assert.match(previous.previousDeliveredMessage, /decide_with_sufficient_information/);
assert.ok(previous.continuityGuidance.length >= 2);

const all = allMovementTargetGuidance();
assert.equal(all.length, 22);
for (const contract of all) {
  assert.ok(contract.target);
  assert.ok(contract.purpose);
  assert.ok(contract.inScope.length);
  assert.ok(Array.isArray(contract.outOfScope));
  assert.ok(contract.deliveredLearning);
  assert.ok(Array.isArray(contract.evidenceRequirements));
  assert.equal(typeof contract.conditional, 'boolean');
}

assert.equal(getMovementTargetGuidance('external_validation:review_outcome_without_self_punishment').conditional, true);
assert.deepEqual(getMovementTargetGuidance('external_validation:review_outcome_without_self_punishment').evidenceRequirements, ['base_context', 'confirmed_event', 'confirmed_behavior']);

console.log('longitudinal continuity + eligibility: PASS');
console.log(JSON.stringify({
  profile1: {
    theoreticalNext: withoutOutcome.theoretical_next_movement,
    ineligible: withoutOutcome.ineligible_next_movements,
    selected: withoutOutcome.next_recommended_movement,
    withOutcomeSelected: withOutcome.next_recommended_movement,
    afterSkip: { reason: adrianaAfterSkip.progression_reason, pending: adrianaAfterSkip.pending_conditional_movements },
  },
  profile2: { selected: p2.next_recommended_movement },
  movementContracts: all.length,
  semanticGap: 'free-form evidence interpretation remains deterministic/conservative; ambiguous cases are not auto-selected and may require a future semantic classifier.',
}, null, 2));
