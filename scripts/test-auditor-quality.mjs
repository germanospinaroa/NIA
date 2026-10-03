import assert from 'node:assert/strict';
import { auditCandidate, hasContextEvidence, hasInternalRepetition } from '../lib/intervention-engine.ts';

const brief = {
  desiredChange: 'Confiar más en mi criterio.',
  currentContext: 'Cuando otras personas cuestionan lo que decidiste.',
  relevantSituations: [],
  contextDomain: null,
  recentConcepts: [],
  recentAngles: [],
  recentStructures: [],
};

function candidate(overrides = {}) {
  return {
    text: 'Cuando alguien pone en duda una decisión tuya, separa la objeción concreta de la incomodidad que provoca. Después anota qué revisarías y qué mantendrías antes de responder. Hoy prueba esta pausa y decide con ese criterio.',
    recognition: 'Cuando alguien pone en duda una decisión tuya.',
    explanation: 'Una objeción puede mezclar una observación concreta con una reacción de incomodidad.',
    insight: 'La parte decisiva es separar la señal que modifica el criterio de la incomodidad que provoca.',
    steps: ['Pide el dato concreto que respalda la objeción.', 'Compáralo con las razones que tenías al decidir.'],
    action: 'Hoy aplica esta separación a una decisión reciente.',
    closing: 'Así sabes qué merece una revisión.',
    function: 'distinguish',
    concept: 'self_trust',
    angle: 'separar señal de incomodidad',
    structure: 'distinguish_between',
    ...overrides,
  };
}

const differentAngle = auditCandidate(candidate(), {
  ...brief,
  recentInterventions: ['Cuando alguien discrepa, revisa qué dato nuevo justificaría cambiar de decisión.'],
});
assert.equal(differentAngle.reasons.includes('semantic_duplicate'), false, 'same concept with a different idea is not a duplicate');

const nearIdentical = auditCandidate(candidate({ text: candidate().text }), {
  ...brief,
  recentInterventions: [candidate().text],
});
assert.equal(nearIdentical.reasons.includes('semantic_duplicate'), true, 'near-identical text remains a duplicate');

const differentDesiredAngle = auditCandidate(candidate({ angle: 'pedir precisión antes de reinterpretar una crítica' }), {
  ...brief,
  recentInterventions: ['Antes de cambiar de decisión, anota qué dato nuevo apareció y compáralo con tus razones.'],
});
assert.equal(differentDesiredAngle.reasons.includes('semantic_duplicate'), false, 'same desired change with another angle is allowed');

assert.equal(hasContextEvidence(candidate(), brief), true, 'paraphrased context is accepted');
assert.equal(hasContextEvidence(candidate({ text: 'Confía más en ti y recuerda que todo saldrá bien.', recognition: 'Confía más en ti.' }), brief), false, 'generic text still lacks context evidence');

const structuredInsight = auditCandidate(candidate({ insight: 'La parte decisiva es separar la señal que modifica el criterio de la incomodidad que provoca.' }), brief);
assert.equal(structuredInsight.reasons.includes('missing_insight'), false, 'structured insight does not depend on legacy keywords');
const emptyInsight = auditCandidate(candidate({ insight: '' }), brief);
assert.equal(emptyInsight.reasons.includes('missing_insight'), true, 'empty insight is rejected');

assert.equal(hasInternalRepetition([
  'Cuando alguien cuestiona una decisión, la duda puede aparecer.',
  'Una crítica puede mezclar opinión e información.',
  'El dato útil es identificar qué cambiaría tus razones.',
]), false);
assert.equal(hasInternalRepetition([
  'Una crítica mezcla opinión e información.',
  'La crítica mezcla opinión e información.',
  'Lo importante es separar opinión e información.',
]), true);

const regression = auditCandidate(candidate(), {
  ...brief,
  recentConcepts: ['self_trust', 'self_trust'],
  recentInterventions: ['Que alguien cuestione tu decisión no demuestra que tu criterio fallara; revisa qué dato nuevo apareció.'],
});
assert.equal(regression.reasons.includes('semantic_duplicate'), false, 'execution regression: same concept alone is not a duplicate');
assert.equal(regression.reasons.includes('concept_saturated'), false, 'concept saturation is not a hard rejection');
assert.equal(regression.warnings.includes('concept_saturated'), true, 'concept saturation remains observable');

console.log('auditor-quality tests: PASS');
