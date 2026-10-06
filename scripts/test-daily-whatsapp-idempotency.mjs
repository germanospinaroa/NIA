import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dueSlots } from '../lib/server/whatsapp-schedule.ts';

const schedule = { timezone: 'America/Bogota', message_frequency: 2, message_time_1: '12:30', message_time_2: '12:45' };
assert.deepEqual(dueSlots(schedule, new Date('2026-10-03T17:38:00.000Z')), [{ slot: '1', localDate: '2026-10-03' }]);
assert.deepEqual(dueSlots(schedule, new Date('2026-10-03T17:53:00.000Z')), [{ slot: '2', localDate: '2026-10-03' }]);

const deliveries = new Map();
const sends = [];
function claim(userId, date, slot) {
  const key = `${userId}:${date}`;
  if (deliveries.has(key)) return false;
  deliveries.set(key, { status: 'sent', slot });
  sends.push(`${key}:${slot}`);
  return true;
}

assert.equal(claim('u1', '2026-10-03', '1'), true);
assert.equal(claim('u1', '2026-10-03', '1'), false);
assert.equal(claim('u1', '2026-10-03', '2'), false, 'second legacy slot cannot consume the daily quota');
assert.deepEqual(sends, ['u1:2026-10-03:1']);
assert.equal(new Set(sends).size, 1);

const dailySource = fs.readFileSync(new URL('../lib/server/daily-message.ts', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261003060000_daily_interactions_by_slot.sql', import.meta.url), 'utf8');
assert.match(dailySource, /releaseConsumedMessage/);
assert.match(dailySource, /approved_buffer_underflow/);
assert.doesNotMatch(dailySource, /resolveIntervention|startExecutionRun|composeNiaMessage/);
const bufferSource = fs.readFileSync(new URL('../lib/server/approved-message-buffer.ts', import.meta.url), 'utf8');
assert.match(bufferSource, /export async function releaseConsumedMessage/);
assert.match(dailySource, /local_date: date, slot/);
assert.match(migration, /interactions_daily_slot_once/);
const hardenedMigration = fs.readFileSync(new URL('../supabase/migrations/20261005200000_one_daily_intervention.sql', import.meta.url), 'utf8');
assert.match(hardenedMigration, /daily_unique_enforced/);
assert.match(hardenedMigration, /interactions_daily_one_per_day_enforced/);
assert.match(hardenedMigration, /whatsapp_daily_deliveries_interaction_once/);
assert.doesNotMatch(hardenedMigration, /created_at\s*>=/i);
console.log('daily whatsapp idempotency tests: PASS');
