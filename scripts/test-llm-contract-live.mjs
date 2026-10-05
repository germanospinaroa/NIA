import assert from 'node:assert/strict';
import { generateCandidatesWithLLM, validateLlmCandidate } from '../lib/server/llm-intervention.ts';

if (!process.env.OPENAI_API_KEY) throw new Error('BLOCKED — missing OPENAI_API_KEY');

const brief = {
  desiredChange: 'Quiero aprender a poner límites sin sentir que estoy siendo mala persona.',
  currentContext: 'Me cuesta especialmente con mi familia porque termino diciendo que sí aunque no quiera.',
  relevantSituations: ['con mi familia', 'cuando me piden algo que no quiero aceptar'],
  recurringPatterns: ['decir que sí para evitar incomodidad'],
  userLanguage: ['decir que sí aunque no quiera', 'sentir que estoy siendo mala persona'],
  recentInterventions: [],
  recentConcepts: [],
  recentAngles: [],
  recentStructures: [],
  successfulPatterns: [],
  rejectedPatterns: [],
  learningSignals: [],
  preferredLanguage: ['cotidiano', 'específico'],
  forbiddenLanguage: ['sostener', 'honrar tu proceso'],
  feedbackGoal: 'specific_context',
};

for (let index = 1; index <= 5; index += 1) {
  const candidates = await generateCandidatesWithLLM(brief);
  assert.equal(candidates.length, 3, `generation ${index} did not return 3 candidates`);
  assert.ok(candidates.every(validateLlmCandidate), `generation ${index} failed server validation`);
  assert.ok(candidates.every(candidate => candidate.concept.length > 2 && candidate.angle.length > 2), `generation ${index} lost free semantic fields`);
  console.log(JSON.stringify({ generation: index, candidates: candidates.length, validated: true }));
}

console.log(JSON.stringify({ status: 'PASS', generations: 5, model: process.env.OPENAI_MODEL || 'gpt-5-mini' }));
