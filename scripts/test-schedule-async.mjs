import assert from 'node:assert/strict';
import fs from 'node:fs';

const profileRoute = fs.readFileSync('app/api/profile/route.ts', 'utf8');
const reconciliation = fs.readFileSync('lib/server/delivery-schedule-reconciliation.ts', 'utf8');
const refillRoute = fs.readFileSync('app/api/cron/refill-buffer/route.ts', 'utf8');
const refill = fs.readFileSync('lib/server/refill-approved-buffer.ts', 'utf8');
const onboardingRoute = fs.readFileSync('app/api/onboarding/complete/route.ts', 'utf8');
const bufferPrepareRoute = fs.readFileSync('app/api/buffer/prepare/route.ts', 'utf8');
const tuPage = fs.readFileSync('app/app/tu/page.tsx', 'utf8');

assert.match(profileRoute, /inspectUserDeliverySchedule/);
assert.doesNotMatch(profileRoute, /refillApprovedBuffer|generateWriterV2|evaluateWriterV2|judgeSemanticFidelity/);
assert.doesNotMatch(reconciliation, /refillApprovedBuffer|generateWriterV2|evaluateWriterV2|judgeSemanticFidelity/);
assert.doesNotMatch(onboardingRoute, /refillApprovedBuffer|generateWriterV2|judgeSemanticFidelity/);
assert.doesNotMatch(bufferPrepareRoute, /refillApprovedBuffer|generateWriterV2|judgeSemanticFidelity/);
assert.match(reconciliation, /pending_buffer_reconciliation/);
assert.match(reconciliation, /schedule_reconciliation_pending/);
assert.match(refill, /buffer_coverage_repaired/);
assert.match(refill, /schedule_reconciled/);
assert.match(refillRoute, /refillEligibleProductionUsers/);
assert.match(refillRoute, /REFILL_PRODUCTION_ENABLED/);
assert.match(tuPage, /setSavedMessage\('Cambios guardados\.'\)/);
assert.match(tuPage, /finally \{ setSaving\(false\); \}/);
assert.doesNotMatch(profileRoute, /void\s+inspectUserDeliverySchedule|after\(/);

console.log('schedule async boundary tests: PASS (PATCH is lightweight; refill owns generation)');
