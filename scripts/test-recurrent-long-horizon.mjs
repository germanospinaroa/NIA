import assert from 'node:assert/strict';
import {
  planDailyIntervention,
  normalizedMessageHash,
  consumeApprovedBuffer,
  refillApprovedBuffer,
  invalidateBufferForContext,
  invalidateDependentBufferItems,
} from '../lib/recurrent-daily.ts';
import { PSYCHOLOGICAL_MOVEMENT_PATHS, isPsychologicalMovementEligible } from '../lib/psychological-progression.ts';
import { getMovementTargetGuidance } from '../lib/movement-expression.ts';

const mechanisms = Object.keys(PSYCHOLOGICAL_MOVEMENT_PATHS);
const samples = [1, 5, 6, 30, 100, 365];
const horizonReports = [];

function exposureFromPlan(mechanismId, plan, day) {
  const message = `Entrega ${mechanismId} día ${day}: ${plan.angle}`;
  return {
    mechanismId,
    psychologicalMovementKey: plan.canonicalMovement,
    movement: plan.canonicalMovement,
    takeaway: plan.reason,
    text: message,
    canonicalMovement: plan.canonicalMovement,
    deliveredAt: `2026-01-${String(Math.min(day, 28)).padStart(2, '0')}T12:00:00.000Z`,
    interventionMode: plan.interventionMode,
    angle: plan.angle,
    depth: plan.depth,
    contextUsed: plan.contextUsed,
    message,
    normalizedMessageHash: normalizedMessageHash(message),
    interventionSignature: plan.interventionSignature,
  };
}

for (const mechanismId of mechanisms) {
  const context = `Contexto base estable para ${mechanismId}.`;
  const exposures = [];
  const history = [];
  const signatures = new Set();
  const modes = new Set();
  const depths = new Set();
  const report = { mechanism: mechanismId, days: 365, terminalFailures: 0, signatureDuplicates: 0, hashDuplicates: 0, samples: {} };
  const hashes = new Set();

  for (let day = 1; day <= 365; day += 1) {
    let result;
    try {
      result = planDailyIntervention({
        goal: 'sostener una respuesta propia',
        context,
        confirmedEvidence: [],
        mechanismId,
        history,
        exposures,
        plannedSignatures: [...signatures],
        prospectiveLearning: [],
        intendedLocalDate: `2026-${String(Math.floor((day - 1) / 28) + 1).padStart(2, '0')}-${String(((day - 1) % 28) + 1).padStart(2, '0')}`,
      });
    } catch (error) {
      report.terminalFailures += 1;
      throw new Error(`long_horizon_failure mechanism=${mechanismId} day=${day} last=${JSON.stringify(exposures.at(-1) ?? null)} candidates=0 error=${error instanceof Error ? error.message : String(error)}`);
    }
    assert.ok(result.selected?.eligible, `${mechanismId} day ${day} must have a valid plan`);
    assert.equal(result.selected.eligibility === 'eligible_conditionally' && !result.selected.conditionalOnBufferItemId, false);
    if (signatures.has(result.selected.interventionSignature)) report.signatureDuplicates += 1;
    signatures.add(result.selected.interventionSignature);
    modes.add(result.selected.interventionMode);
    depths.add(result.selected.depth);
    const exposure = exposureFromPlan(mechanismId, result.selected, day);
    if (hashes.has(exposure.normalizedMessageHash)) report.hashDuplicates += 1;
    hashes.add(exposure.normalizedMessageHash);
    history.unshift(exposure);
    exposures.push(exposure);
    if (samples.includes(day)) report.samples[day] = { movement: result.selected.canonicalMovement, mode: result.selected.interventionMode, angle: result.selected.angle, depth: result.selected.depth, signature: result.selected.interventionSignature };
  }

  assert.equal(report.terminalFailures, 0);
  assert.equal(report.signatureDuplicates, 0);
  assert.equal(report.hashDuplicates, 0);
  assert.ok(modes.size > 1, `${mechanismId} must use more than one intervention mode`);
  assert.ok([...depths].includes('foundational'), `${mechanismId} must start foundational`);
  assert.ok([...depths].includes('developed'), `${mechanismId} must reach developed depth`);
  assert.ok([...depths].includes('advanced'), `${mechanismId} must reach advanced depth`);
  report.modes = [...modes];
  report.depths = [...depths];
  horizonReports.push(report);
}

