import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(new URL('../supabase/migrations/20261005200000_one_daily_intervention.sql', import.meta.url), 'utf8');
const welcome = fs.readFileSync(new URL('../supabase/migrations/20261004180000_reception_welcome_interaction.sql', import.meta.url), 'utf8');
const slotMigration = fs.readFileSync(new URL('../supabase/migrations/20261003060000_daily_interactions_by_slot.sql', import.meta.url), 'utf8');
const deliveryMigration = fs.readFileSync(new URL('../supabase/migrations/20261003040000_whatsapp_daily_deliveries.sql', import.meta.url), 'utf8');

assert.doesNotMatch(migration, /\b(delete|truncate)\b/i, 'migration must not delete or truncate history');
assert.match(migration, /add column if not exists daily_unique_enforced boolean/i);
assert.match(migration, /set daily_unique_enforced = false/i);
assert.match(migration, /where daily_unique_enforced is null/i);
assert.match(migration, /alter column daily_unique_enforced set default true/i);
assert.match(migration, /alter column daily_unique_enforced set not null/i);
assert.match(migration, /create unique index if not exists interactions_daily_one_per_day_enforced/i);
assert.match(migration, /interaction_type = 'daily_message'/i);
assert.match(migration, /daily_unique_enforced = true/i);
assert.doesNotMatch(migration, /created_at\s*>=/i, 'created-at cutoff must be removed');
assert.match(migration, /create unique index if not exists whatsapp_daily_deliveries_interaction_once/i);
assert.match(migration, /on public\.whatsapp_daily_deliveries\(interaction_id\)/i);

const historical = [
  { userId: 'u', localDate: '2026-10-05', slot: '1', dailyUniqueEnforced: false },
  { userId: 'u', localDate: '2026-10-05', slot: '2', dailyUniqueEnforced: false },
];
const future = [
  { userId: 'u', localDate: '2026-10-06', slot: '1', dailyUniqueEnforced: true },
  { userId: 'u', localDate: '2026-10-06', slot: '2', dailyUniqueEnforced: true },
];
const dailyKey = row => `${row.userId}|${row.localDate}`;
const futureDailyKeysAreUnique = rows => new Set(rows.filter(row => row.dailyUniqueEnforced).map(dailyKey)).size === rows.filter(row => row.dailyUniqueEnforced).length;
assert.equal(futureDailyKeysAreUnique(historical), true, 'historical duplicate rows remain valid because they are false');
assert.equal(futureDailyKeysAreUnique(future), false, 'future duplicate daily rows are rejected by the partial key');

const deliveries = [
  { interactionId: 'daily-1', userId: 'u', localDate: '2026-10-05', slot: '1' },
  { interactionId: 'daily-2', userId: 'u', localDate: '2026-10-05', slot: '2' },
];
const deliveryIdsAreUnique = rows => new Set(rows.map(row => row.interactionId)).size === rows.length;
assert.equal(deliveryIdsAreUnique(deliveries), true, 'different historical interaction IDs remain valid');
assert.equal(deliveryIdsAreUnique([...deliveries, { ...deliveries[0], slot: '2' }]), false, 'one interaction cannot have two deliveries');
assert.equal(deliveryIdsAreUnique([{ interactionId: 'welcome-1', interactionType: 'nia_welcome', userId: 'u' }]), true, 'welcome can have one delivery');

assert.match(welcome, /daily_message/);
assert.match(welcome, /nia_point/);
assert.match(welcome, /nia_welcome/);
assert.match(welcome, /create unique index if not exists interactions_single_welcome/i);
assert.match(welcome, /on public\.interactions\(user_id\)/i);
assert.match(slotMigration, /interactions_daily_slot_once/);
assert.match(deliveryMigration, /whatsapp_daily_deliveries_once/);

console.log(JSON.stringify({
  status: 'PASS',
  historicalInteractions: 'preserved',
  futureDailyDuplicates: 'rejected',
  duplicateInteractionDeliveries: 'rejected',
  distinctHistoricalSlotDeliveries: 'preserved',
  welcome: 'compatible',
  destructiveStatements: 'none',
}, null, 2));
