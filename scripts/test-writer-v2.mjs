import assert from 'node:assert/strict';
import { evaluateWriterV2, generateWriterV2WithRepair, writerV2Prompt } from '../lib/server/writer-v2.ts';

const input = {
  situation: 'Cuando ya tienes una respuesta o criterio para una decisión y aun así pides varias opiniones por miedo a equivocarte.',
  desiredChange: 'Confiar más en mi criterio.',
  psychologicalMove: 'external_validation:set_reconsideration_threshold',
  movementExplanation: 'Definir qué dato concreto tendría que aparecer para reconsiderar una decisión.',
  confirmedFacts: ['La persona pide varias opiniones antes de decidir.', 'Ya tiene una respuesta o criterio propio.'],
  recentMovements: ['external_validation:define_decision_criterion', 'external_validation:information_vs_delegating_decision'],
  communicationPreference: 'adaptive',
  safetyConstraints: ['No inventar hechos ni diagnósticos.'],
};

assert.match(writerV2Prompt(input), /psychological_move/);
assert.equal(evaluateWriterV2('Confía en ti y recuerda que tú sabes qué es mejor para ti.', input).approved, false);
assert.ok(evaluateWriterV2('Cuando ya tienes un criterio y consultas varias opiniones, anota qué dato concreto tendría que aparecer para que reconsideres tu decisión.', input).approved);
assert.equal(evaluateWriterV2('Tienes ansiedad y te autosaboteas; deja de consultar.', input).approved, false);
assert.equal(evaluateWriterV2('Cuando ya tienes un criterio y consultas varias opiniones, anota qué dato concreto tendría que aparecer para reconsiderar.', { ...input, recentMovements: [input.psychologicalMove] }).approved, false);

let calls = 0;
const repaired = await generateWriterV2WithRepair(input, {
  model: 'fixture',
  generate: async (_input, options) => {
    calls += 1;
    return { message: calls === 1 ? 'Confía en ti.' : 'Cuando ya tienes un criterio y consultas varias opiniones, anota qué dato concreto tendría que aparecer para reconsiderar.', usage: {}, model: options.model, responseId: `fixture-${calls}` };
  },
});
assert.equal(calls, 2);
assert.equal(repaired.repaired, true);
assert.equal(repaired.attempts.length, 2);
assert.equal(repaired.attempts.at(-1).evaluation.approved, true);

calls = 0;
const noRepair = await generateWriterV2WithRepair(input, {
  model: 'fixture',
  generate: async (_input, options) => { calls += 1; return { message: 'Confía en ti.', usage: {}, model: options.model, responseId: `fixture-${calls}` }; },
});
assert.equal(calls, 2);
assert.equal(noRepair.attempts.length, 2);
assert.equal(noRepair.attempts.at(-1).evaluation.approved, false);

console.log('writer-v2 tests: PASS');
