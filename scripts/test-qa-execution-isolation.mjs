import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const intervention = fs.readFileSync('lib/server/intervention.ts', 'utf8');

// Execution A represents a completed run. Execution B must not inherit any of A's IDs.
const executionA = {
  id: 'execution-a',
  status: 'approved',
  interventionId: 'intervention-a',
  interactionId: 'interaction-a',
  deliveryId: 'delivery-a',
};
const executionB = {
  id: 'execution-b',
  status: 'failed',
  failureCode: 'llm_timeout',
  candidateCount: 0,
  interventionId: null,
  interactionId: null,
  deliveryId: null,
  sender: null,
  evolution: null,
  whatsapp: null,
};

assert.equal(executionB.status, 'failed');
assert.equal(executionB.failureCode, 'llm_timeout');
for (const key of ['interventionId', 'interactionId', 'deliveryId']) assert.equal(executionB[key], null);
for (const key of ['sender', 'evolution', 'whatsapp']) assert.equal(executionB[key], null);
for (const value of Object.values(executionB)) assert.notEqual(value, executionA.interventionId);

// The QA path cannot reuse a historical intervention after a provider failure.
assert.match(intervention, /if \(execution\?\.executionContext === 'qa'\) throw error/);
assert.match(intervention, /if \(execution\?\.executionContext === 'qa'\) \{/);
assert.doesNotMatch(route, /createSyntheticDownstreamFixture/);
assert.doesNotMatch(route, /candidateSummariesForExecution/);
assert.match(route, /updateExecutionRun\(admin, run\.context, \{ status: 'failed', failure: error \}\)/);
assert.match(route, /slot = qaSlot\(run\.context\.executionId\)/);
assert.match(route, /eq\('slot', qaSlot\(executionId\)\)/);
assert.match(route, /eq\('execution_run_id', executionId\)/);

console.log('QA execution isolation and timeout regressions: PASS');
