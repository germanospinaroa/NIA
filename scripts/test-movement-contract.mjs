import assert from 'node:assert/strict';
import { formulatePsychologicalIntervention, psychologicalMechanisms, validatePsychologicalMechanismMovementContract } from '../lib/psychological-contract.ts';
import { canonicalMovementPathForMechanism, getMovementTargetGuidance } from '../lib/movement-expression.ts';
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

console.log('movement contract tests: PASS (all mechanisms, production reproduction, trial eligibility, no unsupported fallback)');
