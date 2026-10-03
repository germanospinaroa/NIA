import assert from 'node:assert/strict';
import { auditCandidate, firstReadComprehension, hasRoboticOrAbstractLanguage, sameEditorialIdea } from '../lib/intervention-engine.ts';
import { buildEditorialMemory } from '../lib/server/editorial-memory.ts';
import { planEditorial } from '../lib/server/editorial-planner.ts';

const base = { desiredChange: 'Confiar más en mi criterio', currentContext: 'Cuando alguien cuestiona una decisión', recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [] };
const candidate = (text, idea, experience = 'reflection') => ({ text, editorialIdea: idea, editorialTake: idea, topic: 'criterio', experienceType: experience, interventionType: 'reflection', depth: 'brief', blocks: [{ type: 'idea', text }], function: 'reframe', concept: 'self_trust', angle: idea, structure: 'context_does_not_mean' });

const differentIdea = candidate('Puedes escuchar una opinión sin convertirla en una instrucción.', 'Pedir opinión no significa entregar la decisión.');
assert.equal(sameEditorialIdea(differentIdea, 'Un desacuerdo no demuestra que tu decisión sea un error.'), false);
assert.equal(auditCandidate(differentIdea, { ...base, recentEditorialIdeas: ['Un desacuerdo no demuestra que tu decisión sea un error.'] }).reasons.includes('same_editorial_idea'), false);
const sameIdea = candidate('No cambies de opinión solo porque alguien piense diferente.', 'Un desacuerdo no demuestra que tu decisión sea un error.');
assert.equal(sameEditorialIdea(sameIdea, 'Que alguien no esté de acuerdo contigo no significa que estés equivocada.'), true);
assert.equal(auditCandidate(sameIdea, { ...base, recentEditorialIdeas: ['Que alguien no esté de acuerdo contigo no significa que estés equivocada.'] }).reasons.includes('same_editorial_idea'), true);

assert.equal(firstReadComprehension('Antes de pedir otra opinión, escribe primero qué harías tú.'), true);
assert.equal(hasRoboticOrAbstractLanguage('Define un umbral verificable para reconsiderar tu decisión.'), true);
const abstractAudit = auditCandidate(candidate('Define un umbral verificable para reconsiderar tu decisión.', 'Decidir cuándo revisar una decisión.'), base);
assert.equal(abstractAudit.reasons.includes('robotic_or_abstract_language'), true);
assert.equal(auditCandidate(candidate('No tienes que resolver todo hoy.', 'No todo necesita resolverse de inmediato.', 'encouragement'), base).reasons.includes('coaching_language'), false);
assert.equal(auditCandidate(candidate('Antes de preguntarle a alguien qué haría sobre una decisión, escribe primero qué harías tú.', 'Pedir opinión sin transferir la decisión.', 'practical_tool'), base).approved, true);

const now = new Date('2026-10-03T12:00:00Z');
const row = (days, experience, idea) => ({ id: String(days), created_at: new Date(now.getTime() - days * 86400000).toISOString(), topic: 'criterio', concept: 'self_trust', angle: idea, intervention_type: experience === 'practical_tool' ? 'tool' : 'reflection', depth: 'medium', editorial_take: idea, editorial_idea: idea, experience_type: experience });
const repeated = buildEditorialMemory([row(0, 'reflection', 'idea-a'), row(1, 'reflection', 'idea-b'), row(2, 'reflection', 'idea-c'), row(3, 'brief_insight', 'idea-d')], 30, now);
const repeatedPlan = planEditorial({ desiredChange: base.desiredChange, currentContext: base.currentContext, communicationPreference: 'adaptive', memory: repeated, relevantTopics: ['criterio'] });
assert.notEqual(repeatedPlan.recommended_experience_type, 'reflection');
assert.ok(repeatedPlan.recent_experiences_to_avoid.includes('reflection'));

const healthy = buildEditorialMemory([row(0, 'reflection', 'idea-a'), row(1, 'practical_tool', 'idea-b'), row(2, 'encouragement', 'idea-c')], 30, now);
const healthyPlan = planEditorial({ desiredChange: base.desiredChange, currentContext: base.currentContext, communicationPreference: 'adaptive', memory: healthy, relevantTopics: ['criterio'] });
assert.deepEqual(healthyPlan.recent_experiences_to_avoid, []);

console.log('editorial quality tests: PASS');
