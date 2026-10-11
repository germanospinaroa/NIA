import assert from 'node:assert/strict';
import { chooseNextIntervention } from '../lib/server/next-intervention.ts';

const schedule = { timezone: 'America/Bogota', message_time_1: '08:00' };
let active = [];
let delivered = false;
const signatures = new Set();

for (let day = 1; day <= 30; day += 1) {
  const localDate = `2026-11-${String(day).padStart(2, '0')}`;
  const decision = chooseNextIntervention({
    today: localDate,
    schedule,
    now: new Date(`${localDate}T14:00:00.000Z`),
    alreadyDeliveredToday: delivered,
    dailyInteractionToday: delivered,
    dailyDelivery: delivered ? 'sent' : 'none',
    currentContentVersion: 'v1',
    activeRows: active,
    preparationDate: localDate,
  });
  assert.ok(decision.action === 'prepare' || decision.action === 'preserve');
  if (decision.action === 'prepare') {
    const signature = `movement-${day}|contribution-${day}`;
    assert.equal(signatures.has(signature), false);
    signatures.add(signature);
    active = [{ id: `buffer-${day}`, intendedLocalDate: decision.targetLocalDate, contextVersion: 'v1', status: 'buffered', createdAt: `${localDate}T00:00:00.000Z` }];
  }
  assert.equal(active.length, 1);
  delivered = true;

  const pending = chooseNextIntervention({ today: localDate, schedule, now: new Date(`${localDate}T14:00:00.000Z`), alreadyDeliveredToday: false, dailyInteractionToday: true, dailyDelivery: 'pending', currentContentVersion: 'v1', activeRows: [], preparationDate: localDate });
  assert.equal(pending.action, 'wait_for_delivery');
  active = [];
  delivered = false;
}

assert.equal(signatures.size, 30);
console.log('30-day one-NEXT lifecycle simulation: PASS');
