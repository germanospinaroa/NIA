import assert from 'node:assert/strict';
import { formulatePsychologicalIntervention, psychologicalMechanisms, validateMovementContractConsistency, validatePsychologicalMechanismMovementContract } from '../lib/psychological-contract.ts';
import { assessMovementEvidence, canonicalMovementPathForMechanism, getMovementTargetGuidance } from '../lib/movement-expression.ts';
import { planDailyIntervention } from '../lib/recurrent-daily.ts';
import { isEligibleProductionUser } from '../lib/server/refill-approved-buffer.ts';

assert.deepEqual(validatePsychologicalMechanismMovementContract(), []);

for (const mechanism of psychologicalMechanisms) {
  const path = canonicalMovementPathForMechanism(mechanism.id);
  assert.ok(path?.length, `${mechanism.id} must map to a canonical path`);
  for (const movement of path) assert.ok(getMovementTargetGuidance(movement), `${mechanism.id}:${movement} must have guidance`);
  const plan = planDailyIntervention({ goal: 'Decir lo que pienso aunque pueda incomodar', context: 'Cuando tengo que tomar una decisión importante.', confirmedEvidence: ['Cuando tengo que tomar una decisión importante.'], mechanismId: mechanism.id, history: [], exposures: [] }).selected;
  assert.ok(getMovementTargetGuidance(plan.canonicalMovement), `${mechanism.id} planner output must have guidance`);
}

const productionShape = formulatePsychologicalIntervention({ desiredChange: 'Decir lo que pienso aunque pueda incomodar', currentContext: 'Cuando tengo que tomar una decisión importante.' });
assert.equal(productionShape.mechanism_id, 'context_clarification');
const productionPlan = planDailyIntervention({ goal: productionShape.user_direction, context: productionShape.situation, confirmedEvidence: [productionShape.situation], mechanismId: productionShape.mechanism_id, history: [], exposures: [] }).selected;
assert.ok(getMovementTargetGuidance(productionPlan.canonicalMovement));
assert.notEqual(productionPlan.canonicalMovement, 'context_clarification:reflect_or_observe');
assert.equal(isEligibleProductionUser({ userId: 'synthetic', accountStatus: 'active', whatsappEnabled: true, whatsappConnected: true, subscriptionStatus: 'trialing' }), true);
assert.throws(() => planDailyIntervention({ goal: 'x', context: 'y', mechanismId: 'unknown_mechanism', history: [], exposures: [] }), /unsupported_mechanism_movement_contract/);

const juanitaContract = formulatePsychologicalIntervention({
  desiredChange: 'Decir lo que realmente quiero decir.',
  currentContext: 'Cuando tengo que tomar una decisión importante.',
  preferredMovement: 'situational_preparation:notice_the_trigger',
});
assert.equal(juanitaContract.mechanism_id, 'intention_retrieval');
assert.equal(juanitaContract.canonical_movement, 'situational_preparation:notice_the_trigger');
assert.match(juanitaContract.psychological_move, /considerar opciones.*expresar/i);
assert.doesNotMatch(juanitaContract.expected_movement, /preparar una respuesta/i);

const juanitaPlan = planDailyIntervention({
  goal: 'Decir lo que realmente quiero decir.',
  context: 'Cuando tengo que tomar una decisión importante.',
  confirmedEvidence: ['Cuando tengo que tomar una decisión importante.'],
  mechanismId: 'intention_retrieval',
  history: [],
  exposures: [],
}).selected;
assert.equal(juanitaPlan.canonicalMovement, 'situational_preparation:notice_the_trigger');
assert.doesNotMatch(`${juanitaPlan.newContribution} ${juanitaPlan.expectedTakeaway}`, /alrededor de|preparar una respuesta|qué se acaba de decir/i);
assert.match(juanitaPlan.newContribution, /considerar las opciones.*expresar/i);
assert.equal(assessMovementEvidence('situational_preparation:notice_the_trigger', ['Cuando tengo que tomar una decisión importante.']).sufficient, true);
assert.equal(assessMovementEvidence('situational_preparation:review_what_happened', ['Cuando tengo que tomar una decisión importante.']).reason, 'missing_confirmed_event');

const inconsistent = validateMovementContractConsistency({
  mechanismId: 'intention_retrieval',
  canonicalMovement: 'situational_preparation:notice_the_trigger',
  psychologicalMove: 'preparar una respuesta para una situación concreta',
  interventionPurpose: 'Ayudar a preparar una respuesta para una situación concreta.',
  expectedMovement: 'Después de leerlo, la persona podrá preparar una respuesta para una situación concreta.',
  blueprintMovement: 'situational_preparation:notice_the_trigger',
  blueprintExpectedMovement: 'Después de leerlo, la persona podrá preparar una respuesta para una situación concreta.',
  newContribution: 'Preparar una respuesta alternativa para una situación concreta.',
  expectedTakeaway: 'Puedo preparar una respuesta.',
  guidanceTarget: 'situational_preparation:notice_the_trigger',
});
assert.ok(inconsistent.includes('psychological_move_mismatch'));
assert.ok(inconsistent.includes('expected_movement_mismatch'));
assert.ok(inconsistent.includes('blueprint_expected_movement_mismatch'));
assert.ok(inconsistent.includes('new_contribution_adjacent_phase_leak'));

const coherent = validateMovementContractConsistency({
  mechanismId: juanitaContract.mechanism_id,
  canonicalMovement: juanitaContract.canonical_movement,
  psychologicalMove: juanitaContract.psychological_move,
  interventionPurpose: juanitaContract.intervention_purpose,
  expectedMovement: juanitaContract.expected_movement,
  blueprintMovement: juanitaContract.canonical_movement,
  blueprintExpectedMovement: juanitaContract.expected_movement,
  newContribution: 'Reconocer la situación concreta donde entra en juego la intención.',
  expectedTakeaway: 'Puedo reconocer esa situación concreta.',
  guidanceTarget: juanitaContract.canonical_movement,
});
assert.deepEqual(coherent, []);

console.log('movement contract tests: PASS (all mechanisms, production reproduction, trial eligibility, no unsupported fallback)');
