import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildWelcomeMessage, calculateReceptionStage, receptionInstructions, receptionTimeOfDay, shouldGeneratePsychologicalIntervention, welcomeDeliveryNeeded } from '../lib/server/reception-progression.ts';
import { evaluateWriterV2, writerV2Prompt } from '../lib/server/writer-v2.ts';

const bogota = 'America/Bogota';
const utc = value => new Date(value);

assert.equal(calculateReceptionStage({ welcomeDelivered: false, psychologicalInterventionsDelivered: 0 }), 'tuning');
assert.equal(shouldGeneratePsychologicalIntervention('welcome'), true);
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 0 }), 'tuning');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 1 }), 'tuning');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 2 }), 'building');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 4 }), 'building');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 5 }), 'established');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 99 }), 'established');
assert.equal(calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 0 }), calculateReceptionStage({ welcomeDelivered: true, psychologicalInterventionsDelivered: 0 }));
assert.equal(receptionTimeOfDay(utc('2026-10-03T13:00:00Z'), bogota), 'morning');
assert.equal(receptionTimeOfDay(utc('2026-10-03T18:00:00Z'), bogota), 'afternoon');
assert.equal(receptionTimeOfDay(utc('2026-10-04T01:00:00Z'), bogota), 'evening');
const welcome = buildWelcomeMessage('Adriana', utc('2026-10-03T13:00:00Z'), bogota);
assert.match(welcome, /^Buenos días, Adriana\. Soy NIA\./);
assert.equal(/poco\s+a\s+poco/i.test(welcome), false);
assert.equal(welcomeDeliveryNeeded({ exists: false, delivered: false }), true);
assert.equal(welcomeDeliveryNeeded({ exists: true, delivered: false }), true);
assert.equal(welcomeDeliveryNeeded({ exists: true, delivered: true }), false);
assert.deepEqual(receptionInstructions('tuning').length > 0, true);

const input = { situation: 'ya tienes un criterio y consultas varias opiniones', desiredChange: 'confiar más en tu criterio', psychologicalMove: 'define_decision_criterion', movementExplanation: 'define un criterio antes de consultar', confirmedFacts: ['ya tienes un criterio'], recentMovements: [], communicationPreference: null, safetyConstraints: [], receptionStage: 'tuning', psychologicalInterventionsDelivered: 0, timeOfDay: 'morning', receptionInstructions: ['entra suavemente'] };
const prompt = writerV2Prompt(input);
assert.match(prompt, /"reception_stage":"tuning"/);
assert.match(prompt, /"time_of_day":"morning"/);
assert.match(prompt, /"psychological_interventions_delivered":0/);
assert.deepEqual(evaluateWriterV2('Confía más en ti y avanza poco a poco.', input).hardFailures.includes('forbidden_language:poco_a_poco'), true);
assert.equal(evaluateWriterV2('Define qué dato concreto tendría que cambiar para reconsiderar tu decisión.', input).hardFailures.includes('forbidden_language:poco_a_poco'), false);
const dailySource = fs.readFileSync(new URL('../lib/server/daily-message.ts', import.meta.url), 'utf8');
const inboundSource = fs.readFileSync(new URL('../lib/server/whatsapp-inbound.ts', import.meta.url), 'utf8');
const engineSource = fs.readFileSync(new URL('../lib/intervention-engine.ts', import.meta.url), 'utf8');
assert.doesNotMatch(dailySource, /ensureWelcome/);
assert.doesNotMatch(dailySource, /kind: 'welcome'/);
assert.match(inboundSource, /ensureWelcome/);
assert.match(inboundSource, /if \(welcome\.created\)/);
assert.match(engineSource, /poco a poco/);

console.log('reception progression tests: PASS (20 cases)');
