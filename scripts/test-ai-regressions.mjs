import assert from 'node:assert/strict';
import {
  applyLearningSignals,
  auditCandidate,
  firstReadComprehension,
  hasRoboticOrAbstractLanguage,
  hasSufficientContext,
  sameEditorialIdea,
} from '../lib/intervention-engine.ts';
import { buildEditorialMemory, buildEditorialRhythm } from '../lib/server/editorial-memory.ts';
import { planEditorial } from '../lib/server/editorial-planner.ts';
import { evaluateEditorialGates, hasLongitudinalEvidence, sameDayRepetition, scoreEditorialCandidate, territoryState } from '../lib/editorial-contract.ts';

const now = new Date('2026-10-03T12:00:00Z');
const brief = {
  desiredChange: 'Confiar más en mi criterio',
  currentContext: 'Cuando alguien cuestiona una decisión que ya tomaste',
  relevantSituations: ['Cuando alguien cuestiona una decisión que ya tomaste'],
  recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [],
  recentEditorialIdeas: [], recentEditorialTakes: [], recentExperienceTypes: [], learningSignals: [],
};

function candidate(text, options = {}) {
  const block = options.blocks ?? [{ type: 'idea', text }];
  return {
    text, topic: options.topic ?? 'criterio propio', editorialIdea: options.idea ?? 'Una opinión no decide por ti.',
    editorialTake: options.take ?? options.idea ?? 'Una opinión no decide por ti.', experienceType: options.experience ?? 'reflection',
    interventionType: options.type ?? 'reflection', depth: options.depth ?? 'brief', blocks: block,
    function: options.function ?? 'reframe', concept: options.concept ?? 'self_trust', angle: options.angle ?? 'opinion_vs_decision',
    structure: options.structure ?? 'context_does_not_mean',
  };
}

function audit(text, options = {}, extra = {}) {
  return auditCandidate(candidate(text, options), { ...brief, ...extra });
}

function row(i, overrides = {}) {
  return { id: String(i), created_at: new Date(now.getTime() - i * 86400000).toISOString(), topic: 'criterio propio', concept: 'self_trust', angle: 'opinion_vs_decision', intervention_type: 'reflection', depth: 'medium', experience_type: 'reflection', editorial_take: `take-${i}`, editorial_idea: `idea-${i}`, ...overrides };
}

// 1, 4, 5: same topic is allowed when the movement, situation, or function changes.
const first = 'Que alguien no esté de acuerdo contigo no significa que estés equivocada.';
const differentMovement = candidate('Puedes escuchar una opinión sin convertirla automáticamente en una instrucción.', { idea: 'Pedir opinión no significa entregar la decisión.', angle: 'input_without_transfer', function: 'distinguish' });
assert.equal(sameEditorialIdea(differentMovement, first), false);
assert.equal(auditCandidate(differentMovement, brief).reasons.includes('semantic_duplicate'), false);
assert.equal(audit('Cuando te pidan explicar una decisión nueva, puedes pedir información sin pedir permiso.', { idea: 'Pedir datos sobre una situación nueva no equivale a abandonar tu criterio.', angle: 'new_situation', function: 'anticipate' }).approved, true);
assert.equal(audit('Cuando alguien cuestiona una decisión, escribe primero qué piensas tú y después escucha la opinión.', { idea: 'Pedir una opinión puede servir para comparar, no para delegar la decisión.', angle: 'practical_comparison', function: 'distinguish', type: 'tool', blocks: [{ type: 'tool', text: 'Escribe primero tu respuesta y luego compara lo que escuchaste.' }] }).approved, true);

// 2, 3, 7, 8: wording changes and synonyms do not create editorial novelty.
const sameMovement = candidate('No cambies de opinión solo porque alguien piense diferente.', { idea: 'No entregar la decisión cuando alguien duda de ella.' });
assert.equal(sameEditorialIdea(sameMovement, first), true);
assert.equal(auditCandidate(sameMovement, { ...brief, recentEditorialIdeas: [first] }).reasons.includes('same_editorial_idea'), true);
assert.equal(sameEditorialIdea(candidate('Una opinión distinta no es una orden para abandonar lo que decidiste.', { idea: 'Escuchar una opinión no significa ceder la decisión.' }), 'Pedir consejo no significa dejar que otra persona decida por ti.'), true);

// 6: same-day slot 2 must reject the same experience/idea and allow a genuinely different one.
const slotOneIdea = 'Una opinión puede aportar datos sin convertirse en la decisión.';
assert.equal(audit('Cuando alguien cuestiona tu decisión, escuchar datos no significa entregar la decisión.', { idea: slotOneIdea }, { recentEditorialIdeas: [slotOneIdea] }).reasons.includes('same_editorial_idea'), true);
assert.equal(audit('Cuando alguien cuestiona tu decisión, la pregunta útil es qué dato nuevo cambiaría tus razones.', { idea: 'Solo una evidencia nueva justifica revisar el criterio.' }, { recentEditorialIdeas: [slotOneIdea] }).reasons.includes('same_editorial_idea'), false);