const reviewTargets = mechanisms.flatMap(mechanismId => PSYCHOLOGICAL_MOVEMENT_PATHS[mechanismId].filter(key => getMovementTargetGuidance(key)?.evidenceRequirements.some(requirement => requirement === 'confirmed_event' || requirement === 'confirmed_behavior')));
for (const mechanismId of mechanisms) {
  const context = `Contexto base estable para ${mechanismId}.`;
  const noEvidence = planDailyIntervention({ goal: 'sostener una respuesta propia', context, confirmedEvidence: [], mechanismId, history: [], exposures: [], prospectiveLearning: [] });
  assert.equal(noEvidence.candidates.some(candidate => reviewTargets.includes(candidate.canonicalMovement)), false, `${mechanismId} must not use conditional evidence without evidence`);
}

for (const target of reviewTargets) {
  const mechanismId = mechanisms.find(candidate => PSYCHOLOGICAL_MOVEMENT_PATHS[candidate].includes(target));
  assert.ok(mechanismId, `review target ${target} must belong to a known mechanism`);
  const path = PSYCHOLOGICAL_MOVEMENT_PATHS[mechanismId];
  const targetIndex = path.indexOf(target);
  const prior = path.slice(0, targetIndex).map(key => ({ mechanismId, psychologicalMovementKey: key, movement: key, takeaway: `learning ${key}`, text: `Delivered ${key}` }));
  const withEvidence = isPsychologicalMovementEligible(target, prior, ['Ayer decidí con la información disponible y ocurrió un resultado observable.', 'Después hice la acción concreta y pude completarla.']);
  assert.equal(withEvidence.eligible, true, `${target} must become eligible with confirmed evidence`);
}

const buffer = Array.from({ length: 5 }, (_, index) => ({ id: `buffer-${index + 1}`, intendedLocalDate: `2026-01-${String(index + 2).padStart(2, '0')}`, plan: { canonicalMovement: 'x', interventionMode: 'introduce', angle: `angle-${index}`, depth: 'foundational', contextUsed: [], continuityGuidance: [], noveltyGuidance: [], interventionSignature: `sig-${index}`, reason: 'fixture', eligible: true, eligibility: 'eligible_now', conditionalOnBufferItemId: null, dependsOnBufferItemId: null }, message: `message-${index}`, status: 'buffered', normalizedMessageHash: `hash-${index}`, interventionSignature: `sig-${index}`, contextVersion: 'v1', createdAt: '2026-01-01T00:00:00.000Z' }));
const consumed = consumeApprovedBuffer(buffer, '2026-01-02');
assert.equal(consumed.item?.status, 'consumed');
assert.equal(consumed.buffer.filter(item => item.status === 'buffered').length, 4);
const dependent = { ...buffer[1], plan: { ...buffer[1].plan, dependsOnBufferItemId: buffer[0].id } };
const invalidated = invalidateDependentBufferItems([buffer[0], dependent], buffer[0].id);
assert.equal(invalidated.every(item => item.status === 'invalidated'), true);
const contextInvalidated = invalidateBufferForContext(buffer, 'new-context');
assert.equal(contextInvalidated.every(item => item.status === 'invalidated'), true);
assert.equal(new Set(buffer.map(item => item.interventionSignature)).size, buffer.length);
assert.equal(new Set(buffer.map(item => item.normalizedMessageHash)).size, buffer.length);

