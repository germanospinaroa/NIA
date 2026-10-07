import assert from 'node:assert/strict';
import fs from 'node:fs';
import { firstPsychologicalLocalDate } from '../lib/server/whatsapp-schedule.ts';
import { chooseFirstIntendedLocalDate, hasCompletedOnboardingPersonalization, normalizeOnboardingSchedule } from '../lib/server/onboarding-finalization.ts';

const nowBefore = new Date('2026-10-06T12:00:00Z');
const nowAfter = new Date('2026-10-06T12:50:00Z');
const candidate = firstPsychologicalLocalDate('America/Bogota', '08:00', nowBefore);
assert.equal(candidate, '2026-10-06');
assert.equal(chooseFirstIntendedLocalDate({ candidate, timezone: 'America/Bogota', now: nowBefore, occupied: false }), '2026-10-06');
assert.equal(firstPsychologicalLocalDate('America/Bogota', '08:00', nowAfter), '2026-10-07');

const occupiedToday = firstPsychologicalLocalDate('America/Bogota', '17:00', new Date('2026-10-06T16:00:00Z'));
assert.equal(chooseFirstIntendedLocalDate({ candidate: occupiedToday, timezone: 'America/Bogota', now: new Date('2026-10-06T16:00:00Z'), occupied: true }), '2026-10-07');

const normalized = normalizeOnboardingSchedule({ message_frequency: 2, message_time_1: '08:00', message_time_2: '18:00', timezone: 'America/Bogota' });
assert.equal(normalized.message_frequency, 1);
assert.equal(normalized.message_time_2, null);
assert.equal(normalized.message_time_1, '08:00');
assert.equal(normalized.timezone, 'America/Bogota');
assert.equal(hasCompletedOnboardingPersonalization({ learning_profile: { onboarding: { personalization: { status: 'answered' } } } }), true);
assert.equal(hasCompletedOnboardingPersonalization({ learning_profile: { onboarding: { personalization: { status: 'skipped' } } } }), true);
assert.equal(hasCompletedOnboardingPersonalization({ learning_profile: {} }), false);

const route = fs.readFileSync('app/api/onboarding/complete/route.ts', 'utf8');
const page = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
assert.match(route, /completeOnboardingAfterWhatsapp/);
assert.match(fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8'), /interaction_type.*daily_message/);
assert.match(fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8'), /whatsapp_daily_deliveries/);
assert.match(fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8'), /onboarding_completed: true/);
assert.doesNotMatch(page, /stage === 'ready'/);
console.log('onboarding finalization tests: PASS (timing, occupied day, normalization, idempotent welcome contract)');
