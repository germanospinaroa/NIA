import assert from 'node:assert/strict';
import { applyLearningSignals, auditCandidate, auditSemanticCandidate, contextStatusForDays, feedbackFor, formatCandidateText, hasInternalRepetition, hasPerformativeCoachingVoice, hasSufficientContext, hasUnsupportedPersonalContext, learningFromFeedback } from '../lib/intervention-engine.ts';
import { composeCandidateText, validateLlmCandidate } from '../lib/server/llm-intervention.ts';

const base = { desiredChange: 'Quiero confiar más en mis decisiones.', currentContext: 'Mi jefe cuestiona mis decisiones.', recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [] };
const flattenedList = 'Introducción. 1. Primer paso. 2. Segundo paso. 3. Tercer paso.';
assert.equal(formatCandidateText(flattenedList), flattenedList);
assert.equal(formatCandidateText('Introducción.\n\n1. Primer paso\n2. Segundo paso\n3. Tercer paso'), 'Introducción.\n\n1. Primer paso\n2. Segundo paso\n3. Tercer paso');
assert.equal(formatCandidateText('Texto completamente plano sin estructura detectable.'), 'Texto completamente plano sin estructura detectable.');
assert.equal(formatCandidateText('texto\r\n\r\n1. paso'), 'texto\n\n1. paso');
const structuredCandidate = {
  recognition: 'Cuando tu jefe cuestiona una decisión, notas que empiezas a mirar tu criterio con sus ojos.',
  explanation: 'La duda puede aparecer aunque la situación no haya cambiado y aunque antes tuvieras razones claras.',
  insight: 'Escuchar una opinión y necesitar convertirla en una razón para cambiar son cosas distintas.',
  steps: ['Anota qué pensabas antes de escucharla.', 'Revisa si apareció un dato nuevo o solo una opinión diferente.', 'Espera antes de cambiar si tus razones siguen teniendo sentido.'],
  action: 'Hoy practica esa pausa antes de pedir otra opinión sobre una decisión concreta.',
  closing: 'Puedes escuchar y seguir decidiendo tú.',
  function: 'anticipate', concept: 'self_trust', angle: 'revisar datos antes de cambiar', structure: 'when_then',
};
const composedStructured = composeCandidateText(structuredCandidate);
assert.equal(composedStructured.split('\n').filter(line => /^\d+\. /.test(line)).length, 3);
assert.equal(composedStructured.includes('\n\n'), true);
assert.equal(composedStructured, [structuredCandidate.recognition, structuredCandidate.explanation, structuredCandidate.insight, '1. Anota qué pensabas antes de escucharla.\n2. Revisa si apareció un dato nuevo o solo una opinión diferente.\n3. Espera antes de cambiar si tus razones siguen teniendo sentido.', structuredCandidate.action, structuredCandidate.closing].join('\n\n'));
assert.equal(validateLlmCandidate(structuredCandidate), true);
assert.equal(validateLlmCandidate({ ...structuredCandidate, steps: [] }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, steps: ['Solo un paso'] }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, steps: ['1', '2', '3', '4'] }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, steps: ['1. Numerado por error', 'Otro paso'] }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, recognition: undefined }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, function: 'invalid' }), false);
assert.equal(validateLlmCandidate({ ...structuredCandidate, structure: 'invalid' }), false);
assert.equal(auditCandidate({ text: composedStructured, function: structuredCandidate.function, concept: structuredCandidate.concept, angle: structuredCandidate.angle, structure: structuredCandidate.structure }, base).reasons.includes('missing_structure'), false);
const generic = { text: 'Confía en ti.', function: 'remind', concept: 'self_trust', angle: 'generic', structure: 'specific_permission' };
assert.equal(auditCandidate(generic, base).status, 'rejected');
assert(auditCandidate(generic, base).reasons.includes('generic_or_missing_user_context'));
const duplicate = { text: 'No necesitas aprobación para decidir.', function: 'distinguish', concept: 'self_trust', angle: 'approval', structure: 'distinguish_between' };
const duplicateAudit = auditCandidate(duplicate, { ...base, recentInterventions: ['Confía en tu criterio.'] });
assert.equal(duplicateAudit.status, 'rejected');
assert(duplicateAudit.reasons.includes('semantic_duplicate'));
const contextual = { text: 'Cuando tu jefe cuestione una decisión, es fácil confundir una opinión con un dato nuevo.\n\nAntes de tomarla otra vez, anota qué pensabas antes, revisa qué cambió realmente y espera si no cambió ningún hecho. Hoy prueba responder después de esa pausa para seguir decidiendo tú.', function: 'anticipate', concept: 'self_trust', angle: 'context_without_abandonment', structure: 'context_does_not_mean' };
assert.equal(auditCandidate(contextual, base).status, 'approved');
assert.equal(learningFromFeedback('context', 'context_changed').triggerRecalibration, true);
assert.equal(learningFromFeedback('relevance', 'desired_change_changed').signal, 'desired_change_status');
assert.equal(learningFromFeedback('specificity', 'wording_off').preserveConcept, true);
assert.equal(learningFromFeedback('angle', 'angle_change').avoidAngleForRecentWindow, true);
assert.equal(feedbackFor(contextual).dimension, 'relevance');
assert(feedbackFor(contextual).options.some(option => option.key === 'context_changed'));
assert(feedbackFor(contextual).options.some(option => option.key === 'desired_change_changed'));
const structureAudit = auditCandidate({ ...contextual, structure: 'context_does_not_mean' }, { ...base, recentStructures: ['context_does_not_mean'] });
assert(structureAudit.reasons.includes('recent_structure_reuse'));
assert.equal(contextStatusForDays(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), null), true);
assert.equal(contextStatusForDays(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), null), false);
assert.equal(auditCandidate({ ...contextual, text: 'Eres suficiente.' }, base).status, 'rejected');
assert.equal(auditCandidate({ ...contextual, text: 'Entiendo que esto puede ser difícil.' }, base).status, 'rejected');
assert.equal(auditCandidate({ ...contextual, text: 'Te invito a reflexionar sobre lo que necesitas.' }, base).status, 'rejected');
for (const text of [
  'Antes de responder, espera diez minutos.',
  'Anota qué dato nuevo apareció antes de cambiar de decisión.',
  'Pregúntate qué información nueva tienes antes de cambiar de decisión.',
  'Prueba decir: Lo voy a pensar y te digo.',
  'Haz una pausa y escribe qué información nueva apareció.',
]) assert.equal(hasPerformativeCoachingVoice(text), false);
for (const text of [
  'Te invito a confiar más en ti.',
  'Date permiso para confiar en tu proceso.',
  'Recuerda que tú tienes las respuestas.',
  'Conecta con tu poder y recuerda que eres capaz de lograrlo.',
  'Haz un trabajo profundo para confiar en ti y dejar atrás tus dudas.',
  'Pregúntate por qué todavía no confías en ti.',
]) assert.equal(hasPerformativeCoachingVoice(text), true);
assert.equal(auditCandidate({ ...contextual, text: 'Haz una pausa y escribe qué información nueva apareció antes de responder.' }, base).checks.coaching_language, true);
assert.equal(auditCandidate({ ...contextual, text: 'Haz un trabajo profundo para confiar en ti y dejar atrás tus dudas.' }, base).checks.coaching_language, false);
const naturalRecognition = 'Cuando alguien cuestiona una decisión que ya tomaste, el desacuerdo puede sentirse como una señal de que deberías revisarla.';
const recognitionAudit = auditCandidate({ ...contextual, text: `${naturalRecognition}\n\nUna crítica puede mezclar opinión e información; separarlas permite decidir qué merece una revisión.` }, { ...base, currentContext: 'Cuando alguien cuestiona una decisión que ya tomaste.' });
assert.equal(recognitionAudit.checks.chatbot_language, true);
assert.equal(recognitionAudit.checks.fits_current_context, true);
assert.equal(hasUnsupportedPersonalContext('Una opinión general no ofrece el mismo trabajo que una observación concreta.', base), false);
assert.equal(hasUnsupportedPersonalContext('Un proyecto puede necesitar revisión cuando aparece información nueva.', base), false);
assert.equal(hasUnsupportedPersonalContext('El equipo puede aportar otra perspectiva.', base), false);
const noPersonalBrief = { ...base, currentContext: 'Cuando alguien cuestiona una decisión.' };
assert.equal(hasUnsupportedPersonalContext('Tu jefe cuestionó la decisión.', noPersonalBrief), true);
assert.equal(hasUnsupportedPersonalContext('Tu equipo te pidió cambiarla.', noPersonalBrief), true);
assert.equal(hasUnsupportedPersonalContext('En tu trabajo ocurrió algo distinto.', noPersonalBrief), true);
const nonRepetitiveParts = [
  'Cuando alguien cuestiona una decisión, el desacuerdo puede sentirse como una señal de revisión.',
  'Una crítica amplia puede mezclar opinión e información; separarlas permite decidir qué merece atención.',
  'Lo relevante es identificar qué dato nuevo cambiaría el criterio.',
  'Pregunta qué dato concreto respalda la objeción.',
  'Compáralo con la información disponible al decidir.',
  'Hoy escribe qué hallazgo justificaría revisar una decisión reciente.',
  'Así la revisión depende de evidencia nueva.',
];
assert.equal(hasInternalRepetition(nonRepetitiveParts), false);
const repetitiveParts = [
  'Una crítica puede mezclar opinión e información.',
  'La crítica mezcla opinión e información.',
  'Lo importante es separar opinión e información.',
  'Pregunta qué opinión e información contiene.',
  'Hoy separa opinión e información.',
  'Así separas opinión e información.',
];
assert.equal(hasInternalRepetition(repetitiveParts), true);
const semantic = auditSemanticCandidate(contextual, [{ intervention_id: '1', text: 'No necesitas aprobación para tomar decisiones.', similarity: 0.91, concept: contextual.concept, angle: 'other' }], { matches: [{ intervention_id: '1', relationship: 'duplicate', same_actionable_idea: true, same_angle: true, reason: 'Misma idea accionable.' }] });
assert.equal(semantic.status, 'rejected');
const calibratedDuplicate = auditSemanticCandidate(contextual, [{ intervention_id: '2', text: 'Confía en tu propio criterio.', similarity: 0.70, concept: 'self_trust', angle: 'paraphrase' }], { matches: [{ intervention_id: '2', relationship: 'duplicate', same_actionable_idea: true, same_angle: true, reason: 'Paráfrasis de la misma idea.' }] });
assert(calibratedDuplicate.reasons.includes('semantic_duplicate'));
const saturatedConcept = auditSemanticCandidate(contextual, [
  { intervention_id: '3', text: 'Una opinión ajena no decide por ti.', similarity: 0.41, concept: 'self_trust', angle: 'another_angle' },
  { intervention_id: '4', text: 'Escuchar una crítica no obliga a cambiar.', similarity: 0.43, concept: 'self_trust', angle: 'different_angle' },
]);
assert(saturatedConcept.reasons.includes('concept_saturated'));
const semanticPair = (text, similarity, relationship, sameActionable, sameAngle, id = 'pair') => auditSemanticCandidate(contextual, [{ intervention_id: id, text, similarity }], { matches: [{ intervention_id: id, relationship, same_actionable_idea: sameActionable, same_angle: sameAngle, reason: relationship }] });
assert.equal(semanticPair('Cuando te escriban fuera de horario, puedes dejar la respuesta para tu jornada.', 0.83, 'duplicate', true, true, 't1').status, 'rejected');
assert.equal(semanticPair('Cuando te propongan un plan para el fin de semana, di lo reviso y te confirmo antes de aceptar.', 0.64, 'same_theme_different_angle', false, false, 't2').status, 'approved');
assert.equal(semanticPair('Querer estar para tu familia y aceptar cada pedido son cosas distintas.', 0.58, 'duplicate', true, true, 't3').status, 'rejected');
assert.equal(semanticPair('Una cosa es que juzguen un avance; otra, que ese juicio defina el valor de tu proyecto.', 0.62, 'same_theme_different_angle', false, false, 't4').status, 'approved');
assert.equal(semanticPair('Puedes presentar el curso como una primera versión sin tener cada detalle cerrado.', 0.61, 'same_theme_different_angle', false, false, 't5').status, 'approved');
assert.equal(semanticPair('Puedes empezar con una frase sencilla: Quería contarte que esto me molestó.', 0.60, 'same_theme_different_angle', false, false, 't6').status, 'approved');
const retrievalOnly = auditSemanticCandidate(contextual, [{ intervention_id: 'low', text: 'Una intervención lejana.', similarity: 0.41 }]);
assert.equal(retrievalOnly.status, 'approved');
assert.equal(retrievalOnly.similarityBand, 'below_review');
const signalBrief = applyLearningSignals(base, [{ signal: 'wording_quality', value: { value: 'negative', concept: 'self_trust', structure: 'before_then' }, confidence: 1, expires_at: null }]);
assert.equal(signalBrief.feedbackGoal, 'new_wording');
assert(signalBrief.rejectedPatterns.includes('wording:before_then'));
const angleBrief = applyLearningSignals(base, [{ signal: 'angle_quality', value: { value: 'negative', angle: 'information_vs_approval' }, confidence: 1, expires_at: null }]);
assert.equal(angleBrief.feedbackGoal, 'new_angle');
const specificBrief = applyLearningSignals(base, [{ signal: 'specificity', value: { value: 'low' }, confidence: 1, expires_at: null }]);
assert.equal(specificBrief.feedbackGoal, 'specific_context');
assert(specificBrief.generationConstraints.some(value => value.includes('situación real confirmada')));
assert.equal(hasSufficientContext({ currentContext: 'Con mi familia termino diciendo que sí aunque no quiera.', relevantSituations: [], recurringPatterns: [], userLanguage: [], recentInterventions: [], learningSignals: [] }).sufficient, true);
assert.equal(hasSufficientContext({ currentContext: '', relevantSituations: [], recurringPatterns: [], userLanguage: [], recentInterventions: [], learningSignals: [] }).sufficient, false);
assert.equal(hasUnsupportedPersonalContext('Cuando tu jefe cuestione tus decisiones, espera antes de responder.', { ...base, currentContext: 'Quiero confiar más en mis decisiones.', relevantSituations: [] }), true);
assert.equal(hasUnsupportedPersonalContext('Cuando tu familia pida algo, puedes responder después.', { ...base, currentContext: 'Con mi familia termino diciendo que sí aunque no quiera.', relevantSituations: [] }), false);
const expiredBrief = applyLearningSignals(base, [{ signal: 'specificity', value: { value: 'low' }, confidence: 1, expires_at: new Date(Date.now() - 1000).toISOString() }]);
assert.equal(expiredBrief.feedbackGoal, undefined);
const decayedBrief = applyLearningSignals(base, [{ signal: 'specificity', value: { value: 'low' }, confidence: 1, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), expires_at: null }]);
assert(decayedBrief.learningSignals[0].decayWeight < 0.5 && decayedBrief.learningSignals[0].decayWeight > 0.2);
console.log('intervention-engine tests: PASS');
