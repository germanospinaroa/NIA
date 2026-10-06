import assert from 'node:assert/strict';
import { auditCandidate } from '../lib/intervention-engine.ts';
import { formulatePsychologicalIntervention } from '../lib/psychological-contract.ts';
import { derivePsychologicalProgression } from '../lib/psychological-progression.ts';
import { buildInterventionBlueprint } from '../lib/intervention-blueprint.ts';

const context = 'Cuando tengo que tomar una decisión importante, suelo pedir varias opiniones antes de decidir, aunque en el fondo ya tenga una respuesta o criterio propio.';
const goal = 'Confiar más en mi criterio.';
const contract = formulatePsychologicalIntervention({ currentContext: context, desiredChange: goal, relevantSituations: [context], recurringPatterns: ['consultar opiniones después de formar un criterio'] });
const progression = derivePsychologicalProgression({ goal, pattern: context, mechanismId: contract.mechanism_id, history: [{ id: 'previous', mechanismId: 'external_validation', movement: 'distinguir información de entregar la decisión', takeaway: 'Antes de pedir otra opinión, identifica qué esperas que aporte.', createdAt: '2026-10-03T12:00:00Z' }] });
const baseBrief = { desiredChange: goal, currentContext: context, relevantSituations: [context], recurringPatterns: ['consultar opiniones después de formar un criterio'], recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [], recentEditorialIdeas: [], recentEditorialTakes: [], recentExperienceTypes: [], learningSignals: [], psychologicalContract: contract, psychologicalProgression: progression };
const blueprint = buildInterventionBlueprint(baseBrief);
assert.ok(blueprint);
const laterProgression = derivePsychologicalProgression({ goal, pattern: context, mechanismId: contract.mechanism_id, history: [
  { id: 'current', mechanismId: 'external_validation', movement: 'define_decision_criterion', takeaway: 'Define qué tendría que cumplir una opción.', createdAt: '2026-10-03T12:00:00Z' },
  { id: 'previous', mechanismId: 'external_validation', movement: 'distinguir información de entregar la decisión', takeaway: 'Antes de pedir otra opinión, identifica qué esperas que aporte.', createdAt: '2026-10-02T12:00:00Z' },
] });
const laterBrief = { ...baseBrief, psychologicalProgression: laterProgression };
const laterBlueprint = buildInterventionBlueprint(laterBrief);

function candidate(text, overrides = {}) {
  return {
    text,
    topic: 'Duda y criterio propio', interventionType: 'tool', depth: 'medium', blocks: [{ type: 'idea', text }],
    function: 'distinguish', concept: 'self_trust', angle: 'decision_criteria', structure: 'distinguish_between',
    editorialType: 'distinction', movement: 'define_decision_criterion', psychologicalMove: 'define_decision_criterion',
    mechanismId: 'external_validation', mechanismConfidence: 'medium', interventionPurpose: 'Definir un criterio propio antes de consultar.',
    expectedMovement: 'Podrás evaluar una opción según tus propios criterios.', takeaway: 'Un criterio propio te permite valorar la información sin delegar la decisión.',
    optionalAction: null, ...overrides,
  };
}

function audit(text, overrides, brief = baseBrief, selectedBlueprint = blueprint) { return auditCandidate(candidate(text, overrides), { ...brief, interventionBlueprint: selectedBlueprint, sema: selectedBlueprint?.sema }); }

const generic = audit('Confía en ti y recuerda que ya tienes dentro todo lo necesario para tomar buenas decisiones.');
assert.equal(generic.approved, false, 'generic should reject');

const questionOnly = audit('¿Qué criterio tienes para decidir?');
assert.equal(questionOnly.approved, false, 'question without transfer should reject');

const completeText = 'Cuando ya tienes una respuesta y aun así te dan ganas de consultar varias opiniones, distingue entre escuchar información y entregar la decisión. Antes de preguntar, escribe dos o tres condiciones que la opción tendría que cumplir; después usa esas condiciones para valorar lo que escuches.';
const complete = audit(completeText, { blocks: [{ type: 'tool', text: 'Escribe dos o tres condiciones y úsalas para valorar lo que escuches.' }] });
assert.equal(complete.approved, true, `complete should approve: ${complete.reasons.join(',')}`);

