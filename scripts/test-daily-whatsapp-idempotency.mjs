import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dueSlots } from '../lib/server/whatsapp-schedule.ts';

const schedule = { timezone: 'America/Bogota', message_frequency: 2, message_time_1: '12:30', message_time_2: '12:45' };
assert.deepEqual(dueSlots(schedule, new Date('2026-10-03T17:38:00.000Z')), [{ slot: '1', localDate: '2026-10-03' }]);
assert.deepEqual(dueSlots(schedule, new Date('2026-10-03T17:53:00.000Z')), [{ slot: '2', localDate: '2026-10-03' }]);

const deliveries = new Map();
const sends = [];
function claim(userId, date, slot) {
  const key = `${userId}:${date}:${slot}`;
  if (deliveries.has(key)) return false;
  deliveries.set(key, { status: 'sent' });
  sends.push(key);
  return true;
}

assert.equal(claim('u1', '2026-10-03', '1'), true);
assert.equal(claim('u1', '2026-10-03', '1'), false);
assert.equal(claim('u1', '2026-10-03', '2'), true);
assert.equal(claim('u1', '2026-10-03', '2'), false);
assert.deepEqual(sends, ['u1:2026-10-03:1', 'u1:2026-10-03:2']);
assert.equal(new Set(sends).size, 2);

const dailySource = fs.readFileSync(new URL('../lib/server/daily-message.ts', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261003060000_daily_interactions_by_slot.sql', import.meta.url), 'utf8');
assert.match(dailySource, /daily:\$\{date\}:\$\{slot \?\? 'web'\}/);
assert.match(dailySource, /local_date: date, slot/);
assert.match(migration, /interactions_daily_slot_once/);
assert.match(migration, /drop index if exists public\.interactions_daily_once/);
console.log('daily whatsapp idempotency tests: PASS');
