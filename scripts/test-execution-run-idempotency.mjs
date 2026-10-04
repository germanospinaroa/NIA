import assert from 'node:assert/strict';
import fs from 'node:fs';
import { startIdempotentExecutionRun, startQaExecutionRun } from '../lib/server/operational-observability.ts';

const claimMigration = fs.readFileSync('supabase/migrations/20261004160000_fix_claim_qa_execution_run_ambiguity.sql', 'utf8');
assert.match(claimMigration, /from public\.execution_runs as er/);
assert.match(claimMigration, /er\.user_id = p_user_id/);
assert.match(claimMigration, /er\.idempotency_key = p_idempotency_key/);
assert.match(claimMigration, /er\.execution_context = 'qa'/);
assert.match(claimMigration, /er\.concurrency_key = p_concurrency_key/);
assert.match(claimMigration, /er\.status in \('started', 'generating', 'auditing'\)/);
assert.match(claimMigration, /where er\.id = current_run\.id/);

const userId = '6f97c383-4882-4b52-a362-183641ed505e';
const key = `admin_qa:${userId}:2026-10-03`;
const rows = [];

function query(table, operation = 'select', payload = null) {
  const filters = [];
  return {
    select() { return this; },
    eq(column, value) { filters.push([column, value]); return this; },
    in(column, values) { filters.push([column, values]); return this; },
    order() { return this; },
    limit() { return this; },
    async maybeSingle() {
      const found = rows.filter(row => filters.every(([column, value]) => Array.isArray(value) ? value.includes(row[column]) : row[column] === value));
      return { data: found[0] ?? null, error: null };
    },
    async single() {
      if (operation === 'insert') {
        await new Promise(resolve => setTimeout(resolve, 5));
        const duplicate = rows.some(row => row.user_id === payload.user_id && (row.idempotency_key === payload.idempotency_key || (payload.execution_context === 'qa' && row.execution_context === 'qa' && row.concurrency_key === payload.concurrency_key && ['started', 'generating', 'auditing'].includes(row.status))));
        if (duplicate) return { data: null, error: { message: 'duplicate key', code: '23505' } };
        const row = { id: crypto.randomUUID(), ...payload, started_at: new Date().toISOString(), status: 'started' };
        rows.push(row);
        return { data: { id: row.id }, error: null };
      }
      return { data: null, error: null };
    },
    insert(value) { return query(table, 'insert', value); },
  };
}

const db = { from(table) { assert.equal(table, 'execution_runs'); return query(table); } };
const first = await startIdempotentExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: key, requestId: crypto.randomUUID() });
assert.equal(first.created, true);
assert.equal(rows.length, 1);
assert.match(first.context.requestId, /^[0-9a-f-]{36}$/i);
assert.equal(first.context.idempotencyKey, key);

const second = await startIdempotentExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: key, requestId: crypto.randomUUID() });
assert.equal(second.created, false);
assert.equal(second.context.executionId, first.context.executionId);
assert.equal(rows.length, 1);

