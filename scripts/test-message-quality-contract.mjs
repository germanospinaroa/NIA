import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateWriterV2, containsAddressName, writerV2InputFromBrief, writerV2Prompt } from '../lib/server/writer-v2.ts';
import { contextVersion, MESSAGE_CONTRACT_VERSION } from '../lib/recurrent-daily.ts';

const input = {
  firstName: 'Juanita',
  situation: 'Cuando tengo que tomar una decisión importante.',
  desiredChange: 'Decir lo que realmente quiero decir.',
  psychologicalMove: 'external_validation:information_vs_delegating_decision',
  canonicalTargetMovement: 'external_validation:information_vs_delegating_decision',
  movementExplanation: 'Separar la información de entregar la decisión.',
  confirmedFacts: ['Cuando tengo que tomar una decisión importante.'],
  recentMovements: [],
  communicationPreference: 'adaptive',
  safetyConstraints: [],
  receptionStage: 'tuning',
  psychologicalInterventionsDelivered: 0,
  timeOfDay: 'afternoon',
  receptionInstructions: [],
  previousDeliveredMovement: null,
  previousDeliveredTakeaway: null,
  previousDeliveredMessage: null,
  continuityGuidance: [],
  newContribution: 'Separar información de permiso.',
  expectedTakeaway: 'Buscar información no es lo mismo que entregar la decisión.',
  recentMessages: [],
};

const badIncident = 'Ante una decisión importante, la señal que puedes reconocer no es solo el tema de la decisión, sino el momento en que toca expresar lo que quieres. Puede aparecer con una pregunta como «¿qué prefieres?» o «¿qué decides?». Si ocurre, esa pregunta es una señal observable: marca el paso de pensar en las opciones a decir tu postura. Reconocer ese instante permite ubicar dónde entra en juego tu deseo de decir lo que realmente quieres decir.';
const goodMessage = 'Juanita, cuando tienes una decisión importante delante, puede que ya tengas una primera respuesta y aun así busques otra opinión.\n\nLa próxima vez, separa una pregunta: ¿qué información me falta de verdad? Si no falta ningún dato, quizá estás pidiendo permiso para sostener tu decisión.';

const bad = evaluateWriterV2(badIncident, input);
assert.equal(bad.approved, false);
assert.ok(bad.hardFailures.includes('missing_personal_name'));
assert.ok(bad.hardFailures.includes('whatsapp_wall_of_text'));
assert.ok(bad.hardFailures.includes('system_language_leak'));

const good = evaluateWriterV2(goodMessage, input);
assert.equal(good.approved, true, good.hardFailures.join(','));
assert.equal(good.namePresent, true);
assert.equal(good.paragraphCount, 2);
assert.equal(containsAddressName('Esto pasa mañana.', 'Ana'), false);
assert.equal(evaluateWriterV2('Ana, confía en ti. Tú sabes qué hacer.', { ...input, firstName: 'Ana' }).approved, false);
assert.ok(evaluateWriterV2('Ana, confía en ti. Tú sabes qué hacer.', { ...input, firstName: 'Ana' }).hardFailures.includes('no_transferable_value'));
assert.ok(evaluateWriterV2('Juanita, ' + 'a'.repeat(440), input).hardFailures.includes('whatsapp_wall_of_text'));

const brief = { firstName: 'Juanita', desiredChange: input.desiredChange, currentContext: input.situation, relevantSituations: [], dailyPlan: { canonicalMovement: input.canonicalTargetMovement, newContribution: input.newContribution, expectedTakeaway: input.expectedTakeaway }, psychologicalProgression: { next_recommended_movement: input.canonicalTargetMovement, completed_movements: [], recent_movements: [], continuity: { previousDeliveredMovement: null, previousDeliveredTakeaway: null, previousDeliveredMessage: null, continuityGuidance: [] } }, interventionBlueprint: null, psychologicalContract: null, recentInterventions: [] };
const propagated = writerV2InputFromBrief(brief);
assert.equal(propagated.firstName, 'Juanita');
assert.match(writerV2Prompt(propagated), /confirmed_address_name/);
assert.match(writerV2Prompt(propagated), /Juanita/);
assert.equal(contextVersion('contexto', 'objetivo', { communicationPreference: 'adaptive' }) === contextVersion('contexto', 'objetivo', { communicationPreference: 'adaptive' }), true);
assert.equal(MESSAGE_CONTRACT_VERSION, 'nia_daily_v3');

const daily = fs.readFileSync('lib/server/daily-message.ts', 'utf8');
const whatsapp = fs.readFileSync('lib/server/whatsapp-daily.ts', 'utf8');
assert.match(daily, /content: buffered\.message/);
assert.match(whatsapp, /String\(daily\.interaction\.content\)/);
assert.doesNotMatch(daily, /split\([^)]*\\n|join\(['"] ['"]\)/);

console.log('message quality contract tests: PASS');
