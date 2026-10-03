import assert from 'node:assert/strict';
import { auditCandidate } from '../lib/intervention-engine.ts';
import { composeCandidateText, validateLlmCandidate } from '../lib/server/llm-intervention.ts';
const brief = { desiredChange: 'Confiar más en mi criterio', currentContext: 'Cuando alguien cuestiona una decisión', recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [] };
const fixtures = [
  { topic: 'criterio', editorial_take: 'Una opinión puede aportar información sin decidir por ti.', experience_type: 'brief_insight', intervention_type: 'brief_insight', depth: 'brief', blocks: [{ type: 'idea', text: 'Una opinión puede aportar información sin decidir por ti.' }] },
  { topic: 'criterio', editorial_take: 'La duda y el cambio de información no son lo mismo.', experience_type: 'question', intervention_type: 'reflection', depth: 'medium', blocks: [{ type: 'insight', text: 'La duda y el cambio de información no son lo mismo.' }, { type: 'question', text: '¿Qué dato nuevo apareció realmente?' }] },
  { topic: 'criterio', editorial_take: 'Separar opinión y evidencia reduce cambios automáticos.', experience_type: 'practical_tool', intervention_type: 'tool', depth: 'medium', blocks: [{ type: 'explanation', text: 'Separar opinión y evidencia reduce cambios automáticos.' }, { type: 'tool', text: 'Escribe qué dato concreto justificaría revisar la decisión.' }] },
  { topic: 'criterio', editorial_take: 'Revisar una decisión funciona mejor cuando separas sus señales.', experience_type: 'exercise', intervention_type: 'step_by_step', depth: 'deep', blocks: [{ type: 'step', text: 'Anota la razón original.' }, { type: 'step', text: 'Identifica qué información nueva apareció.' }, { type: 'action', text: 'Decide si esa información cambia el criterio.' }] },
  { topic: 'criterio', editorial_take: 'Una objeción amplia se vuelve útil cuando puedes revisar sus partes.', experience_type: 'concrete_example', intervention_type: 'deep_dive', depth: 'deep', blocks: [{ type: 'recognition', text: 'Cuando cuestionan una decisión, la revisión puede empezar demasiado pronto.' }, { type: 'explanation', text: 'Una objeción mezcla opinión, datos y consecuencias posibles.' }, { type: 'example', text: 'Pedir precisión cambia una crítica amplia en información revisable.' }, { type: 'action', text: 'Hoy separa esas tres partes en una decisión reciente.' }] },
];
for (const fixture of fixtures) {
  const candidate = { ...fixture, function: 'distinguish', concept: 'criterio', angle: fixture.intervention_type, structure: 'distinguish_between', text: composeCandidateText(fixture) };
  assert.equal(validateLlmCandidate(candidate), true);
  assert.equal(auditCandidate(candidate, brief).reasons.includes('missing_insight'), false);
}
const repetitive = { ...fixtures[2], blocks: [{ type: 'idea', text: 'La información nueva importa.' }, { type: 'insight', text: 'La información nueva importa.' }], function: 'distinguish', concept: 'criterio', angle: 'repetido', structure: 'distinguish_between' };
assert.equal(auditCandidate({ ...repetitive, text: composeCandidateText(repetitive) }, brief).reasons.includes('internal_repetition'), true);
console.log('flexible intervention tests: PASS');
