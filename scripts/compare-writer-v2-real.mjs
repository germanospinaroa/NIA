import assert from 'node:assert/strict';
import { createAdminClient } from '../lib/supabase/admin.ts';
import { buildBrief } from '../lib/server/intervention.ts';
import { evaluateWriterV2, generateWriterV2, writerV2InputFromBrief, writerV2Prompt } from '../lib/server/writer-v2.ts';

const userId = process.env.QA_PROVIDER_USER_ID || '6f97c383-4882-4b52-a362-183641ed505e';
const budget = 0.20;
const pricing = {
  'gpt-6-luna': { input: 0.10, output: 0.50 },
  'gpt-6.1-sol': { input: 2, output: 10 },
};
const estimateTokens = (value) => Math.ceil(value.length / 4);
const estimateCost = (model, inputTokens, outputTokens) => ((inputTokens / 1_000_000) * pricing[model].input) + ((outputTokens / 1_000_000) * pricing[model].output);

assert.ok(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY is required');
assert.ok(pricing['gpt-6-luna'] && pricing['gpt-6.1-sol']);
const db = createAdminClient();
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
const { brief } = await buildBrief(db, userId, 'intention', 'writer-v2-comparison', localDate);
const input = writerV2InputFromBrief(brief);
assert.ok(input.situation && input.psychologicalMove, 'real brief must provide situation and movement');
const systemLength = 'Escribe una única intervención final para la persona. El servidor ya decidió el movimiento psicológico: exprésalo, no lo rediseñes. Usa solo hechos confirmados. Entrega contexto reconocible, una distinción o insight y algo utilizable cuando el movimiento lo necesite. No inventes psicología, no diagnostiques, no hagas coaching, no repitas movimientos anteriores, no fuerces preguntas, acciones ni cierres. Escribe directamente el mensaje en español natural. Devuelve únicamente JSON con la propiedad message.'.length;
const promptTokens = estimateTokens(systemLength + writerV2Prompt(input));
const maxOutputTokens = 320;
const results = [];
let spent = 0;
for (const model of ['gpt-6-luna', 'gpt-6.1-sol']) {
  const projected = estimateCost(model, promptTokens, maxOutputTokens);
  if (spent + projected > budget) throw new Error(`writer_v2_budget_exceeded_before_${model}`);
  const result = await generateWriterV2(input, { model, maxOutputTokens });
  const usage = result.usage ?? {};
  const actualCost = estimateCost(model, usage.prompt_tokens ?? promptTokens, usage.completion_tokens ?? 0);
  spent += actualCost;
  if (spent > budget) throw new Error(`writer_v2_budget_exceeded_after_${model}`);
  results.push({ model, usage, estimated_cost_usd: actualCost, evaluation: evaluateWriterV2(result.message, input), message: result.message });
}

console.log(JSON.stringify({
  budget_usd: budget,
  cost_total_usd: spent,
  input: { situation: input.situation, desired_change: input.desiredChange, psychological_move: input.psychologicalMove, recent_movements: input.recentMovements },
  messages: results.map((result, index) => ({ label: String.fromCharCode(65 + index), message: result.message, evaluation: result.evaluation })),
  costs: results.map(({ model, usage, estimated_cost_usd }) => ({ model, input_tokens: usage.prompt_tokens ?? null, output_tokens: usage.completion_tokens ?? null, total_tokens: usage.total_tokens ?? null, estimated_cost_usd })),
}, null, 2));
