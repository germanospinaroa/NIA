import assert from 'node:assert/strict';
import { formatNextMessageSlot, getNextMessageSlot } from '../lib/next-message.ts';

const schedule = { message_frequency: 2, message_time_1: '12:30', message_time_2: '12:45', timezone: 'America/Bogota' };
assert.equal(formatNextMessageSlot(getNextMessageSlot(schedule, new Date('2026-10-03T17:20:00Z'))), '12:30 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot(schedule, new Date('2026-10-03T17:38:00Z'))), '12:45 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot(schedule, new Date('2026-10-03T18:00:00Z'))), 'mañana · 12:30 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot({ ...schedule, message_frequency: 1, message_time_1: '12:30', message_time_2: null }, new Date('2026-10-03T16:00:00Z'))), '12:30 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot({ ...schedule, message_frequency: 1, message_time_1: '12:30', message_time_2: null }, new Date('2026-10-03T18:00:00Z'))), 'mañana · 12:30 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot(schedule, new Date('2026-10-03T17:45:00Z'))), 'mañana · 12:30 PM');
assert.equal(formatNextMessageSlot(getNextMessageSlot({ ...schedule, timezone: 'America/New_York' }, new Date('2026-10-03T16:20:00Z'))), '12:30 PM');
assert.equal(getNextMessageSlot({ message_frequency: 1, message_time_1: null, message_time_2: null, timezone: 'America/Bogota' }, new Date()), null);
console.log('next-message tests: PASS');