// 9–14: flexible content is valid without universal steps, questions, actions, or closings.
for (const fixture of [
  { text: 'Cuando alguien cuestiona una decisión, puedes escuchar sin tener que resolverlo todo en ese momento.', type: 'brief_insight' },
  { text: 'Cuando alguien cuestiona una decisión, recuerda que una pausa también puede ser una respuesta suficiente por ahora.', type: 'reflection' },
  { text: 'Cuando alguien cuestiona una decisión, antes de responder escribe en una frase qué piensas tú.', type: 'tool' },
]) {
  const result = audit(fixture.text, { type: fixture.type, blocks: [{ type: 'idea', text: fixture.text }] });
  assert.equal(result.reasons.includes('missing_steps_for_type'), false);
  assert.equal(result.reasons.includes('empty_value'), false);
  assert.equal(result.reasons.includes('question_required'), false);
}
assert.equal(audit('Cuando alguien cuestiona una decisión, una idea breve puede bastar: escuchar no es lo mismo que obedecer.', { depth: 'brief' }).approved, true);
assert.equal(audit('Cuando alguien cuestiona una decisión, una explicación más desarrollada puede separar la opinión, los datos y las consecuencias antes de cambiar de criterio.', { depth: 'deep', blocks: [{ type: 'explanation', text: 'Una crítica puede mezclar opinión, datos y consecuencias.' }, { type: 'example', text: 'Pedir precisión muestra qué parte merece revisión.' }] }).reasons.includes('missing_steps_for_type'), false);

// 15–17, 25–28: language and personalization safeguards.
assert.equal(firstReadComprehension('Antes de pedir otra opinión, escribe primero qué harías tú.'), true);
assert.equal(hasRoboticOrAbstractLanguage('Define un umbral verificable para reconsiderar tu decisión.'), true);
assert.equal(audit('Cuando alguien cuestiona una decisión, define un umbral verificable para reconsiderar tu decisión.', { idea: 'Revisar una decisión con un umbral verificable.' }).reasons.includes('robotic_or_abstract_language'), true);
assert.equal(audit('Cuando alguien cuestiona una decisión, tu jefe sabe exactamente qué deberías hacer.', { idea: 'Una autoridad externa debe decidir por ti.' }).reasons.includes('unsupported_personal_context'), true);
assert.equal(audit('Cuando alguien cuestiona una decisión, quizá no respondes porque eres perezosa.', { idea: 'La falta de respuesta tiene una causa psicológica inventada.' }).reasons.includes('psychological_interpretation'), true);
assert.equal(audit('Confía en ti y recuerda que tienes todo lo necesario para avanzar.', { idea: 'La confianza genérica resuelve el problema.' }).reasons.includes('generic_motivation'), true);
assert.equal(audit('Te invito a conectar con la confianza que existe dentro de ti.', { idea: 'Conectar con la confianza interior.' }).reasons.includes('coaching_language'), true);
assert.equal(audit('Cuando alguien cuestiona una decisión, puedes escuchar la parte concreta que te sirva y dejar lo demás.', { idea: 'Una conversación humana puede ser breve y contextual.' }).approved, true);

// 18–20: feedback changes selection constraints; contextual preference is not permanent; sparse data stays sparse.
const feedbackApplied = applyLearningSignals({ ...brief, feedbackGoal: 'relevance' }, [{ signal: 'angle_quality', value: { value: 'negative', angle: 'opinion_vs_decision' }, created_at: now.toISOString() }], now);
assert.equal(feedbackApplied.feedbackGoal, 'new_angle');
assert(feedbackApplied.generationConstraints.some(value => value.includes('ángulo distinto')));
const feedbackPlan = planEditorial({ desiredChange: brief.desiredChange, currentContext: brief.currentContext, communicationPreference: 'adaptive', memory: buildEditorialMemory([row(0)], 30, now), relevantTopics: ['criterio propio'], feedbackGoal: feedbackApplied.feedbackGoal, rejectedPatterns: feedbackApplied.rejectedPatterns.concat('angle:opinion_vs_decision') });
assert.equal(feedbackPlan.recent_angles_to_avoid.includes('opinion_vs_decision'), true);
assert.equal(feedbackPlan.strategy, 'change_angle');
const structuredMemory = buildEditorialMemory([row(0, { intervention_type: 'step_by_step' }), row(1, { intervention_type: 'step_by_step' })], 30, now);
assert.notEqual(planEditorial({ desiredChange: brief.desiredChange, currentContext: brief.currentContext, communicationPreference: 'structured', memory: structuredMemory }).preferred_or_recommended_intervention_type, 'step_by_step');
assert.equal(hasSufficientContext({ currentContext: '', relevantSituations: [], recurringPatterns: [], userLanguage: [], recentInterventions: [], learningSignals: [] }).sufficient, false);

