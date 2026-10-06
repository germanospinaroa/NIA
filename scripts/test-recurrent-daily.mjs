import assert from 'node:assert/strict';
import {
  consumeApprovedBuffer,
  dailyIdempotencyKey,
  hasExactMessageDuplicate,
  invalidateBufferForContext,
  interventionSignature,
  normalizedMessageHash,
  planDailyIntervention,
  refillApprovedBuffer,
  semanticNoveltySignal,
} from '../lib/recurrent-daily.ts';

const context = 'Al recibir una oportunidad laboral, suele pedir varias opiniones aunque ya tenga una primera respuesta.';
const goal = 'Confiar más en mis decisiones laborales.';
const mechanismId = 'external_validation';
const exposure = (plan, day, message = `Mensaje ${day}`) => ({
  canonicalMovement: plan.canonicalMovement,
  deliveredAt: `2026-10-${String(day).padStart(2, '0')}T09:00:00.000Z`,
  takeaway: `${plan.canonicalMovement} · ${plan.angle}`,
  interventionMode: plan.interventionMode,
  angle: plan.angle,
  depth: plan.depth,
  contextUsed: plan.contextUsed,
  message,
  normalizedMessageHash: normalizedMessageHash(message),
  interventionSignature: plan.interventionSignature,
});
const historyFor = exposures => exposures.map(item => ({ mechanismId, psychologicalMovementKey: item.canonicalMovement, movement: item.canonicalMovement, takeaway: item.takeaway, text: item.message }));

const first = planDailyIntervention({ goal, context, mechanismId, history: [], exposures: [] }).selected;
assert.equal(first.interventionMode, 'introduce');
let exposures = [exposure(first, 1)];
const second = planDailyIntervention({ goal, context, mechanismId, history: historyFor(exposures), exposures }).selected;
assert.notEqual(second.interventionSignature, first.interventionSignature);

assert.equal(hasExactMessageDuplicate('  Una idea.\npara hoy  ', ['una idea. para hoy']), true, 'whitespace duplicate');
assert.equal(hasExactMessageDuplicate('Mensaje nuevo', ['Mensaje viejo']), false);
assert.equal(semanticNoveltySignal({ message: 'Confía en ti.', historicalTakeaways: [] }).novelContribution, false);
assert.equal(semanticNoveltySignal({ message: 'Separa la información nueva de la seguridad con la que alguien opina.', historicalTakeaways: ['Separa información de seguridad al opinar'], currentTakeaway: 'Separa información de seguridad al opinar' }).semanticRedundancy, true);

const sameMovementNewAngle = { ...first, interventionMode: 'deepen', angle: 'new_confirmed_context', interventionSignature: '' };
sameMovementNewAngle.interventionSignature = interventionSignature(sameMovementNewAngle);
assert.notEqual(sameMovementNewAngle.interventionSignature, first.interventionSignature, 'same movement with new angle is allowed');

