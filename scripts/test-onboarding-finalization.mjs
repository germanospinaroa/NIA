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
const finalization = fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8');
const webhook = fs.readFileSync('app/api/whatsapp/webhook/route.ts', 'utf8');
assert.match(route, /completeOnboardingAfterWhatsapp/);
assert.match(finalization, /interaction_type.*daily_message/);
assert.match(finalization, /whatsapp_daily_deliveries/);
assert.match(finalization, /onboarding_completed: true/);
assert.match(finalization, /hasConfirmedOnboardingIdentity/);
assert.match(finalization, /welcome_persistence_failed/);
assert.match(finalization, /onboarding_completed_at/);
assert.match(finalization, /dueAt: new Date\(now\.getTime\(\) \+ 60_000\)/);
assert.match(page, /fetch\('\/api\/onboarding\/complete'/);
assert.match(page, /router\.replace\('\/app'\)/);
assert.match(page, /completionRetry/);
assert.match(webhook, /hasConfirmedOnboardingIdentity/);
assert.match(webhook, /const confirmedIdentity/);
assert.doesNotMatch(webhook, /profile\?\.preferred_name\?\.trim\(\) \|\| profile\?\.first_name/);
assert.doesNotMatch(page, /stage === 'ready'/);
console.log('onboarding finalization tests: PASS (timing, occupied day, normalization, idempotent welcome contract)');
