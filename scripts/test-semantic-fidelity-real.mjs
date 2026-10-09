import assert from 'node:assert/strict';
import { getMovementTargetGuidance } from '../lib/movement-expression.ts';
import { judgeSemanticFidelity } from '../lib/server/semantic-fidelity-judge.ts';

const budgetUsd = 0.01;
const prices = { input: 0.10, output: 0.50 };
const context = 'Al recibir una oportunidad laboral, suele pedir varias opiniones aunque ya tenga una primera respuesta.';
const desiredChange = 'Confiar más en mis decisiones laborales.';
const base = { addressName: 'Juanita', confirmedContext: context, desiredChange, receptionStage: 'tuning', timeOfDay: 'morning' };
const cases = [
  {
    id: 'A', target: 'uncertainty_clarification:name_the_concrete_question',
    message: 'Al empezar una tarea nueva, vuelves a revisar las instrucciones sin identificar qué dato te falta. Para empezar, necesito saber ___: nombrar esa duda concreta permite saber qué buscar.',
    expected: { target_expressed: true, adjacent_drift: false, movement_value: true },
  },
  {
    id: 'B', target: 'external_validation:notice_the_consulting_pattern',
    message: 'Hay dos momentos distintos: tu primera respuesta y el momento en que empiezas a consultar. Puedes fijarte en esa secuencia: «Mi primera respuesta fue esta; después empecé a pedir opiniones».',
    expected: { target_expressed: true, adjacent_drift: false, movement_value: true },
  },
  {
    id: 'C', target: 'external_validation:define_decision_criterion',
    message: 'Cuando recibes una oportunidad laboral, sueles pedir varias opiniones aunque ya tengas una primera respuesta. Para evaluar esa oportunidad, conviene hacer explícito qué tendría que cumplir para encajar contigo: una opinión favorable no equivale a que la opción cumpla tus condiciones. Puedes usar esta referencia: «Para mí, esta oportunidad tendría que ofrecer ___; sería deseable ___; y no encajaría si ___». Completa los espacios con lo que realmente te importe en ese trabajo, sin dar por hecho cuáles deben ser tus prioridades. Así puedes contrastar lo que escuches con una referencia propia.',
    expected: { target_expressed: true, adjacent_drift: false, movement_value: true },
  },
  {
    id: 'D', target: 'external_validation:notice_the_consulting_pattern',
    message: 'Cuando alguien opine distinto, define qué información nueva tendría que aportar para que reconsideres tu decisión. Así sabrás qué tendría que cambiar antes de volver a decidir.',
    expected: { adjacent_drift: true },
  },
  {
    id: 'E', target: 'uncertainty_clarification:name_the_concrete_question',
    message: 'Puedes empezar aunque todavía no tengas certeza completa. No necesitas resolver toda la tarea para dar el primer paso.',
    expected: { target_expressed: false, adjacent_drift: true },
  },
  {
    id: 'F', target: 'external_validation:notice_the_consulting_pattern',
    message: 'Te pasa que consultas muchas opiniones aunque ya tengas una respuesta.',
    expected: { movement_value: false },
  },
  {
    id: 'G', target: 'external_validation:information_vs_delegating_decision',
    message: 'Escuchar una opinión puede darte información sin convertirla en la decisión que tienes que seguir. Puedes separar qué dato aporta de qué conclusión te corresponde tomar a ti.',
    expected: { target_expressed: true, adjacent_drift: false, movement_value: true },
  },
  {
    id: 'H', target: 'uncertainty_clarification:name_the_concrete_question',
    message: 'Las instrucciones dicen qué tarea hay que entregar, pero todavía necesito aclarar qué formato debe tener. Nombrar esa pregunta pendiente evita intentar resolver toda la tarea a la vez.',
    expected: { target_expressed: true, adjacent_drift: false, movement_value: true },
  },
];

assert.ok(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY is required');
let spent = 0;
const results = [];
for (const item of cases) {
  const guidance = getMovementTargetGuidance(item.target);
  assert.ok(guidance, `missing guidance for ${item.target}`);
  const estimatedInput = Math.ceil(JSON.stringify({ ...base, target: item.target, guidance, message: item.message }).length / 4) + 180;
  const projected = estimatedInput / 1_000_000 * prices.input + 320 / 1_000_000 * prices.output;
  if (spent + projected > budgetUsd) throw new Error(`semantic_fidelity_budget_exceeded_before_${item.id}`);
  const execution = await judgeSemanticFidelity({ ...base, guidance, adjacentMovements: guidance.outOfScope, message: item.message });
  const usage = execution.usage ?? {};
  const cost = ((usage.prompt_tokens ?? estimatedInput) / 1_000_000 * prices.input) + ((usage.completion_tokens ?? 0) / 1_000_000 * prices.output);
  spent += cost;
  if (spent > budgetUsd) throw new Error(`semantic_fidelity_budget_exceeded_after_${item.id}`);
  const actual = execution.result;
  const match = Object.entries(item.expected).every(([key, expected]) => actual[key] === expected);
  results.push({ id: item.id, target: item.target, expected: item.expected, actual, match, usage, cost_usd: cost });
}

const criticalFailures = results.filter(item => !item.match);
const falsePositives = results.filter(item => (item.expected.target_expressed === false && item.actual.target_expressed === true) || (item.expected.movement_value === false && item.actual.movement_value === true));
const falseNegatives = results.filter(item => (item.expected.target_expressed === true && item.actual.target_expressed === false) || (item.expected.movement_value === true && item.actual.movement_value === false));
console.log(JSON.stringify({ status: criticalFailures.length ? 'FAIL' : 'PASS', model: 'gpt-6-luna', cases: results.length, false_positives: falsePositives.length, false_negatives: falseNegatives.length, input_tokens: results.reduce((sum, item) => sum + (item.usage.prompt_tokens ?? 0), 0), output_tokens: results.reduce((sum, item) => sum + (item.usage.completion_tokens ?? 0), 0), total_tokens: results.reduce((sum, item) => sum + (item.usage.total_tokens ?? 0), 0), cost_usd: spent, results }, null, 2));
if (criticalFailures.length) process.exitCode = 1;
