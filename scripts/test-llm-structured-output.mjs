import assert from 'node:assert/strict';
import { candidateSchema, requestStructuredJsonWithMeta, validateLlmCandidate } from '../lib/server/llm-intervention.ts';

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
globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'Invalid schema: pattern is unsupported. Bearer secret-value sk-secret-value' } }), { status: 400, headers: { 'content-type': 'application/json' } });
await assert.rejects(
  requestStructuredJsonWithMeta('test_schema', {}, 'system', 'user'),
  error => error instanceof Error && error.message.startsWith('llm_http_400: Invalid schema') && error.message.includes('[redacted]') && !error.message.includes('secret-value'),
);
globalThis.fetch = previousFetch;
if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;

console.log('structured output tests: PASS');
