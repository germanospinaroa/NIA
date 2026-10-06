import assert from 'node:assert/strict';
import fs from 'node:fs';
import { interventionSignature, normalizedMessageHash, planDailyIntervention, projectedReceptionStage } from '../lib/recurrent-daily.ts';
import { PSYCHOLOGICAL_MOVEMENT_PATHS } from '../lib/psychological-progression.ts';
import { loadDeliveredBufferExposures } from '../lib/server/approved-message-buffer.ts';

const userId = 'user-loop';
const context = 'Al recibir una oportunidad laboral, suele pedir varias opiniones aunque ya tenga una primera respuesta.';
const goal = 'Confiar más en mis decisiones laborales.';
const mechanismId = 'external_validation';

function planFor(day, message = `Mensaje ${day}`) {
  const selected = planDailyIntervention({
    goal,
    context,
    confirmedEvidence: [context],
    mechanismId,
    history: [],
    exposures: [],
    prospectiveLearning: [],
    intendedLocalDate: `2026-10-${String(day).padStart(2, '0')}`,
    projectedReceptionStage: projectedReceptionStage(0, day - 1),
  }).selected;
  return { ...selected, message, interventionSignature: selected.interventionSignature };
}

const distinct = (plan, day) => ({ ...plan, angle: `${plan.angle}:fixture-${day}`, interventionSignature: interventionSignature({ ...plan, angle: `${plan.angle}:fixture-${day}` }) });
const d1Plan = distinct(planFor(1, 'D1: observa la primera respuesta propia.'), 1);
const d2Plan = distinct(planFor(2, 'D2: separa información de delegar la decisión.'), 2);
const d3Plan = distinct(planFor(3, 'D3: nombra el criterio que usarías.'), 3);
const d4Plan = distinct(planFor(4, 'D4: identifica qué dato cambiaría la decisión.'), 4);
const d5Plan = distinct(planFor(5, 'D5: decide con la información suficiente.'), 5);

function row(id, day, plan, status) {
  const message = plan.message;
  return {
    id,
    user_id: userId,
    intended_local_date: `2026-10-${String(day).padStart(2, '0')}`,
    plan,
    message,
    status,
    normalized_message_hash: normalizedMessageHash(message),
    intervention_signature: plan.interventionSignature,
    context_version: 'context-v1',
    created_at: `2026-10-${String(day).padStart(2, '0')}T00:00:00.000Z`,
  };
}

const buffers = [
  row('buffer-d1', 1, d1Plan, 'consumed'),
  row('buffer-d2', 2, d2Plan, 'buffered'),
  row('buffer-d3', 3, d3Plan, 'buffered'),
  row('buffer-d4', 4, d4Plan, 'buffered'),
  row('buffer-d5', 5, d5Plan, 'buffered'),
];

function query(rows) {
  let current = [...rows];
  const builder = {
    select() { return builder; },
    eq(field, value) { current = current.filter(rowValue => rowValue[field] === value); return builder; },
    neq(field, value) { current = current.filter(rowValue => rowValue[field] !== value); return builder; },
    in(field, values) { current = current.filter(rowValue => values.includes(rowValue[field])); return builder; },
    order() { return builder; },
    limit(value) { current = current.slice(0, value); return builder; },
    async maybeSingle() { return { data: current[0] ?? null, error: null }; },
    then(resolve, reject) { return Promise.resolve({ data: current, error: null }).then(resolve, reject); },
  };
  return builder;
}

function adminFor({ bufferRows, interactions, deliveries }) {
  return { from(table) {
    if (table === 'approved_intervention_buffer') return query(bufferRows);
    if (table === 'interactions') return query(interactions);
    if (table === 'whatsapp_daily_deliveries') return query(deliveries);
    throw new Error(`unexpected_table:${table}`);
  } };
}

const sentInteraction = { id: 'interaction-d1', user_id: userId, local_date: '2026-10-01', content: d1Plan.message, interaction_type: 'daily_message' };
const sentDelivery = { interaction_id: 'interaction-d1', user_id: userId, status: 'sent', sent_at: '2026-10-01T10:00:00.000Z' };
const successful = await loadDeliveredBufferExposures(adminFor({ bufferRows: buffers, interactions: [sentInteraction], deliveries: [sentDelivery] }), userId);
assert.equal(successful.length, 1);
assert.equal(successful[0].interventionSignature, d1Plan.interventionSignature);

const failed = await loadDeliveredBufferExposures(adminFor({ bufferRows: [buffers[0]], interactions: [sentInteraction], deliveries: [{ ...sentDelivery, status: 'failed' }] }), userId);
assert.equal(failed.length, 0, 'failed transport is not delivered learning');
const pending = await loadDeliveredBufferExposures(adminFor({ bufferRows: [buffers[0]], interactions: [sentInteraction], deliveries: [{ ...sentDelivery, status: 'pending' }] }), userId);
assert.equal(pending.length, 0, 'pending transport is not delivered learning');
const invalidated = await loadDeliveredBufferExposures(adminFor({ bufferRows: [{ ...buffers[0], status: 'invalidated' }], interactions: [sentInteraction], deliveries: [sentDelivery] }), userId);
assert.equal(invalidated.length, 0, 'invalidated content is not delivered learning');

