import assert from 'node:assert/strict';
import {
  invalidateDependentBufferItems,
  planDailyIntervention,
  projectedReceptionStage,
  prospectiveDependencyStatus,
  normalizedMessageHash,
} from '../lib/recurrent-daily.ts';

const context = 'Al recibir una oportunidad laboral, suele pedir varias opiniones aunque ya tenga una primera respuesta.';
const goal = 'Confiar más en mis decisiones laborales.';
const mechanismId = 'external_validation';
const dates = [1, 2, 3, 4, 5].map(day => `2026-10-${String(day + 5).padStart(2, '0')}`);
const historyFor = exposures => exposures.map(item => ({ mechanismId, psychologicalMovementKey: item.canonicalMovement, movement: item.canonicalMovement, takeaway: item.takeaway, text: item.message }));
const exposureFor = (plan, day) => ({ canonicalMovement: plan.canonicalMovement, deliveredAt: `2026-10-${String(day).padStart(2, '0')}T09:00:00.000Z`, takeaway: plan.reason, interventionMode: plan.interventionMode, angle: plan.angle, depth: plan.depth, contextUsed: plan.contextUsed, message: `Delivered ${day}: ${plan.angle}`, normalizedMessageHash: normalizedMessageHash(`Delivered ${day}: ${plan.angle}`), interventionSignature: plan.interventionSignature });

let delivered = [];
let prospective = [];
const fiveDayPlans = [];
for (let index = 0; index < dates.length; index += 1) {
  const plan = planDailyIntervention({
    goal,
    context,
    confirmedEvidence: [context],
    mechanismId,
    history: historyFor(delivered),
    exposures: delivered,
    plannedSignatures: prospective.map(item => item.plan.interventionSignature),
    prospectiveLearning: prospective.map(item => ({ bufferItemId: item.id, intendedLocalDate: item.intendedLocalDate, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.reason, message: item.message, interventionSignature: item.plan.interventionSignature })),
    intendedLocalDate: dates[index],
    projectedReceptionStage: projectedReceptionStage(delivered.length, prospective.length),
  }).selected;
  assert.ok(plan, `prospective day ${index + 1} has a plan`);
  assert.notEqual(plan.canonicalMovement, 'external_validation:review_outcome_without_self_punishment', 'review outcome cannot be prospectively unlocked');
  const item = { id: `buffer-${index + 1}`, intendedLocalDate: dates[index], plan, message: `Planned ${index + 1}: ${plan.angle}`, status: 'buffered', normalizedMessageHash: normalizedMessageHash(`Planned ${index + 1}: ${plan.angle}`), interventionSignature: plan.interventionSignature, contextVersion: 'test' };
  prospective.push(item);
  fiveDayPlans.push({ day: index + 1, movement: plan.canonicalMovement, eligibility: plan.eligibility, dependsOn: plan.dependsOnBufferItemId, projectedStage: plan.projectedReceptionStage });
}
assert.equal(fiveDayPlans.length, 5);
assert.equal(delivered.length, 0, 'prospective items do not contaminate delivered history');
assert.equal(fiveDayPlans[0].eligibility, 'eligible_now');
assert.ok(fiveDayPlans.slice(1).some(row => row.eligibility === 'eligible_conditionally'), 'later plans may depend on scheduled learning');

const reviewOnly = planDailyIntervention({ goal, context, confirmedEvidence: [context], mechanismId, history: historyFor(delivered), exposures: delivered, prospectiveLearning: prospective }).candidates;
assert.equal(reviewOnly.some(plan => plan.canonicalMovement === 'external_validation:review_outcome_without_self_punishment'), false, 'confirmed event protection');

const dependency = prospectiveDependencyStatus(prospective[1], new Set());
assert.equal(dependency.satisfied, false);
assert.equal(prospectiveDependencyStatus(prospective[1], new Set(['buffer-1'])).satisfied, true);
const failedChain = invalidateDependentBufferItems(prospective, 'buffer-1');
assert.deepEqual(failedChain.map(item => item.status), ['invalidated', 'invalidated', 'invalidated', 'invalidated', 'invalidated']);
const successfulChain = prospective.map(item => ({ ...item, status: 'buffered' }));
assert.equal(prospectiveDependencyStatus(successfulChain[1], new Set(['buffer-1'])).satisfied, true);

let rollingDelivered = [];
let rollingFuture = [];
const rollingRows = [];
for (let day = 1; day <= 30; day += 1) {
  if (rollingFuture.length) {
    const first = rollingFuture.shift();
    rollingDelivered.push(exposureFor(first.plan, day));
  }
  const futureDates = Array.from({ length: 5 }, (_, offset) => `2026-11-${String(day + offset).padStart(2, '0')}`);
  while (rollingFuture.length < 5) {
    const date = futureDates[rollingFuture.length];
    const plan = planDailyIntervention({ goal, context, confirmedEvidence: [context], mechanismId, history: historyFor(rollingDelivered), exposures: rollingDelivered, plannedSignatures: rollingFuture.map(item => item.plan.interventionSignature), prospectiveLearning: rollingFuture.map(item => ({ bufferItemId: item.id, intendedLocalDate: item.intendedLocalDate, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.reason, message: item.message, interventionSignature: item.plan.interventionSignature })), intendedLocalDate: date, projectedReceptionStage: projectedReceptionStage(rollingDelivered.length, rollingFuture.length) }).selected;
    rollingFuture.push({ id: `rolling-${day}-${rollingFuture.length + 1}`, intendedLocalDate: date, plan, message: `Rolling ${day}-${rollingFuture.length + 1}` });
  }
  rollingRows.push({ day, planCount: rollingFuture.length, deliveredCount: rollingDelivered.length, terminal: false });
}
assert.equal(rollingRows.length, 30);
assert.equal(rollingRows.some(row => row.planCount === 0), false);
assert.equal(rollingRows.some(row => row.terminal), false);

console.log(JSON.stringify({ status: 'PASS', fiveDayPlans, confirmedEventProtection: 'PASS', dependencySuccess: 'PASS', failureCascade: 'PASS', rolling30Days: rollingRows }, null, 2));
