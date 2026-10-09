import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261009010000_qa_daily_interaction_type.sql', 'utf8');
const daily = fs.readFileSync('lib/server/daily-message.ts', 'utf8');
const progression = fs.readFileSync('lib/server/reception-progression.ts', 'utf8');
const refill = fs.readFileSync('lib/server/refill-approved-buffer.ts', 'utf8');
const traceControl = fs.readFileSync('app/admin/qa-real-control.tsx', 'utf8');

assert.match(route, /interaction_type: 'qa_daily_message'/);
assert.match(route, /daily_unique_enforced: false/);
assert.match(route, /const generation = \{ \.\.\.\(await sanitizedGeneration/);
assert.match(route, /slot = qaSlot\(run\.context\.executionId\)/);
assert.match(route, /qa_downstream_failed/);
assert.match(route, /constraint/);
assert.doesNotMatch(route, /interaction_type: 'daily_message'/);

assert.match(migration, /qa_daily_message/);
assert.match(migration, /daily_message/);
assert.match(migration, /drop constraint if exists interactions_interaction_type_check/);
assert.doesNotMatch(migration, /drop index/i);

// Production lanes remain explicitly scoped to real daily interactions.
assert.match(daily, /eq\('interaction_type', 'daily_message'\)/);
assert.match(progression, /\['daily_message', 'nia_point'\]/);
assert.match(refill, /eq\('interaction_type', 'daily_message'\)/);
assert.doesNotMatch(daily, /qa_daily_message/);
assert.doesNotMatch(progression, /qa_daily_message/);
assert.doesNotMatch(refill, /qa_daily_message/);

// The admin UI reports editorial and downstream lanes independently.
assert.match(route, /editorial_status: editorialFailure/);
assert.match(route, /downstream_status: downstreamFailure/);
assert.match(route, /stage\('Interaction', interactionStage\?\.status === 'completed'/);
assert.match(route, /stage\('Composer', composerStage\?\.status === 'completed'/);
assert.match(traceControl, /Downstream:/);
assert.match(traceControl, /result\.generation\?\.rejected/);

console.log('QA interaction isolation tests: PASS');
