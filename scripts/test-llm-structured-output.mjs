import assert from 'node:assert/strict';
import { candidateSchema, isRetryableLlmError, requestStructuredJsonWithMeta, validateLlmCandidate, withTechnicalJsonRetryMeta } from '../lib/server/llm-intervention.ts';

const stepsSchema = candidateSchema.properties.candidates.items.properties.steps;
assert.equal(stepsSchema.items.type, 'string');
assert.equal('pattern' in stepsSchema.items, false);

const base = {
  recognition: 'Reconozco lo que quieres trabajar.',
  explanation: 'A veces una opinión cambia cómo miras una decisión.',
  insight: 'Escuchar una opinión y cambiar de criterio no son lo mismo.',
  steps: ['Vuelve a lo que pensabas antes.', 'Revisa qué cambió realmente.'],
  action: 'Antes de pedir otra opinión, escribe una frase sobre tu propio criterio.',
  closing: 'Puedes tomarte tu tiempo.',
  function: 'distinguish',
  concept: 'criterio propio',
  angle: 'separar opinión y decisión',
  structure: 'distinguish_between',
};
assert.equal(validateLlmCandidate(base), true);
for (const steps of [[], ['uno'], ['uno', 'dos', 'tres', 'cuatro'], ['1. numerado', 'otro'], ['uno\ndos', 'otro']]) {
  assert.equal(validateLlmCandidate({ ...base, steps }), false);
}

const previousFetch = globalThis.fetch;
const previousKey = process.env.OPENAI_API_KEY;
process.env.OPENAI_API_KEY = 'test-key';
let fetchCalls = 0;
globalThis.fetch = async () => { fetchCalls += 1; return new Response(JSON.stringify({ error: { message: 'Invalid schema: pattern is unsupported. Bearer secret-value sk-secret-value' } }), { status: 400, headers: { 'content-type': 'application/json' } }); };
await assert.rejects(
  withTechnicalJsonRetryMeta(() => requestStructuredJsonWithMeta('test_schema', {}, 'system', 'user')),
  error => error instanceof Error && error.message.startsWith('llm_http_400: Invalid schema') && error.message.includes('[redacted]') && !error.message.includes('secret-value') && error.status === 400 && error.retryable === false,
);
assert.equal(fetchCalls, 1);
assert.equal(isRetryableLlmError(Object.assign(new Error('bad request'), { status: 400 })), false);
for (const status of [401, 403, 404]) assert.equal(isRetryableLlmError(Object.assign(new Error(`http ${status}`), { status })), false);
for (const status of [408, 429, 500, 502, 503, 504]) assert.equal(isRetryableLlmError(Object.assign(new Error(`http ${status}`), { status })), true);
assert.equal(isRetryableLlmError(Object.assign(new Error('schema'), { code: 'llm_candidate_schema_invalid' })), false);
assert.equal(isRetryableLlmError(Object.assign(new Error('empty'), { code: 'llm_empty_response' })), false);
assert.equal(isRetryableLlmError(Object.assign(new Error('network'), { code: 'llm_network_error' })), true);

async function retryingProvider(status) {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response(JSON.stringify({ error: { message: `temporary ${status}` } }), { status });
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 });
  };
  const result = await withTechnicalJsonRetryMeta(() => requestStructuredJsonWithMeta('test_schema', {}, 'system', 'user'));
  assert.equal(result.calls, 2);
  assert.equal(calls, 2);
}
await retryingProvider(429);
await retryingProvider(500);

let networkCalls = 0;
globalThis.fetch = async () => { networkCalls += 1; if (networkCalls === 1) throw new TypeError('network down'); return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 }); };
const networkResult = await withTechnicalJsonRetryMeta(() => requestStructuredJsonWithMeta('test_schema', {}, 'system', 'user'));
assert.equal(networkResult.calls, 2);
assert.equal(networkCalls, 2);

let localCalls = 0;
const localResult = await withTechnicalJsonRetryMeta(async () => { localCalls += 1; throw Object.assign(new Error('invalid'), { code: 'llm_candidate_schema_invalid' }); }).catch(error => error);
assert.equal(localCalls, 1);
assert.equal(localResult.code, 'llm_candidate_schema_invalid');
globalThis.fetch = previousFetch;
if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;

console.log('structured output tests: PASS');
