import assert from 'node:assert/strict';
import { evaluatePsychologicalValue, formulatePsychologicalIntervention } from '../lib/psychological-contract.ts';
import { alignCandidateToPsychologicalContract } from '../lib/server/intervention.ts';
import { movementKey, progressionForCandidate } from '../lib/psychological-progression.ts';

const situation = 'Cuando tengo que tomar una decisión importante, suelo pedir varias opiniones antes de decidir, aunque en el fondo ya tenga una respuesta o criterio propio, porque me preocupa equivocarme.';
const intention = 'Confiar más en mi criterio.';

const contract = formulatePsychologicalIntervention({
  currentContext: situation,
  desiredChange: intention,
  relevantSituations: [situation],
  preferredMovement: 'external_validation:define_decision_criterion',
});

assert.equal(contract.sufficient, true);
assert.equal(contract.psychological_move, 'definir qué condiciones tendría que cumplir una opción para que la elijas');

const rawProductionCandidate = {
  text: 'Cuando tienes que tomar una decisión importante, prueba a completar estas dos frases: «No elegiría una opción que…» y «Podría aceptar una opción que…, aunque…». La primera frase aclara tu límite; la segunda, qué concesión te parece aceptable. Juntas te ayudan a definir qué tendría que cumplir la opción que elijas.',
  situation,
  intention,
  mechanismId: 'external_validation',
  mechanismConfidence: 'medium',
  interventionPurpose: 'Ayudar a definir qué condiciones tendría que cumplir una opción para que la elijas.',
  psychologicalMove: 'Separar el requisito que no aceptarías negociar de una concesión que sí te parece aceptable.',
  expectedMovement: 'Podrás precisar qué condición descartaría una opción y qué aspecto podrías aceptar sin descartarla.',
  takeaway: 'Distinguir un límite de una concesión posible vuelve más claro el criterio con el que eliges.',
  optionalAction: 'Completa las dos frases para la decisión que tengas en mente.',
  whyNow: 'Como ya identificas que tienes un criterio propio aunque consultes a varias personas, precisar tus límites puede ayudar a definir qué opción elegirías.',
  riskFlags: [],
};

const aligned = alignCandidateToPsychologicalContract(rawProductionCandidate, contract);

assert.equal(aligned.psychologicalMove, contract.psychological_move);
assert.equal(movementKey({ mechanismId: aligned.mechanismId, movement: aligned.psychologicalMove }), 'external_validation:define_decision_criterion');

const progression = progressionForCandidate({
  ...aligned,
  psychologicalMove: aligned.psychologicalMove,
  takeaway: aligned.takeaway,
  editorialIdea: 'Definir un criterio propio antes de dejar que una opinión externa cambie una decisión.',
});
assert.equal(progression.accepted, true);

const audit = evaluatePsychologicalValue(aligned, contract);
assert.equal(audit.approved, true, JSON.stringify(audit));

assert.ok(aligned.text.length > 80);
assert.ok(aligned.text.length < 900);
assert.match(aligned.text, /No elegiría una opción/);
assert.match(aligned.text, /qué concesión/);
assert.match(aligned.text, /qué tendría que cumplir/);

console.log('production-shaped replay: PASS');
console.log(JSON.stringify({
  movementKey: movementKey({ mechanismId: aligned.mechanismId, movement: aligned.psychologicalMove }),
  progressionAccepted: progression.accepted,
  psychologicalValueApproved: audit.approved,
  chars: aligned.text.length,
}));
