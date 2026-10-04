import assert from 'node:assert/strict';
import { alignCandidateToPsychologicalContract, buildBrief } from '../lib/server/intervention.ts';
import { formulatePsychologicalIntervention } from '../lib/psychological-contract.ts';

const contract = formulatePsychologicalIntervention({
  currentContext: 'Cuando tengo que tomar una decisión importante, suelo pedir varias opiniones antes de decidir, aunque en el fondo ya tenga una respuesta o criterio propio, porque me preocupa equivocarme.',
  desiredChange: 'Confiar más en mi criterio',
  relevantSituations: ['Cuando tengo que tomar una decisión importante, suelo pedir varias opiniones antes de decidir, aunque en el fondo ya tenga una respuesta o criterio propio, porque me preocupa equivocarme.'],
  preferredMovement: 'external_validation:define_decision_criterion',
});

assert.equal(contract.sufficient, true);
assert.equal(contract.mechanism_id, 'external_validation');
assert.equal(contract.psychological_move, 'definir qué condiciones tendría que cumplir una opción para que la elijas');

const generated = {
  text: 'Cuando tienes que tomar una decisión importante, prueba a completar estas dos frases: «No elegiría una opción que…» y «Podría aceptar una opción que…, aunque…». La primera aclara tu límite; la segunda, qué concesión te parece aceptable. Juntas te ayudan a definir qué tendría que cumplir la opción que elijas.',
  mechanismId: 'external_validation',
  mechanismConfidence: 'medium',
  interventionPurpose: 'Ayudar a definir qué condiciones tendría que cumplir una opción para que la elijas.',
  psychologicalMove: 'Separar el requisito que no aceptarías negociar de una concesión que sí te parece aceptable.',
  expectedMovement: 'Podrás precisar qué condición descartaría una opción y qué aspecto podrías aceptar sin descartarla.',
  whyNow: 'texto generado por el proveedor',
  riskFlags: ['No asumir qué concesiones concretas importan en la decisión.'],
  situation: contract.situation,
  intention: contract.user_direction,
  takeaway: 'Distinguir un límite de una concesión posible vuelve más claro el criterio con el que eliges.',
};

const aligned = alignCandidateToPsychologicalContract(generated, contract);

assert.equal(aligned.mechanismId, contract.mechanism_id);
assert.equal(aligned.mechanismConfidence, contract.mechanism_confidence);
assert.equal(aligned.interventionPurpose, contract.intervention_purpose);
assert.equal(aligned.psychologicalMove, contract.psychological_move);
assert.equal(aligned.expectedMovement, contract.expected_movement);
assert.equal(aligned.whyNow, contract.why_now);
assert.deepEqual(aligned.riskFlags, contract.risk_flags);
assert.equal(aligned.situation, contract.situation);
assert.equal(aligned.intention, contract.user_direction);

console.log('psychological contract alignment: PASS');
