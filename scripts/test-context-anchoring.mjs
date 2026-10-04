import assert from 'node:assert/strict';
import { evaluatePsychologicalValue, formulatePsychologicalIntervention } from '../lib/psychological-contract.ts';

const contract = formulatePsychologicalIntervention({
  currentContext: 'Cuando ya tomaste una decisión y después pido varias opiniones a otras personas antes de decidir',
  desiredChange: 'Confiar más en mi criterio',
});
assert.equal(contract.sufficient, true);

function candidate(overrides = {}) {
  return {
    text: 'Cuando alguien cuestiona una decisión, puedes mirar qué dato cambió antes de volver a decidir.',
    situation: contract.situation,
    mechanismId: contract.mechanism_id,
    interventionPurpose: 'Ayudar a distinguir información de entregar la decisión.',
    psychologicalMove: 'distinguir información de entregar la decisión',
    expectedMovement: 'Podrás distinguir información de entregar la decisión.',
    takeaway: 'Una opinión puede aportar información sin decidir por ti.',
    optionalAction: 'Anota qué dato podría hacerte cambiar.',
    riskFlags: [],
    ...overrides,
  };
}

// 1. Specific context replaced by a generic category.
const genericAnchor = evaluatePsychologicalValue(candidate({
  text: 'Antes de pedir opiniones sobre una decisión importante, anota en una línea el criterio que ya tienes.',
}), contract);
assert.equal(genericAnchor.approved, false);
assert.ok(genericAnchor.reasons.includes('psychological_value_context_anchor_specificity'));

// 2. Same situation, useful and transferable.
const anchored = evaluatePsychologicalValue(candidate({
  text: 'Cuando ya tienes un criterio y aun así sientes que necesitas escuchar más opiniones, prueba algo antes de preguntar: escribe en una línea qué piensas tú y qué información podría hacerte cambiar de decisión. Después escucha. La pregunta no es cuántas personas piensan igual, sino qué dato nuevo apareció que realmente cambia lo que tú habías visto.',
  psychologicalMove: 'separar una opinión de la decisión',
  optionalAction: 'Escribe qué piensas tú y qué información podría hacerte cambiar.',
}), contract);
assert.equal(anchored.approved, true);

// 3. Recognition alone is not value.
const repetition = evaluatePsychologicalValue(candidate({
  text: 'Ya tomaste una decisión y después preguntas a varias personas qué harían.',
  takeaway: 'La situación puede repetirse.',
  optionalAction: null,
}), contract);
assert.equal(repetition.approved, false);

// 4. Beautiful but generic.
assert.equal(evaluatePsychologicalValue(candidate({
  text: 'Es normal dudar. Confía en ti y recuerda que dentro de ti ya tienes muchas respuestas.',
  optionalAction: null,
  takeaway: 'Confía en ti y recuerda que eres capaz.',
}), contract).approved, false);

// 5. Correct education without transfer.
const education = evaluatePsychologicalValue(candidate({
  text: 'Una opinión puede aportar información, pero no se convierte automáticamente en una decisión.',
  optionalAction: null,
  takeaway: 'Una opinión y una decisión cumplen funciones diferentes.',
}), contract);
assert.equal(education.approved, false);
assert.ok(education.reasons.includes('psychological_value_psychological_transfer'));

// 6. Action without a useful psychological payload.
assert.equal(evaluatePsychologicalValue(candidate({
  text: 'Antes de consultar, escribe tres cosas y léelas en voz alta.',
  optionalAction: 'Escribe tres cosas y léelas en voz alta.',
  takeaway: 'Haz estos pasos.',
}), contract).approved, false);

// 7. Empty closing is rejected even when the body has value.
const filler = evaluatePsychologicalValue(candidate({
  text: 'Cuando ya tienes un criterio, distingue qué dato podría hacerlo cambiar. Descansa. Mañana seguimos.',
  optionalAction: 'Anota qué dato podría hacerte cambiar.',
  closing: 'Descansa. Mañana seguimos.',
}), contract);
assert.equal(filler.approved, false);
assert.ok(filler.reasons.includes('psychological_value_filler_closing'));

// 8. Insufficient context remains an explicit stop.
const insufficient = formulatePsychologicalIntervention({ currentContext: 'Estoy dudando de mí', desiredChange: 'Confiar más en mi criterio' });
assert.equal(insufficient.sufficient, false);
assert.equal(evaluatePsychologicalValue(candidate({ situation: insufficient.situation, mechanismId: 'context_clarification' }), insufficient).approved, false);

// 9. Functional paraphrase remains valid.
assert.equal(evaluatePsychologicalValue(candidate({
  text: 'Después de decidir, si vuelves a buscar opiniones, separa lo que alguien aporta de la decisión que sigue siendo tuya.',
  psychologicalMove: 'separar una opinión de la decisión',
}), contract).approved, true);

// 10. Multiple psychological moves remain rejected.
assert.ok(evaluatePsychologicalValue(candidate({ psychologicalMove: 'reencuadrar y preparar una acción' }), contract).reasons.includes('psychological_value_one_move'));

// 11. Production-shaped replay: the real Adriana contract has enough context
// and the generated distinction is valid even without a separate action.
const productionShaped = [
  {
    text: 'Al pedir opiniones sobre una decisión importante, puedes buscar una perspectiva concreta sin pedir que otra persona elija por ti. Una forma de hacerlo es preguntar: «¿Qué aspecto crees que podría no estar viendo?»',
    psychologicalMove: 'Convertir la búsqueda de opiniones en una petición de información concreta, sin pedir que otros ocupen el lugar de la decisión propia.',
  },
  {
    text: 'Antes de pedir opiniones sobre una decisión importante, anota tu respuesta provisional y la razón principal. Al escuchar cada opinión, fíjate en qué dato o consideración nueva aporta frente a esa razón.',
    psychologicalMove: 'Hacer visible el criterio propio antes de consultar, para poder separar aportes nuevos de una sustitución de la decisión.',
  },
  {
    text: 'Cuando ya tienes una respuesta o un criterio para una decisión importante, pedir varias opiniones puede ayudarte a encontrar información que faltaba. La diferencia está en si lo que escuchas aporta algo nuevo o si empieza a ocupar el lugar de tu decisión.',
    psychologicalMove: 'Distinguir si una opinión aporta algo que faltaba o si empieza a ocupar el lugar de tu decisión.',
  },
].map(item => evaluatePsychologicalValue(candidate({ ...item, optionalAction: null, takeaway: 'Una opinión puede aportar información sin tener que decidir por ti.' }), contract));
assert.equal(productionShaped.filter(result => result.approved).length, 1);
assert.ok(productionShaped[2].approved);

console.log('context anchoring tests: PASS (11 regressions)');