const planA = { ...first, angle: 'plan_a', interventionSignature: '' };
planA.interventionSignature = interventionSignature(planA);
const planB = { ...first, angle: 'plan_b', interventionSignature: '' };
planB.interventionSignature = interventionSignature(planB);
const buffered = refillApprovedBuffer([], [1, 2, 3].map((n, i) => ({ intendedLocalDate: `2026-10-${10 + n}`, plan: i === 0 ? planA : planB, message: `buffer ${n}`, status: 'approved', normalizedMessageHash: normalizedMessageHash(`buffer ${n}`), interventionSignature: `${i === 0 ? planA : planB.interventionSignature}-${n}`, contextVersion: 'v1', createdAt: new Date().toISOString() })), 3);
assert.equal(buffered.filter(item => item.status === 'buffered').length, 3);
const consumed = consumeApprovedBuffer(buffered, '2026-10-11');
assert.ok(consumed.item);
assert.equal(consumed.item.status, 'consumed');
const invalidated = { ...buffered[0], status: 'invalidated', normalizedMessageHash: 'reusable-hash', interventionSignature: 'reusable-signature' };
const replacement = { ...buffered[1], status: 'approved', normalizedMessageHash: 'reusable-hash', interventionSignature: 'reusable-signature' };
assert.equal(refillApprovedBuffer([invalidated], [replacement], 1).filter(item => item.status === 'buffered').length, 1, 'invalidated rows do not reserve hash/signature');
const activeCollision = { ...buffered[1], status: 'approved', normalizedMessageHash: 'active-hash', interventionSignature: 'active-signature' };
const activeReplacement = { ...buffered[2], status: 'approved', normalizedMessageHash: 'active-hash', interventionSignature: 'active-signature' };
assert.equal(refillApprovedBuffer([activeCollision], [activeReplacement], 2).filter(item => item.status === 'buffered').length, 0, 'active rows reserve hash/signature');
const consumedCollision = { ...activeCollision, status: 'consumed' };
assert.equal(refillApprovedBuffer([consumedCollision], [activeReplacement], 2).filter(item => item.status === 'buffered').length, 0, 'consumed rows remain reserved');
assert.equal(dailyIdempotencyKey('user-1', '2026-10-11'), dailyIdempotencyKey('user-1', '2026-10-11'));
assert.equal(new Set([dailyIdempotencyKey('user-1', '2026-10-11'), dailyIdempotencyKey('user-1', '2026-10-11')]).size, 1);
assert.equal(invalidateBufferForContext(buffered, 'v2').every(item => item.status === 'invalidated'), true);

function runDays(total, evidenceAt = null) {
  let localExposures = [];
  const signatures = new Set();
  const rows = [];
  for (let day = 1; day <= total; day += 1) {
    const evidence = evidenceAt === day ? [context, 'Tomé una decisión laboral que salió diferente de lo esperado y desde entonces pienso que no sé decidir bien.'] : [context];
    const plan = planDailyIntervention({ goal, context, confirmedEvidence: evidence, mechanismId, history: historyFor(localExposures), exposures: localExposures, now: `2026-10-${String(day).padStart(2, '0')}` }).selected;
    assert.ok(plan, `day ${day} must have a plan`);
    assert.equal(signatures.has(plan.interventionSignature), false, `signature repeated on day ${day}`);
    signatures.add(plan.interventionSignature);
    localExposures = [...localExposures, exposure(plan, day, `Intervención ${day}: ${plan.angle}`)];
    rows.push({ day, movement: plan.canonicalMovement, mode: plan.interventionMode, angle: plan.angle, depth: plan.depth, eligible: plan.eligible, signatureReused: false });
  }
  return { rows, exposures: localExposures };
}

const thirty = runDays(30, 15);
assert.equal(thirty.rows.length, 30);
assert.ok(thirty.rows.some(row => row.movement.endsWith(':review_outcome_without_self_punishment')), 'day 15 evidence must make review eligible');
assert.equal(new Set(thirty.rows.map(row => row.angle)).size, 30);
const sixty = runDays(60, 15);
assert.equal(sixty.rows.length, 60);
assert.equal(new Set(sixty.rows.map(row => row.angle)).size, 60);

// Plan A failure remains recoverable without another generation: the planner
// exposes up to three conceptual plans before Writer calls begin.
const candidates = planDailyIntervention({ goal, context, mechanismId, history: [], exposures: [] }).candidates;
assert.ok(candidates.length >= 1 && candidates.length <= 3);
console.log(JSON.stringify({
  status: 'PASS',
  exactDuplicate: 'PASS',
  semanticRedundancy: 'PASS',
  buffer: 'PASS',
  dailyIdempotency: 'PASS',
  days30: thirty.rows,
  day15ReviewEligible: thirty.rows.some(row => row.movement.endsWith(':review_outcome_without_self_punishment')),
  days60: sixty.rows.length,
  plannerCandidates: candidates.length,
}, null, 2));
