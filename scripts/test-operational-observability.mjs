import assert from 'node:assert/strict';
import { errorCode, recordEvent, recordProviderCall, safeMessage, startExecutionRun, startGenerationAttempt, finishGenerationAttempt } from '../lib/server/operational-observability.ts';

const calls = [];
let sequence = 0;

function chain(table, operation, payload) {
  const state = { table, operation, payload };
  const api = {
    insert(value) { state.operation = 'insert'; state.payload = value; return api; },
    update(value) { state.operation = 'update'; state.payload = value; return api; },
    select() { return api; },
    eq() { return api; },
    single: async () => { calls.push(state); return { data: { id: `id-${++sequence}` }, error: null }; },
    then(resolve) { calls.push(state); resolve({ data: null, error: null }); },
  };
  return api;
}

const supabase = { from(table) { return chain(table, 'from', null); } };

assert.equal(errorCode(new Error('llm_http_429')), 'provider_429');
assert.equal(errorCode(new Error('llm_empty_response')), 'llm_empty_response');
assert.equal(errorCode(new Error('no_approved_intervention')), 'no_approved_intervention');
assert.match(safeMessage(new Error('Authorization: Bearer secret-value')), /redacted/);

const execution = await startExecutionRun(supabase, { userId: 'user-1', channel: 'web', triggerSource: 'daily', idempotencyKey: 'daily:2026-09-30' });
assert.match(execution.requestId, /^[0-9a-f-]{36}$/);
assert.equal(execution.userId, 'user-1');

const generation = await startGenerationAttempt(supabase, execution, { attemptNumber: 1, attemptType: 'generation', provider: 'openai', model: 'gpt-test' });
await finishGenerationAttempt(supabase, generation.id, generation.startedAt, { status: 'completed', candidateCount: 3, rejectionCount: 2, usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } });
await recordProviderCall(supabase, execution, { generationAttemptId: generation.id, provider: 'openai', model: 'gpt-test', operation: 'generation', inputTokens: 10, cachedInputTokens: 2, cacheWriteTokens: 1, outputTokens: 20, totalTokens: 30, latencyMs: 42, status: 'success' });
await recordEvent(supabase, { userId: 'user-1', eventType: 'candidate_rejected', executionRunId: execution.executionId, metadata: { layer: 'deterministic' } });

assert(calls.some(call => call.table === 'execution_runs' && call.operation === 'insert'));
assert(calls.some(call => call.table === 'generation_attempts' && call.operation === 'insert'));
assert.equal(calls.find(call => call.table === 'generation_attempts' && call.operation === 'insert')?.payload.user_id, 'user-1');
assert(calls.some(call => call.table === 'generation_attempts' && call.operation === 'update'));
assert(calls.some(call => call.table === 'execution_provider_calls' && call.operation === 'insert'));
assert.equal(calls.find(call => call.table === 'execution_provider_calls')?.payload.user_id, 'user-1');
assert.equal(calls.find(call => call.table === 'execution_provider_calls')?.payload.cached_input_tokens, 2);
assert.equal(calls.find(call => call.table === 'execution_provider_calls')?.payload.cache_write_tokens, 1);
assert(calls.some(call => call.table === 'event_log' && call.operation === 'insert'));
console.log('operational-observability tests: PASS');
