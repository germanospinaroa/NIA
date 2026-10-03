import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dueSlots, localClock } from '../lib/server/whatsapp-schedule.ts';

const profile = { timezone: 'America/Bogota', message_frequency: 1, message_time_1: '08:00', message_time_2: null };
const morning = new Date('2026-10-03T13:05:00.000Z');
assert.deepEqual(localClock('America/Bogota', morning), { hour: 8, minute: 5, date: '2026-10-03' });
assert.deepEqual(dueSlots(profile, morning), [{ slot: '08:00', localDate: '2026-10-03' }]);
assert.deepEqual(dueSlots(profile, new Date('2026-10-03T13:14:00.000Z')), [{ slot: '08:00', localDate: '2026-10-03' }]);
assert.deepEqual(dueSlots(profile, new Date('2026-10-03T13:15:00.000Z')), []);
assert.deepEqual(dueSlots({ ...profile, message_frequency: 2, message_time_2: '18:00' }, new Date('2026-10-03T23:05:00.000Z')), [{ slot: '18:00', localDate: '2026-10-03' }]);
const route = fs.readFileSync(new URL('../app/api/cron/daily-whatsapp/route.ts', import.meta.url), 'utf8');
const delivery = fs.readFileSync(new URL('../lib/server/whatsapp-daily.ts', import.meta.url), 'utf8');
assert.match(route, /CRON_SECRET/);
assert.match(delivery, /whatsapp_daily_deliveries/);
assert.match(delivery, /providerMessageId/);
assert.match(delivery, /claim_token/);
assert.match(delivery, /daily_whatsapp_schema_missing/);
console.log('daily whatsapp tests: PASS');