const concurrent = await Promise.all([
  startIdempotentExecutionRun(db, { userId: '11111111-1111-4111-8111-111111111111', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:user-2:2026-10-03', requestId: crypto.randomUUID() }),
  startIdempotentExecutionRun(db, { userId: '11111111-1111-4111-8111-111111111111', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:user-2:2026-10-03', requestId: crypto.randomUUID() }),
]);
assert.equal(rows.filter(row => row.idempotency_key === 'admin_qa:user-2:2026-10-03').length, 1);
assert.equal(concurrent.filter(result => result.created).length, 1);
assert.equal(concurrent[0].context.executionId, concurrent[1].context.executionId);

const qaConcurrency = 'admin_qa_active:user-3';
const qaRuns = await Promise.all([
  startIdempotentExecutionRun(db, { userId: '22222222-2222-4222-8222-222222222222', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:run-1', requestId: crypto.randomUUID(), executionContext: 'qa', concurrencyKey: qaConcurrency }),
  startIdempotentExecutionRun(db, { userId: '22222222-2222-4222-8222-222222222222', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:run-2', requestId: crypto.randomUUID(), executionContext: 'qa', concurrencyKey: qaConcurrency }),
]);
assert.equal(qaRuns.filter(result => result.created).length, 1, 'solo una QA activa debe ganar la concurrencia');
assert.equal(qaRuns.filter(result => result.active).length, 1, 'la segunda QA concurrente debe reutilizar la activa');
const activeRow = rows.find(row => row.user_id === '22222222-2222-4222-8222-222222222222');
activeRow.status = 'failed';
const nextQa = await startIdempotentExecutionRun(db, { userId: '22222222-2222-4222-8222-222222222222', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:run-3', requestId: crypto.randomUUID(), executionContext: 'qa', concurrencyKey: qaConcurrency });
assert.equal(nextQa.created, true, 'una QA terminada no debe bloquear la siguiente');
const nextRow = rows.find(row => row.id === nextQa.context.executionId);
nextRow.status = 'no_approved_intervention';
const afterRejected = await startIdempotentExecutionRun(db, { userId: '22222222-2222-4222-8222-222222222222', channel: 'whatsapp', triggerSource: 'admin_qa', idempotencyKey: 'admin_qa:run-4', requestId: crypto.randomUUID(), executionContext: 'qa', concurrencyKey: qaConcurrency });
assert.equal(afterRejected.created, true, 'una QA sin candidata aprobada no debe bloquear la siguiente');

const qaRpcRows = [];
const qaDb = {
  rpc(name, args) {
    assert.equal(name, 'claim_qa_execution_run');
    const current = qaRpcRows.find(row => row.user_id === args.p_user_id && row.concurrency_key === args.p_concurrency_key && ['started', 'generating', 'auditing'].includes(row.status));
    if (current && new Date(current.started_at) > new Date(args.p_stale_before)) return Promise.resolve({ data: [{ execution_id: current.id, request_id: current.request_id, idempotency_key: current.idempotency_key, status: current.status, started_at: current.started_at, created: false, active: true, stale_replaced: false }], error: null });
    if (current) { current.status = 'failed'; current.failure_code = 'qa_stale_execution'; }
    const row = { id: crypto.randomUUID(), user_id: args.p_user_id, request_id: args.p_request_id, idempotency_key: args.p_idempotency_key, concurrency_key: args.p_concurrency_key, status: 'started', started_at: new Date().toISOString() };
    qaRpcRows.push(row);
    return Promise.resolve({ data: [{ execution_id: row.id, request_id: row.request_id, idempotency_key: row.idempotency_key, status: row.status, started_at: row.started_at, created: true, active: true, stale_replaced: Boolean(current) }], error: null });
  },
};
const qaFirst = await startQaExecutionRun(qaDb, { userId, requestId: crypto.randomUUID(), idempotencyKey: 'admin_qa:stale-1', concurrencyKey: 'admin_qa_active:' + userId });
assert.equal(qaFirst.created, true);
const qaActive = await startQaExecutionRun(qaDb, { userId, requestId: crypto.randomUUID(), idempotencyKey: 'admin_qa:active-2', concurrencyKey: 'admin_qa_active:' + userId });
assert.equal(qaActive.created, false);
assert.equal(qaActive.active, true);
qaRpcRows[0].started_at = new Date(Date.now() - 16 * 60 * 1000).toISOString();
const qaAfterStale = await startQaExecutionRun(qaDb, { userId, requestId: crypto.randomUUID(), idempotencyKey: 'admin_qa:stale-3', concurrencyKey: 'admin_qa_active:' + userId });
assert.equal(qaAfterStale.created, true);
assert.equal(qaAfterStale.staleReplaced, true);
assert.equal(qaRpcRows.filter(row => row.status === 'failed' && row.failure_code === 'qa_stale_execution').length, 1);

console.log('execution run idempotency tests: PASS');
