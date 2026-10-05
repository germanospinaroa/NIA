import assert from 'node:assert/strict';
import fs from 'node:fs';

const dailySource = fs.readFileSync(new URL('../lib/server/daily-message.ts', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261005200000_one_daily_intervention.sql', import.meta.url), 'utf8');
const whatsappSource = fs.readFileSync(new URL('../lib/server/whatsapp-daily.ts', import.meta.url), 'utf8');

assert.doesNotMatch(dailySource, /resolveIntervention|startExecutionRun|updateExecutionRun|composeNiaMessage|dailyIdempotencyKey|generateWriter|judge/i);
assert.match(dailySource, /loadApprovedMessageForDate/);
assert.match(dailySource, /consumeApprovedMessage/);
assert.match(dailySource, /buffer_underflow/);
assert.match(dailySource, /approved_buffer_underflow/);
assert.match(dailySource, /content: buffered\.message/);
assert.match(dailySource, /interaction_type: 'daily_message'/);
assert.match(dailySource, /eq\('local_date', date\)/);
assert.match(whatsappSource, /for \(const due of slots\.slice\(0, 1\)\)/);

assert.doesNotMatch(migration, /\b(delete|truncate)\b/i);
assert.match(migration, /interactions_daily_one_per_day_after_cutoff/);
assert.match(migration, /whatsapp_daily_psychological_one_per_day_after_cutoff/);
assert.match(migration, /interaction_type = 'daily_message'/);
assert.match(migration, /slot in \('1', '2'\)/);
assert.match(migration, /created_at >= timestamptz '2026-10-05 20:00:00\+00'/g);
assert.match(migration, /nia_welcome/);

const claimed = new Set();
function claimPsychologicalDaily(userId, localDate, slot) {
  if (!['1', '2'].includes(slot)) return true;
  const key = `${userId}:${localDate}`;
  if (claimed.has(key)) return false;
  claimed.add(key);
  return true;
}

assert.equal(claimPsychologicalDaily('u1', '2026-10-05', '1'), true);
assert.equal(claimPsychologicalDaily('u1', '2026-10-05', '2'), false);
assert.equal(claimPsychologicalDaily('u1', '2026-10-05', 'welcome:2026-10-05'), true);

console.log('buffered daily delivery tests: PASS');
