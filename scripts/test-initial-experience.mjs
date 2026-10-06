import assert from 'node:assert/strict';
import fs from 'node:fs';
import { firstPsychologicalLocalDate } from '../lib/server/whatsapp-schedule.ts';

const read = file => fs.readFileSync(file, 'utf8');
const access = read('app/acceso/page.tsx');
const accessRoute = read('app/api/auth/access/request/route.ts');
const login = read('app/login/page.tsx');
const recovery = read('app/forgot-password/page.tsx');
const activation = read('app/api/activation/complete/route.ts');
const activatePage = read('app/activate/page.tsx');
const onboarding = read('app/onboarding/page.tsx');
const onboardingComplete = read('app/api/onboarding/complete/route.ts');
const settings = read('app/app/tu/page.tsx');
const hotmart = read('lib/server/hotmart.ts');
const welcome = read('lib/server/welcome-delivery.ts');
const cron = read('app/api/cron/welcome/route.ts');
const welcomeCronMigration = read('supabase/migrations/20261006134000_welcome_dispatch_cron.sql');

for (const source of [access, accessRoute, login, recovery, activation, activatePage, onboarding, onboardingComplete, settings, hotmart]) {
  assert.doesNotMatch(source, /inviteUserByEmail|emailRedirectTo|resetPasswordForEmail|exchangeCodeForSession/);
}
assert.match(accessRoute, /shouldCreateUser: false/);
assert.match(access, /requestCode/);
assert.match(access, /verifyOtp/);
assert.match(login, /signInWithPassword/);
assert.doesNotMatch(login, /signInWithOtp/);
assert.doesNotMatch(activation, /ensureActivationWelcome|nia_welcome/);
assert.match(activatePage, /router\.push\('\/onboarding'\)/);
assert.match(onboarding, /stage === 'whatsapp'/);
assert.match(onboarding, /showTest=\{false\}/);
assert.match(onboarding, /useState\('08:00'\)/);
assert.match(onboarding, /message_frequency: 1/);
assert.match(onboarding, /message_time_2: null/);
assert.match(onboardingComplete, /firstIntendedLocalDate/);
assert.match(onboardingComplete, /ensureActivationWelcome/);
assert.match(onboardingComplete, /scheduleWelcomeDelivery/);
assert.match(welcome, /attempt_count/);
assert.match(welcome, /provider_message_id/);
assert.match(welcome, /locked_until/);
assert.match(welcome, /status: 'sent'/);
assert.match(cron, /sendDueWelcomeDeliveries/);
assert.match(cron, /WELCOME_CRON_SECRET/);
assert.doesNotMatch(cron, /process\.env\.CRON_SECRET/);
assert.match(welcomeCronMigration, /cron\.schedule/);
assert.match(welcomeCronMigration, /nia-welcome-dispatch/);
assert.match(welcomeCronMigration, /\* \* \* \* \*/);
assert.match(welcomeCronMigration, /net\.http_get/);
assert.match(welcomeCronMigration, /nia_welcome_cron_secret/);
assert.match(welcomeCronMigration, /vault\.decrypted_secrets/);
assert.doesNotMatch(settings, /2 veces al día|Segunda hora/);
assert.match(settings, /message_frequency: 1/);
assert.match(settings, /message_time_2: null/);

assert.equal(firstPsychologicalLocalDate('America/Bogota', '08:00', new Date('2026-10-06T12:00:00Z')), '2026-10-06');
assert.equal(firstPsychologicalLocalDate('America/Bogota', '08:00', new Date('2026-10-06T12:50:00Z')), '2026-10-07');
assert.equal(firstPsychologicalLocalDate('America/Bogota', '17:00', new Date('2026-10-06T19:00:00Z')), '2026-10-06');
assert.equal(firstPsychologicalLocalDate('America/Bogota', '08:00', new Date('2026-10-06T14:00:00Z')), '2026-10-07');

console.log('initial experience contract: PASS');
