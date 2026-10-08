import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateReceptionStage } from '../lib/server/reception-progression.ts';

const daily = fs.readFileSync('lib/server/daily-message.ts', 'utf8');
const whatsapp = fs.readFileSync('lib/server/whatsapp-daily.ts', 'utf8');
const onboarding = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const finalization = fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8');
const reception = fs.readFileSync('lib/server/reception-progression.ts', 'utf8');

assert.doesNotMatch(daily, /ensureWelcome/);
assert.doesNotMatch(daily, /nia_welcome|kind: ['"]welcome/);
assert.match(daily, /interaction_type: 'daily_message'/);
assert.match(daily, /loadApprovedMessageForDate/);
assert.match(daily, /consumeApprovedMessage/);
assert.match(daily, /approved_buffer_underflow/);
assert.doesNotMatch(whatsapp, /daily\.kind === ['"]welcome/);

assert.doesNotMatch(onboarding, /fetch\(['"]\/api\/daily/);
assert.doesNotMatch(onboarding, /first_intervention/);
assert.match(onboarding, /fetch\(['"]\/api\/onboarding\/complete/);
assert.doesNotMatch(finalization, /refillApprovedBuffer|generateWriterV2|judgeSemanticFidelity/);
assert.match(finalization, /scheduleWelcomeDelivery/);
assert.match(reception, /reception starts at tuning/);
assert.equal(calculateReceptionStage({ welcomeDelivered: false, psychologicalInterventionsDelivered: 0 }), 'tuning');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 0 }), 'tuning');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 1 }), 'tuning');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 2 }), 'building');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 4 }), 'building');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 5 }), 'established');

console.log('message lifecycle tests: PASS (welcome independent, same daily pipeline, no onboarding bypass)');
