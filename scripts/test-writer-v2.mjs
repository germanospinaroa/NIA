import assert from 'node:assert/strict';
import { applySemanticFidelity, evaluateWriterV2, generateWriterV2WithRepair, hasTransferableValue, writerV2Prompt } from '../lib/server/writer-v2.ts';

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
assert.match(writerV2Prompt({ ...input, canonicalTargetMovement: 'external_validation:notice_the_consulting_pattern', targetMovementGuidance: { target: 'external_validation:notice_the_consulting_pattern', purpose: 'Reconocer la secuencia.', inScope: ['primera respuesta'], outOfScope: ['information_vs_delegating_decision'] } }), /target_movement_guidance/);
assert.equal(evaluateWriterV2('Confía en ti y recuerda que tú sabes qué es mejor para ti.', input).approved, false);
assert.ok(evaluateWriterV2('Cuando ya tienes un criterio y consultas varias opiniones, anota qué dato concreto tendría que aparecer para que reconsideres tu decisión.', input).approved);
assert.equal(evaluateWriterV2('Tienes ansiedad y te autosaboteas; deja de consultar.', input).approved, false);
assert.equal(hasTransferableValue('Para empezar, necesito saber qué dato falta. Convertir la incertidumbre en una pregunta concreta permite saber qué buscar.'), true);
assert.equal(hasTransferableValue('Antes de consultar, anota: «Mi primera respuesta es…». Después compara qué información nueva apareció.'), true);
assert.equal(hasTransferableValue('Separa «Esto sí está indicado» de «Esto no queda indicado» para saber qué está confirmado.'), true);
assert.equal(hasTransferableValue('Sueles dudar y pedir opiniones antes de decidir.'), false);
assert.equal(hasTransferableValue('Confía en ti y recuerda que todo estará bien.'), false);
assert.equal(hasTransferableValue('Observa cómo te sientes.'), false);
assert.equal(evaluateWriterV2('Cuando ya tienes un criterio y consultas varias opiniones, anota qué dato concreto tendría que aparecer para reconsiderar.', { ...input, recentMovements: [input.psychologicalMove] }).approved, false);

const concreteQuestionInput = { ...input, psychologicalMove: 'uncertainty_clarification:name_the_concrete_question', canonicalTargetMovement: 'uncertainty_clarification:name_the_concrete_question', movementExplanation: 'Convertir una duda amplia en un punto concreto que pueda nombrarse.' };
assert.equal(evaluateWriterV2('Para empezar, necesito saber ___.', concreteQuestionInput).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2('Convierte “no sé cómo avanzar” en la pregunta concreta que todavía necesita respuesta.', concreteQuestionInput).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2('Las instrucciones dicen ___, pero todavía necesito aclarar ___.', concreteQuestionInput).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2('Haz algo aunque todavía no tengas certeza completa.', concreteQuestionInput).movementExpression?.adjacentMovementDrift, true);
assert.equal(evaluateWriterV2('Separa lo que ya sabes de lo que todavía no sabes.', concreteQuestionInput).movementExpression?.adjacentMovementDrift, true);

const observeInput = { ...input, psychologicalMove: 'external_validation:notice_the_consulting_pattern', canonicalTargetMovement: 'external_validation:notice_the_consulting_pattern', movementExplanation: 'Reconocer el patrón observable antes de cambiarlo.' };
assert.equal(evaluateWriterV2('Observa el momento en que ya tienes una primera respuesta y aun así empiezas a pedir varias opiniones.', observeInput).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2('Antes de preguntar a alguien más, nota si ya habías formado una respuesta propia.', observeInput).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2('Define qué dato nuevo tendría que aparecer para reconsiderar tu decisión.', observeInput).movementExpression?.adjacentMovementDrift, true);
assert.equal(evaluateWriterV2('Decide cuando la información disponible sea suficiente aunque no tengas certeza total.', observeInput).movementExpression?.adjacentMovementDrift, true);