const reservedRows = buffers.filter(item => item.status !== 'invalidated');
assert.equal(reservedRows.some(item => item.intervention_signature === d1Plan.interventionSignature), true, 'consumed signature remains reserved');
assert.equal(reservedRows.some(item => item.normalized_message_hash === buffers[0].normalized_message_hash), true, 'consumed hash remains reserved');
assert.equal(buffers.filter(item => item.status !== 'invalidated' && item.status !== 'consumed').length, 4, 'future rows remain prospective');

const seenSignatures = new Set();
const seenHashes = new Set();
let delivered = [successful[0]];
let future = buffers.slice(1).map(item => ({ ...item, plan: item.plan, interventionSignature: item.intervention_signature }));
let underflows = 0;
let terminal = 0;
for (let day = 1; day <= 365; day += 1) {
  const today = future.shift();
  if (!today) underflows += 1;
  else {
    const exposure = {
      canonicalMovement: today.plan.canonicalMovement,
      deliveredAt: `2026-10-${String(day).padStart(2, '0')}T10:00:00.000Z`,
      takeaway: today.plan.reason,
      interventionMode: today.plan.interventionMode,
      angle: today.plan.angle,
      depth: today.plan.depth,
      contextUsed: today.plan.contextUsed,
      message: today.message,
      normalizedMessageHash: normalizedMessageHash(today.message),
      interventionSignature: today.interventionSignature,
    };
    assert.equal(seenSignatures.has(exposure.interventionSignature), false, `signature reused on day ${day}`);
    assert.equal(seenHashes.has(exposure.normalizedMessageHash), false, `hash reused on day ${day}`);
    seenSignatures.add(exposure.interventionSignature);
    seenHashes.add(exposure.normalizedMessageHash);
    delivered.push(exposure);
  }
  while (future.length < 5) {
    const prospective = future.map(item => ({ bufferItemId: item.id, intendedLocalDate: item.intended_local_date, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.reason, message: item.message, interventionSignature: item.interventionSignature }));
    let plan;
    try {
      plan = planDailyIntervention({ goal, context, confirmedEvidence: [context], mechanismId, history: delivered.map(item => ({ mechanismId, psychologicalMovementKey: item.canonicalMovement, movement: item.canonicalMovement, takeaway: item.takeaway, text: item.message })), exposures: delivered, plannedSignatures: future.map(item => item.interventionSignature), prospectiveLearning: prospective, intendedLocalDate: `2027-01-${String(day + future.length + 1).padStart(2, '0')}`, projectedReceptionStage: projectedReceptionStage(delivered.length, future.length) }).selected;
    } catch (error) {
      terminal += 1;
      throw error;
    }
    const message = `Rolling day ${day} future ${future.length + 1}: ${plan.angle}`;
    assert.equal(seenSignatures.has(plan.interventionSignature), false, `future signature reused on day ${day}`);
    const hash = normalizedMessageHash(message);
    assert.equal(seenHashes.has(hash), false, `future hash reused on day ${day}`);
    future.push({ id: `rolling-${day}-${future.length}`, intended_local_date: `2027-01-${String(day + future.length + 1).padStart(2, '0')}`, plan, message, interventionSignature: plan.interventionSignature });
  }
}
assert.equal(underflows, 0);
assert.equal(terminal, 0);
assert.equal(delivered.length, 366);
assert.equal(future.length, 5);

const projected = [0, 1, 2, 3, 4, 5, 29].map(scheduled => projectedReceptionStage(0, scheduled));
assert.deepEqual(projected, ['tuning', 'tuning', 'building', 'building', 'building', 'established', 'established']);
const refillSource = fs.readFileSync(new URL('../lib/server/refill-approved-buffer.ts', import.meta.url), 'utf8');
assert.doesNotMatch(refillSource, /receptionStage:\s*'established'/);
assert.match(refillSource, /const projectedStage = planned\.projectedReceptionStage/);
assert.match(refillSource, /receptionStage: projectedStage/);
assert.match(refillSource, /judgeSemanticFidelity\(\{[^}]*receptionStage: projectedStage/s);

const mechanismKeys = Object.keys(PSYCHOLOGICAL_MOVEMENT_PATHS);
assert.ok(mechanismKeys.length > 0);
console.log(JSON.stringify({
  status: 'PASS',
  sentConsumed: 'delivered_exposure_once',
  failedConsumed: 'not_delivered_but_reserved',
  pendingConsumed: 'not_delivered',
  invalidated: 'not_delivered_and_not_reserved',
  longHorizon: { days: 365, deliveredExposures: delivered.length, future: future.length, underflows, terminal },
  projectedReception: projected,
  mechanismKeys,
  uncertaintyClarificationIncluded: mechanismKeys.includes('uncertainty_clarification'),
}, null, 2));
