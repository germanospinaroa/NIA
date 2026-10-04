import assert from 'node:assert/strict';
import { evaluatePsychologicalValue, formulatePsychologicalIntervention, psychologicalMechanisms } from '../lib/psychological-contract.ts';

const concrete = formulatePsychologicalIntervention({
  currentContext: 'Cuando alguien cuestiona una decisión que ya tomaste',
  desiredChange: 'Confiar más en mi criterio',
});
assert.equal(concrete.sufficient, true);
assert.equal(concrete.mechanism_id, 'external_validation');
assert.ok(psychologicalMechanisms.length >= 12 && psychologicalMechanisms.length <= 18);

function candidate(overrides = {}) {
  return {
    text: 'Cuando alguien cuestiona una decisión que ya tomaste, puedes revisar qué dato cambió antes de volver a decidir.',
    situation: concrete.situation,
    mechanismId: concrete.mechanism_id,
    mechanismConfidence: concrete.mechanism_confidence,
    interventionPurpose: concrete.intervention_purpose,
    psychologicalMove: concrete.psychological_move,
    expectedMovement: concrete.expected_movement,
    takeaway: 'Escuchar una opinión no equivale a entregar la decisión.',
    optionalAction: 'Escribe qué dato nuevo apareció antes de cambiar.',
    whyNow: concrete.why_now,
    riskFlags: [],
    editorialIdea: 'Una opinión puede aportar datos sin decidir por ti.',
    ...overrides,
  };
}

// 1–2: general intention plus pretty/motivational copy is not an intervention.
const insufficient = formulatePsychologicalIntervention({ currentContext: 'Estoy dudando de mí', desiredChange: 'Confiar más en mi criterio' });
assert.equal(insufficient.sufficient, false);
assert.equal(evaluatePsychologicalValue(candidate({ text: 'Confía en ti y recuerda que eres capaz.', situation: insufficient.situation, mechanismId: 'context_clarification' }), insufficient).approved, false);
assert.equal(evaluatePsychologicalValue(candidate({ text: 'Date permiso para confiar en tu criterio.', situation: insufficient.situation, mechanismId: 'external_validation' }), insufficient).approved, false);
const adrianaMessage = `Hola, Adriana. Buenas noches.

Cuando aparece «estoy dudando de mí», la pregunta puede volverse demasiado amplia: parece que está en juego tu capacidad entera, no un punto concreto.

Prueba a completar: «Lo que no tengo claro es…». Si no puedes nombrar ese punto, quizá la duda todavía no está formulada como una pregunta que puedas resolver.

Nos leemos mañana.`;
const adrianaAudit = evaluatePsychologicalValue(candidate({ text: adrianaMessage, situation: insufficient.situation, mechanismId: 'external_validation', optionalAction: 'Completa: «Lo que no tengo claro es…».' }), insufficient);
assert.equal(adrianaAudit.approved, false);
assert.ok(adrianaAudit.reasons.includes('psychological_value_contextual_relevance'));

// 3–4: a real situation can support an insight or a concrete action.
assert.equal(evaluatePsychologicalValue(candidate(), concrete).approved, true);
assert.equal(evaluatePsychologicalValue(candidate({ optionalAction: 'Antes de pedir otra opinión, escribe primero tu respuesta.' }), concrete).approved, true);

// Production-shaped regression: the server contract is the source of truth even
// when persistence metadata has no nested psychologicalContract.
const productionShaped = evaluatePsychologicalValue(candidate({
  text: 'Cuando ya tienes una respuesta para una decisión importante, pedir varias opiniones puede hacer difícil notar qué aportó cada una. Antes de consultar, anota qué elegirías por ahora y qué dato concreto podría hacerte cambiar. Luego podrás distinguir una información nueva de una opinión que solo suma otra voz.',
  psychologicalMove: 'escuchar una opinión sin cederle la decisión a otra persona',
  interventionPurpose: 'Distinguir información de entregar la decisión.',
  expectedMovement: 'Podrás notar qué cambió antes de cambiar de decisión.',
  takeaway: 'Una opinión puede aportar información sin decidir por ti.',
  optionalAction: 'Antes de consultar, anota qué dato concreto podría hacerte cambiar.',
  editorial_signature: { psychologicalContract: null },
}), concrete);
assert.equal(productionShaped.approved, true);
assert.ok(!productionShaped.reasons.includes('psychological_value_one_move'));

const genericWithContract = evaluatePsychologicalValue(candidate({
  text: 'Confía en ti y recuerda que tienes todo lo necesario para tomar buenas decisiones.',
  takeaway: 'Confía en ti y recuerda que eres capaz.',
}), concrete);
assert.equal(genericWithContract.approved, false);
assert.ok(genericWithContract.reasons.some(reason => reason.startsWith('psychological_value_') || reason === 'counterfactual_too_generic'));

const alignedParaphrase = evaluatePsychologicalValue(candidate({
  psychologicalMove: 'separar una opinión de la decisión',
  interventionPurpose: 'Ayudar a escuchar datos sin entregar el criterio.',
}), concrete);
assert.equal(alignedParaphrase.approved, true);

// 5–8: mechanism, basis, context and learning are independently required.
assert.ok(evaluatePsychologicalValue(candidate({ mechanismId: 'invented_mechanism' }), concrete).reasons.includes('psychological_value_mechanism_validity'));
assert.ok(evaluatePsychologicalValue(candidate({ takeaway: 'Una frase bonita para sentirte mejor.' }), concrete).reasons.includes('psychological_value_learning_value'));
assert.ok(evaluatePsychologicalValue(candidate({ text: 'Confía en ti. Todo va a estar bien.', situation: null }), concrete).reasons.includes('counterfactual_too_generic'));
assert.ok(evaluatePsychologicalValue(candidate({ riskFlags: ['diagnostic_claim'] }), concrete).reasons.includes('psychological_value_no_invented_psychology'));

// 9–11: movement, autonomy and memory/context determine approval.
assert.ok(evaluatePsychologicalValue(candidate({ psychologicalMove: 'reencuadrar y preparar una acción' }), concrete).reasons.includes('psychological_value_one_move'));
assert.ok(evaluatePsychologicalValue(candidate({ text: 'Tienes que sentir seguridad y hacer lo que yo te digo.' }), concrete).reasons.includes('psychological_value_autonomy'));
assert.ok(evaluatePsychologicalValue(candidate({ text: 'A veces confiar en ti es importante.' }), concrete).reasons.includes('counterfactual_too_generic'));

// 12–15: useful short messages pass; long filler and evidence without basis do not.
assert.equal(evaluatePsychologicalValue(candidate({ text: 'Cuando alguien cuestiona tu decisión, mira qué dato nuevo apareció.', takeaway: 'Un dato nuevo puede justificar revisar una decisión.' }), concrete).approved, true);
assert.ok(evaluatePsychologicalValue(candidate({ text: 'Cuando alguien cuestiona una decisión, puedes pensar en muchas cosas bonitas y seguir adelante sin revisar nada.', takeaway: 'Una frase general sobre seguir adelante.' }), concrete).reasons.includes('psychological_value_learning_value'));
const longitudinal = formulatePsychologicalIntervention({ currentContext: 'Esta semana lo anoté dos veces después de una conversación', desiredChange: 'Reconocer avances concretos' });
assert.equal(longitudinal.sufficient, true);
assert.ok(evaluatePsychologicalValue(candidate({ mechanismId: 'progress_monitoring' }), longitudinal).reasons.includes('psychological_value_one_move'));

console.log('psychological value tests: PASS (18 contract regressions)');