const profile2Repair = 'Al empezar una tarea nueva, vuelves a revisar las instrucciones sin identificar qué dato te falta. Una forma de concretarlo es distinguir entre «no sé cómo avanzar» y «no sé qué me están pidiendo en este punto». Puedes probar esta frase: «Para empezar, necesito saber ___». Ese espacio puede referirse al resultado esperado, al primer paso o al formato de entrega; lo importante es nombrar la duda concreta, no resolver toda la tarea de una vez.';
const profile2Input = { ...concreteQuestionInput, situation: 'Al empezar una tarea nueva, revisa varias veces las instrucciones y no logra identificar qué dato le falta.' };
assert.equal(evaluateWriterV2(profile2Repair, profile2Input).hardFailures.includes('movement_not_expressed'), false);
assert.equal(evaluateWriterV2(profile2Repair, profile2Input).hardFailures.includes('adjacent_movement_drift'), false);

const profile1Repair = 'Cuando recibes una oportunidad laboral, sueles tener una primera respuesta y aun así pedir varias opiniones. La distinción está entre consultar para obtener información que te falta y consultar para confirmar una respuesta que ya tienes. Antes de pedir otra opinión, puedes fijarte en qué duda concreta sigue abierta: eso ayuda a reconocer qué estás buscando en la consulta.';
const profile1Result = evaluateWriterV2(profile1Repair, observeInput);
assert.equal(profile1Result.movementExpression.targetExpressed, true);
assert.equal(profile1Result.movementExpression.adjacentMovementDrift, true);
assert.equal(profile1Result.movementExpression.dominantMovement, 'external_validation:information_vs_delegating_decision');

const semanticRejected = applySemanticFidelity(profile1Result, { target_expressed: true, adjacent_drift: true, dominant_movement: 'external_validation:information_vs_delegating_decision', movement_value: true, novel_contribution: true, semantic_redundancy: false, reason: 'El texto desarrolla principalmente la distinción vecina.' });
assert.equal(semanticRejected.approved, false);
assert.ok(semanticRejected.hardFailures.includes('adjacent_movement_drift'));

const profile1RecognitionInput = { ...observeInput, targetMovementGuidance: { target: observeInput.canonicalTargetMovement, purpose: 'Reconocer la secuencia.', inScope: ['primera respuesta propia', 'momento en que empieza a consultar'], outOfScope: ['information_vs_delegating_decision'], valueKind: 'recognition' } };
const profile1RecognitionMessage = 'Cuando recibes una oportunidad laboral, ya tienes una primera respuesta antes de pedir varias opiniones. Hay dos momentos distintos: lo que tú piensas al recibirla y el momento en que empiezas a consultar. Para reconocer esa secuencia, puede servirte fijarte en ese paso: «Mi primera respuesta fue esta; después empecé a pedir opiniones». Por ahora, se trata de hacer visible ese orden, sin tener que cambiar cómo decides.';
const profile1RecognitionResult = evaluateWriterV2(profile1RecognitionMessage, profile1RecognitionInput);
assert.equal(profile1RecognitionResult.approved, true);
assert.equal(profile1RecognitionResult.movementValue?.valueKind, 'recognition');

const recurrentRevisitInput = { ...input, allowMovementRevisit: true, recentMessages: [] };
const recurrentRevisit = evaluateWriterV2('Una revisita con un ángulo distinto y una aplicación concreta para esta decisión laboral.', recurrentRevisitInput);
assert.equal(recurrentRevisit.hardFailures.includes('repeated_psychological_movement'), false, 'recurrent planner allows a new exposure of the same movement');

const orderedProgressionInput = { ...input, allowMovementRevisit: false, recentMovements: [input.psychologicalMove], recentMessages: [] };
const orderedRepeat = evaluateWriterV2('Una revisita con un ángulo distinto y una aplicación concreta para esta decisión laboral.', orderedProgressionInput);
assert.equal(orderedRepeat.hardFailures.includes('repeated_psychological_movement'), true, 'initial ordered progression keeps its repeat guard');

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