// 21–24: multi-day saturation and adaptive rhythm, never a weekday calendar.
const saturated = buildEditorialMemory([row(0), row(1), row(2)], 30, now);
assert.equal(saturated.topics[0].state, 'saturated');
const reflective = buildEditorialMemory([row(0, { experience_type: 'reflection' }), row(1, { experience_type: 'reflection' }), row(2, { experience_type: 'reflection' })], 30, now);
const rhythmPlan = planEditorial({ desiredChange: brief.desiredChange, currentContext: brief.currentContext, communicationPreference: 'adaptive', memory: reflective, relevantTopics: ['criterio propio'] });
assert.notEqual(rhythmPlan.recommended_experience_type, 'reflection');
assert(['brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'].includes(rhythmPlan.preferred_or_recommended_intervention_type));
const sameDecisionDifferentDay = planEditorial({ desiredChange: brief.desiredChange, currentContext: brief.currentContext, communicationPreference: 'adaptive', memory: buildEditorialMemory([row(0)], 30, new Date('2026-10-04T12:00:00Z')), relevantTopics: ['criterio propio'] });
assert.equal(typeof sameDecisionDifferentDay.strategy, 'string');

// Regression guard: one territory may recur, but a repeated take/idea is not new.
const repeatedTakeRhythm = buildEditorialRhythm([row(0, { editorial_take: 'Escuchar no significa obedecer.' }), row(1, { editorial_take: 'Escuchar no significa obedecer.' })], now);
assert.equal(repeatedTakeRhythm.repeatedTake, 'Escuchar no significa obedecer.');

// Final editorial-contract regressions: emotion, closing, action, territory, slots, evidence and gates.
const signature = { topic: 'criterio', editorialType: 'reframe', experienceType: 'reflection', functionalEmotion: 'claridad', directiveness: 'reflective', closingType: 'none', actionId: 'write-first-answer', insightId: 'input-is-not-authority', structure: 'context_does_not_mean' };
assert.equal(sameDayRepetition(signature, { ...signature, editorialTake: 'Otra formulación' }).repeated, true);
assert.equal(sameDayRepetition({ ...signature, editorialType: 'micro_action', experienceType: 'practical_tool', functionalEmotion: 'impulso', directiveness: 'directive', closingType: 'micro_action', actionId: 'ask-for-data', insightId: 'new-evidence', structure: 'before_then' }, signature).repeated, false);
assert.equal(territoryState([{ territoryKey: 'criterio', createdAt: now.toISOString() }, { territoryKey: 'criterio', createdAt: new Date(now - 86400000).toISOString() }, { territoryKey: 'criterio', createdAt: new Date(now - 2 * 86400000).toISOString() }], 'criterio', now), 'paused');
assert.equal(territoryState([{ territoryKey: 'criterio', createdAt: now.toISOString(), hasNewSituation: true }, { territoryKey: 'criterio', createdAt: new Date(now - 86400000).toISOString() }, { territoryKey: 'criterio', createdAt: new Date(now - 2 * 86400000).toISOString() }], 'criterio', now), 'watch');
assert.equal(hasLongitudinalEvidence(['obs-1']), false);
assert.equal(hasLongitudinalEvidence(['obs-1', 'obs-2']), true);
const gates = evaluateEditorialGates({ text: 'Cuando alguien cuestiona una decisión, puedes mirar qué dato cambió.', hasTruthfulContext: true, hasUnsupportedContext: false, hasTherapyLanguage: false, hasPsychologicalInterpretation: false, movement: 'reframe', editorialType: 'reframe' });
assert.equal(gates.reasons.length, 0);
assert.equal(evaluateEditorialGates({ text: 'Soy terapeuta y sé que tienes ansiedad.', hasTruthfulContext: true, hasUnsupportedContext: false, hasTherapyLanguage: true, hasPsychologicalInterpretation: true, movement: 'reframe', editorialType: 'reframe' }).scope, false);
assert.equal(evaluateEditorialGates({ text: 'Un mensaje', hasTruthfulContext: true, hasUnsupportedContext: false, hasTherapyLanguage: false, hasPsychologicalInterpretation: false, movement: 'reframe|micro_action', editorialType: 'reframe' }).one_move, false);
const scored = scoreEditorialCandidate({ gates, relevant: true, specific: true, useful: true, novel: true, natural: true, autonomy: true, timing: true, closingFit: true });
assert.equal(scored?.total, 100);
assert.equal(scoreEditorialCandidate({ ...({ gates: { ...gates, safety: false } }), relevant: true, specific: true, useful: true, novel: true, natural: true, autonomy: true, timing: true, closingFit: true }), null);
assert.equal(applyLearningSignals({ ...brief, feedbackGoal: 'relevance' }, [{ signal: 'action_feedback', value: 'not_done', created_at: now.toISOString() }], now).feedbackGoal, 'relevance');
assert.equal(applyLearningSignals({ ...brief }, [{ signal: 'help_type_quality', value: { value: 'negative', family: 'reframe' }, created_at: now.toISOString() }], now).generationConstraints.some(value => value.includes('función editorial')), true);

console.log('ai regression tests: PASS (40 behavioral regressions)');
