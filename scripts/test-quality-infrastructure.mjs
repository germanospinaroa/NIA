import assert from 'node:assert/strict';
import { derivePsychologicalProgression } from '../lib/psychological-progression.ts';
import { calculateReceptionStage } from '../lib/server/reception-progression.ts';
import { evaluateWriterV2, hasTransferableValue } from '../lib/server/writer-v2.ts';

const input = {
  situation: 'revisar instrucciones de una tarea nueva',
  desiredChange: 'aclarar qué necesito para avanzar',
  psychologicalMove: 'uncertainty_clarification:name_the_concrete_question',
  movementExplanation: 'convertir la incertidumbre en una pregunta concreta',
  confirmedFacts: ['revisa instrucciones de una tarea nueva'],
  recentMovements: [],
  communicationPreference: 'adaptive',
  safetyConstraints: [],
  receptionStage: 'tuning',
  psychologicalInterventionsDelivered: 0,
  timeOfDay: 'morning',
  receptionInstructions: [],
};

const fixtures = [
  ['herramienta concreta 1', 'Para empezar, necesito saber qué dato falta. Convertir la incertidumbre en una pregunta concreta permite saber qué buscar.', true],
  ['herramienta concreta 2', 'Antes de consultar, anota: «Mi primera respuesta es…». Después compara qué información nueva apareció.', true],
  ['distinción aplicable', 'Separa «Esto sí está indicado» de «Esto no queda indicado» para saber qué está confirmado.', true],
  ['paráfrasis vacía', 'Revisas varias veces las instrucciones y no sabes qué dato te falta.', false],
  ['motivación genérica', 'Confía en ti y recuerda que todo estará bien.', false],
  ['observación vaga', 'Observa cómo te sientes.', false],
];
for (const [name, message, expected] of fixtures) assert.equal(hasTransferableValue(message), expected, name);

assert.equal(evaluateWriterV2(fixtures[0][1], input).hardFailures.includes('no_transferable_value'), false);
assert.equal(evaluateWriterV2(fixtures[1][1], { ...input, situation: 'consultar antes de decidir', psychologicalMove: 'external_validation:define_decision_criterion', movementExplanation: 'comparar información nueva con la primera respuesta' }).hardFailures.includes('no_transferable_value'), false);
assert.equal(hasTransferableValue(fixtures[3][1]), false);
assert.equal(evaluateWriterV2('Tienes ansiedad y por eso no puedes decidir.', { ...input, situation: 'decidir sobre una tarea', psychologicalMove: 'decidir', movementExplanation: 'decidir' }).hardFailures.includes('invented_psychology'), true);

let deliveries = 0;
const stage = () => calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: deliveries });
assert.equal(stage(), 'tuning');
// Rejection does not create a delivery.
assert.equal(stage(), 'tuning');
deliveries += 1; assert.equal(stage(), 'tuning');
deliveries += 1; assert.equal(stage(), 'building');
deliveries += 3; assert.equal(stage(), 'established');

const worked = [{ mechanismId: 'external_validation', psychologicalMovementKey: 'external_validation:define_decision_criterion', movement: 'external_validation:define_decision_criterion', takeaway: 'Definir el criterio propio.' }];
const progression = derivePsychologicalProgression({ goal: 'confiar más en mi criterio', pattern: 'pido opiniones después de decidir', mechanismId: 'external_validation', history: worked });
assert.notEqual(progression.next_recommended_movement, 'external_validation:define_decision_criterion');
assert.equal(progression.next_recommended_movement, 'external_validation:set_reconsideration_threshold');

console.log('quality infrastructure regressions: PASS');
