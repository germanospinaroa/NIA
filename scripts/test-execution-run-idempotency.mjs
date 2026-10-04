import assert from 'node:assert/strict';
import { startIdempotentExecutionRun } from '../lib/server/operational-observability.ts';

const userId = '6f97c383-4882-4b52-a362-183641ed505e';
const key = `admin_qa:${userId}:2026-10-03`;
const rows = [];

function query(table, operation = 'select', payload = null) {
  const filters = [];
  return {
    select() { return this; },
    eq(column, value) { filters.push([column, value]); return this; },
    async maybeSingle() {
      const found = rows.filter(row => row.user_id === filters.find(([key]) => key === 'user_id')?.[1] && row.idempotency_key === filters.find(([key]) => key === 'idempotency_key')?.[1]);
      return { data: found[0] ?? null, error: null };
    },
    async single() {
      if (operation === 'insert') {
        await new Promise(resolve => setTimeout(resolve, 5));
        const duplicate = rows.some(row => row.user_id === payload.user_id && row.idempotency_key === payload.idempotency_key);
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

console.log('execution run idempotency tests: PASS');
