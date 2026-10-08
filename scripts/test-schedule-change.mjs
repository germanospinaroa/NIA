import assert from 'node:assert/strict';
import fs from 'node:fs';
import { addLocalDays, dueSlots, nextPsychologicalDeliveryDate } from '../lib/server/whatsapp-schedule.ts';
import { orchestrateRefillUsers } from '../lib/server/refill-approved-buffer.ts';

const bogota = { timezone: 'America/Bogota', message_time_1: '16:15', message_frequency: 1, message_time_2: null };
const at1400 = new Date('2026-10-08T19:00:00.000Z');

assert.equal(nextPsychologicalDeliveryDate(bogota, at1400), '2026-10-08');
assert.equal(nextPsychologicalDeliveryDate({ ...bogota, message_time_1: '14:00' }, at1400), '2026-10-09');
assert.equal(nextPsychologicalDeliveryDate(bogota, at1400, { alreadyDeliveredToday: true, dailyInteractionToday: true }), '2026-10-09');
assert.equal(nextPsychologicalDeliveryDate(bogota, at1400, { alreadyDeliveredToday: false, dailyInteractionToday: true }), '2026-10-08');
assert.equal(nextPsychologicalDeliveryDate({ ...bogota, message_time_1: '18:30' }, new Date('2026-10-08T19:30:00.000Z')), '2026-10-08');
assert.equal(nextPsychologicalDeliveryDate({ ...bogota, message_time_1: '18:30' }, new Date('2026-10-08T20:00:00.000Z')), '2026-10-08');
assert.equal(nextPsychologicalDeliveryDate({ ...bogota, message_time_1: '16:30' }, new Date('2026-10-08T22:00:00.000Z')), '2026-10-09');
assert.equal(nextPsychologicalDeliveryDate({ timezone: 'America/New_York', message_time_1: '16:15' }, new Date('2026-10-08T19:00:00.000Z')), '2026-10-08');
assert.equal(addLocalDays('2026-10-08', 1), '2026-10-09');
assert.deepEqual(dueSlots(bogota, new Date('2026-10-08T21:15:00.000Z')), [{ slot: '1', localDate: '2026-10-08' }]);

let refillCalls = 0;
const emptyResult = { created: [], usage: { estimatedCostUsd: 0 } };
const gapResult = await orchestrateRefillUsers([{ userId: 'u1', bufferBefore: 5, requiredLocalDate: '2026-10-08', requiredDateCovered: false, refillStartDate: '2026-10-08' }], { refill: async (_userId, options) => { refillCalls += 1; assert.equal(options.requiredLocalDate, '2026-10-08'); return emptyResult; }, globalMaxCostUsd: 1 });
assert.equal(refillCalls, 1);
assert.equal(gapResult.users[0].priority, 'critical');

refillCalls = 0;
await orchestrateRefillUsers([{ userId: 'u2', bufferBefore: 5, requiredLocalDate: '2026-10-08', requiredDateCovered: true }], { refill: async () => { refillCalls += 1; return emptyResult; }, globalMaxCostUsd: 1 });
assert.equal(refillCalls, 0);

const profileRoute = fs.readFileSync('app/api/profile/route.ts', 'utf8');
const reconciliation = fs.readFileSync('lib/server/delivery-schedule-reconciliation.ts', 'utf8');
const refill = fs.readFileSync('lib/server/refill-approved-buffer.ts', 'utf8');
const daily = fs.readFileSync('lib/server/daily-message.ts', 'utf8');
const delivery = fs.readFileSync('lib/server/whatsapp-daily.ts', 'utf8');
assert.match(profileRoute, /reconcileUserDeliverySchedule/);
assert.match(reconciliation, /same_day_delivery_preserved/);
assert.match(reconciliation, /buffer_coverage_repaired/);
assert.match(refill, /requiredLocalDate/);
assert.match(refill, /intended_local_date/);
assert.match(daily, /interaction_type', 'daily_message'/);
assert.match(delivery, /claimDelivery/);
assert.doesNotMatch(reconciliation, /nia_welcome/);

console.log('schedule change and date coverage tests: PASS');
