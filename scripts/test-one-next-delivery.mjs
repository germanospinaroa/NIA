import assert from 'node:assert/strict';
import { chooseNextIntervention } from '../lib/server/next-intervention.ts';
import { dateForPreparedNext } from '../lib/server/whatsapp-schedule.ts';

const schedule = { timezone: 'America/Bogota', message_time_1: '17:15' };
const now = new Date('2026-10-08T21:00:00.000Z'); // 16:00 local
const versionA = 'a';
const versionB = 'b';
const row = (id, date, version = versionA) => ({ id, intendedLocalDate: date, contextVersion: version, status: 'buffered', createdAt: `2026-10-08T${id}:00.000Z` });

// Incident reproduction: a ready-today NEXT survives the exact delivery tick.
const readyTodayAtTick = chooseNextIntervention({ today: '2026-10-08', schedule, now: new Date('2026-10-08T22:15:00.000Z'), alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionA, activeRows: [row('01', '2026-10-08')], preparationDate: '2026-10-09' });
assert.equal(readyTodayAtTick.action, 'preserve');
assert.equal(readyTodayAtTick.keepId, '01');
assert.equal(readyTodayAtTick.invalidateIds.length, 0);

// Refill first / daily second and daily first / refill second are both safe.
const afterSent = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: true, dailyInteractionToday: true, dailyDelivery: 'sent', currentContentVersion: versionA, activeRows: [row('02', '2026-10-09')], preparationDate: '2026-10-09' });
assert.equal(afterSent.action, 'preserve');
const sentWithoutNext = chooseNextIntervention({ today: '2026-10-09', schedule, now, alreadyDeliveredToday: true, dailyInteractionToday: true, dailyDelivery: 'sent', currentContentVersion: versionA, activeRows: [], preparationDate: '2026-10-10' });
assert.equal(sentWithoutNext.action, 'prepare');
assert.equal(sentWithoutNext.targetLocalDate, '2026-10-10');
const pending = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: true, dailyDelivery: 'pending', currentContentVersion: versionA, activeRows: [], preparationDate: '2026-10-08' });
assert.equal(pending.action, 'wait_for_delivery');
const failed = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: true, dailyDelivery: 'failed', currentContentVersion: versionA, activeRows: [], preparationDate: '2026-10-08' });
assert.equal(failed.action, 'wait_for_delivery');

// No NEXT creates one target; repeated refill with a valid NEXT does no work.
const missing = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionA, activeRows: [], preparationDate: '2026-10-08' });
assert.equal(missing.action, 'prepare');
const valid = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionA, activeRows: [row('03', '2026-10-09')], preparationDate: '2026-10-09' });
assert.equal(valid.action, 'preserve');

// Context/goal/preference changes invalidate only NEXT; delivered history is
// not part of this decision and can never be invalidated here.
const stale = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionB, activeRows: [row('04', '2026-10-09', versionA)], preparationDate: '2026-10-09' });
assert.equal(stale.action, 'invalidate_and_prepare');
assert.deepEqual(stale.invalidateIds, ['04']);

// A schedule-only change reuses the same content and moves it to today when
// the preparation policy still permits today.
const rescheduled = chooseNextIntervention({ today: '2026-10-08', schedule: { ...schedule, message_time_1: '18:30' }, now, alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionA, activeRows: [row('05', '2026-10-09')], preparationDate: '2026-10-08' });
assert.equal(rescheduled.action, 'reschedule');
assert.equal(rescheduled.keepId, '05');
assert.equal(rescheduled.targetLocalDate, '2026-10-08');

// Multiple legacy rows collapse to one; only the selected NEXT survives.
const legacy = chooseNextIntervention({ today: '2026-10-08', schedule, now, alreadyDeliveredToday: false, dailyInteractionToday: false, dailyDelivery: 'none', currentContentVersion: versionA, activeRows: [row('06', '2026-10-09'), row('07', '2026-10-10'), row('08', '2026-10-11')], preparationDate: '2026-10-09' });
assert.equal(legacy.keepId, '06');
assert.deepEqual(legacy.invalidateIds, ['07', '08']);

// A prepared NEXT is reusable without the 15-minute generation margin.
assert.equal(dateForPreparedNext({ timezone: 'America/Bogota', message_time_1: '18:00' }, new Date('2026-10-08T22:48:00.000Z')), '2026-10-08');
assert.equal(dateForPreparedNext({ timezone: 'America/Bogota', message_time_1: '18:00' }, new Date('2026-10-08T22:59:00.000Z')), '2026-10-08');
assert.equal(dateForPreparedNext({ timezone: 'America/Bogota', message_time_1: '18:00' }, new Date('2026-10-08T23:01:00.000Z')), '2026-10-09');
assert.equal(dateForPreparedNext({ timezone: 'America/Bogota', message_time_1: '18:00' }, new Date('2026-10-08T22:48:00.000Z'), true), '2026-10-09');

console.log('one-NEXT delivery contract tests: PASS');
