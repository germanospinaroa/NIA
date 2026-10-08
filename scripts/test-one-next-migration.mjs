import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20261008200000_one_next_intervention.sql', 'utf8');
assert.match(migration, /row_number\(\) over/i);
assert.match(migration, /status = 'invalidated'/i);
assert.match(migration, /approved_intervention_buffer_one_active_next/);
assert.match(migration, /execution_runs_active_production_concurrency/);
assert.match(migration, /where status in \('approved', 'buffered'\)/i);
console.log('one-NEXT migration contract tests: PASS');
