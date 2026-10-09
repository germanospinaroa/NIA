import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const intervention = fs.readFileSync('lib/server/intervention.ts', 'utf8');
const memory = fs.readFileSync('lib/server/editorial-memory.ts', 'utf8');

assert.match(route, /resolveIntervention\(admin, userId/);
assert.match(route, /composeNiaMessage/);
assert.match(route, /claimDelivery/);
assert.match(route, /sendClaimedDelivery/);
assert.doesNotMatch(route, /createSyntheticDownstreamFixture/);
assert.match(route, /editorial_review_required/);
assert.doesNotMatch(route, /getOrCreateDailyInteraction/);
assert.doesNotMatch(route, /CRON_SECRET/);
assert.match(intervention, /execution_context: options\?\.executionContext/);
assert.match(memory, /execution_context.*qa/);
assert.doesNotMatch(route, /synthetic_qa/);
assert.doesNotMatch(route, /not_editorial_approval/);
assert.match(route, /interaction_type: 'qa_daily_message'/);
assert.match(route, /daily_unique_enforced: false/);
assert.doesNotMatch(route, /interaction_type: 'daily_message'/);

console.log('QA E2E orchestration tests: PASS');