const synonymRepeat = audit('Si ya sabes qué piensas, anota lo que tendría que pasar para que cambiaras de idea antes de escuchar otra voz.', { psychologicalMove: 'definir una condición propia antes de consultar', movement: 'define_decision_criterion', takeaway: 'Escribe la condición que haría cambiar tu decisión.', editorialIdea: 'criterio propio antes de consultar' });
assert.equal(synonymRepeat.approved, false, 'functional synonym should reject as progression repeat');

const newMovement = audit('Cuando ya tienes un criterio y aun así te dan ganas de consultar varias opiniones, no necesitas obedecer cada duda. Define qué dato concreto tendría que aparecer para que reconsideres tu decisión.', { blocks: [{ type: 'tool', text: 'Define qué dato concreto justificaría reconsiderar.' }], psychologicalMove: 'definir un umbral para reconsiderar una decisión', movement: 'definir un umbral para reconsiderar una decisión', takeaway: 'Define qué dato concreto justificaría reconsiderar.', editorialIdea: 'umbral concreto para revisar' }, laterBrief, laterBlueprint);
assert.equal(newMovement.approved, true, `new movement should approve: ${newMovement.reasons.join(',')}`);

const inventedEmotion = audit('Cuando estás aterrada de equivocarte, recuerda que esa ansiedad demuestra que necesitas confiar más en ti. Escribe tres razones para decidir.', { psychologicalMove: 'define_decision_criterion', movement: 'define_decision_criterion' });
assert.equal(inventedEmotion.approved, false, 'invented emotion should reject');

const oneObservation = audit('Observa lo que aprendiste esta vez y registra el cambio.', { editorialType: 'longitudinal_evidence', longitudinalEvidenceRefs: ['one'] });
assert.equal(oneObservation.approved, false, 'one longitudinal observation should reject');

const twoObservations = audit(completeText, { blocks: [{ type: 'tool', text: 'Escribe dos o tres condiciones y úsalas para valorar lo que escuches.' }], editorialType: 'longitudinal_evidence', longitudinalEvidenceRefs: ['one', 'two'] });
assert.equal(twoObservations.approved, true, `two longitudinal observations should approve: ${twoObservations.reasons.join(',')}`);

const multiMove = audit('Primero reinterpreta la duda, luego define tres criterios y además prepara una respuesta para la próxima conversación.', { psychologicalMove: 'reencuadrar y definir criterios y preparar una respuesta', movement: 'reframe y define_decision_criterion y situational_preparation' });
assert.equal(multiMove.approved, false, 'multiple moves should reject');

const blueprintMismatch = audit('¿Qué tendría que cumplir la opción que ya consideras para que la elijas?', { blocks: [{ type: 'question', text: '¿Qué tendría que cumplir la opción que ya consideras para que la elijas?' }], optionalAction: null });
assert.equal(blueprintMismatch.approved, false, 'blueprint without tool should reject');

const realAdriana = audit('Cuando ya tienes una respuesta o criterio y aun así empiezas a preguntar a varias personas, no necesitas dejar de consultar: necesitas decidir qué tendría que cumplir una opción para seguir pareciéndote adecuada. Antes de pedir otra opinión, escribe dos o tres criterios propios y usa lo que escuches para comprobarlos, no para reemplazarlos.', { blocks: [{ type: 'tool', text: 'Escribe dos o tres criterios propios y usa lo que escuches para comprobarlos.' }] });
assert.equal(realAdriana.approved, true, `Adriana-shaped candidate should approve: ${realAdriana.reasons.join(',')}`);

const wordingOnly = audit('Antes de buscar más consejos, escribe las condiciones que tu alternativa debe cumplir y compara la información con ellas.', { psychologicalMove: 'define_decision_criterion', movement: 'define_decision_criterion', takeaway: 'Anota las condiciones que debe cumplir tu opción.', editorialIdea: 'criterio propio antes de consultar' });
assert.equal(wordingOnly.approved, false, 'wording-only change should reject');

console.log(JSON.stringify({ status: 'PASS', blueprint_type: blueprint.intervention_type, movement: blueprint.movement, sema: blueprint.sema, cases: 12 }, null, 2));
