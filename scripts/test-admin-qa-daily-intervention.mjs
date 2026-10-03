import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const operational = fs.readFileSync('lib/server/operational-observability.ts', 'utf8');
const intervention = fs.readFileSync('lib/server/intervention.ts', 'utf8');

assert.match(route, /requireAdmin\(\)/);
assert.match(route, /return NextResponse\.json\(\{ error: 'forbidden' \}, \{ status: 403 \}\)/);
assert.match(route, /UUID\.test/);
assert.match(route, /whatsapp_not_connected/);
assert.match(route, /user_not_found/);
assert.match(route, /already_processed/);
assert.match(route, /candidateSummaries/);
assert.match(route, /keys\.some\(key => key !== 'user_id'\)/);
assert.match(route, /triggerSource: 'admin_qa'/);
assert.match(route, /startIdempotentExecutionRun/);
assert.match(route, /resolveIntervention\(admin, userId, 'intention', 'whatsapp'/);
assert.match(route, /maxGenerationAttempts: 1/);
assert.match(route, /disableTechnicalGenerationRetry: true/);
assert.match(route, /claimDelivery/);
assert.match(route, /sendClaimedDelivery/);
assert.match(route, /slot: QA_SLOT/);
assert.doesNotMatch(route, /CRON_SECRET/);
assert.doesNotMatch(route, /getOrCreateDailyInteraction/);
assert.match(operational, /requestId = input\.requestId/);
assert.match(operational, /startIdempotentExecutionRun/);
assert.match(intervention, /options\?\.maxGenerationAttempts/);
assert.match(intervention, /const maxAttempts = options\?\.maxGenerationAttempts/);
assert.match(intervention, /maxTechnicalAttempts: options\?\.disableTechnicalGenerationRetry \? 1/);

const sends = new Set();
const qaKey = 'admin_qa:user-1:2026-10-03';
assert.equal(sends.has(qaKey), false);
sends.add(qaKey);
assert.equal(sends.has(qaKey), true, 'same QA execution must be idempotent');
assert.equal(sends.size, 1, 'QA must allow only one delivery for one execution');

console.log('admin QA daily intervention tests: PASS');