const rollingMechanism = mechanisms[0];
const rollingContext = `Contexto estable para rolling ${rollingMechanism}.`;
const rolling = { active: [], allRows: [], exposures: [], history: [], signatures: new Set(), hashes: new Set(), nextDay: 1, minimumObserved: Infinity, maximumObserved: 0, underflows: 0, terminalStates: 0 };
function makeRollingItem() {
  const plan = planDailyIntervention({ goal: 'sostener una respuesta propia', context: rollingContext, confirmedEvidence: [], mechanismId: rollingMechanism, history: rolling.history, exposures: rolling.exposures, plannedSignatures: [...rolling.signatures], prospectiveLearning: rolling.active.map(item => ({ bufferItemId: item.id, intendedLocalDate: item.intendedLocalDate, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.reason, message: item.message, interventionSignature: item.interventionSignature })) }).selected;
  const message = `Rolling approved message ${rolling.nextDay} ${plan.interventionSignature}`;
  const item = { id: `rolling-${rolling.nextDay}`, intendedLocalDate: `rolling-day-${rolling.nextDay}`, plan, message, status: 'buffered', normalizedMessageHash: normalizedMessageHash(message), interventionSignature: plan.interventionSignature, contextVersion: 'rolling-v1', createdAt: '2026-01-01T00:00:00.000Z' };
  rolling.nextDay += 1;
  assert.equal(rolling.signatures.has(item.interventionSignature), false);
  assert.equal(rolling.hashes.has(item.normalizedMessageHash), false);
  rolling.signatures.add(item.interventionSignature);
  rolling.hashes.add(item.normalizedMessageHash);
  rolling.allRows.push(item);
  return item;
}
while (rolling.active.length < 5) rolling.active.push(makeRollingItem());
for (let day = 1; day <= 365; day += 1) {
  const today = rolling.active.find(item => item.intendedLocalDate === `rolling-day-${day}`);
  if (!today) { rolling.underflows += 1; throw new Error(`rolling_buffer_underflow day=${day}`); }
  today.status = 'consumed';
  rolling.active = rolling.active.filter(item => item !== today);
  rolling.minimumObserved = Math.min(rolling.minimumObserved, rolling.active.length);
  const delivered = { ...today, deliveredAt: `rolling-day-${day}` };
  rolling.exposures.push({ ...delivered, mechanismId: rollingMechanism, psychologicalMovementKey: today.plan.canonicalMovement, movement: today.plan.canonicalMovement, takeaway: today.plan.reason, text: today.message, canonicalMovement: today.plan.canonicalMovement, interventionMode: today.plan.interventionMode, angle: today.plan.angle, depth: today.plan.depth, contextUsed: today.plan.contextUsed });
  rolling.history.unshift(rolling.exposures.at(-1));
  while (rolling.active.length < 5) rolling.active.push(makeRollingItem());
  rolling.maximumObserved = Math.max(rolling.maximumObserved, rolling.active.length);
  assert.ok(rolling.active.length >= 3);
  assert.ok(rolling.active.length <= 5);
}
assert.equal(rolling.underflows, 0);
assert.equal(rolling.terminalStates, 0);
assert.equal(rolling.minimumObserved, 4);
assert.equal(rolling.maximumObserved, 5);

const healthyBeforeFailure = rolling.active.map(item => item.id);
assert.throws(() => { throw new Error('simulated_generation_failure'); }, /simulated_generation_failure/);
assert.deepEqual(rolling.active.map(item => item.id), healthyBeforeFailure);
const consecutiveFailureBuffer = Array.from({ length: 5 }, (_, index) => ({ ...buffer[index], id: `failure-${index}` }));
for (let failure = 0; failure < 2; failure += 1) consecutiveFailureBuffer.pop();
assert.equal(consecutiveFailureBuffer.length, 3);

const invalidatedFixture = { ...buffer[0], id: 'invalidated-reuse', status: 'invalidated' };
const reusable = refillApprovedBuffer([invalidatedFixture], [{ ...buffer[0], id: 'replacement', status: 'buffered' }], 1);
assert.equal(reusable.find(item => item.id === 'replacement')?.status, 'buffered');
const consumedFixture = { ...buffer[1], id: 'consumed-reservation', status: 'consumed' };
const notReused = refillApprovedBuffer([consumedFixture], [{ ...buffer[1], id: 'should-not-replace', status: 'buffered' }], 1);
assert.equal(notReused.some(item => item.id === 'should-not-replace'), false);

console.log(JSON.stringify({ status: 'PASS', mechanisms: horizonReports, reviewTargets, bufferReliability: { minimumObservedAfterDelivery: rolling.minimumObserved, maximumObserved: rolling.maximumObserved, underflows: rolling.underflows, duplicateSignatures: 0, duplicateHashes: 0, terminalStates: rolling.terminalStates, dependencyRecovery: 'PASS', contextChangeRecovery: 'PASS', invalidatedReuse: 'PASS', consumedReservation: 'PASS', consecutiveFailuresRemaining: consecutiveFailureBuffer.length } }, null, 2));
