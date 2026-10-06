import assert from 'node:assert/strict';
import { derivePsychologicalProgression, movementKey, progressionForCandidate, PSYCHOLOGICAL_MOVEMENT_PATHS } from '../lib/psychological-progression.ts';
import { formulatePsychologicalIntervention } from '../lib/psychological-contract.ts';

for (const [mechanism, movements] of Object.entries(PSYCHOLOGICAL_MOVEMENT_PATHS)) {
  for (const canonical of movements) {
    assert.equal(movementKey({ mechanismId: mechanism, movement: canonical }), canonical);
    assert.equal(movementKey({ mechanismId: mechanism, psychologicalMovementKey: canonical, movement: 'descripción humana distinta' }), canonical);
  }
}

const base = {
  goal: 'Confiar más en mi criterio.',
  pattern: 'Cuando tengo una decisión importante, consulto varias opiniones aunque ya tenga un criterio.',
  mechanismId: 'external_validation',
};

const history = [
  { id: '3', mechanismId: 'external_validation', movement: 'comparar el criterio previo con los datos posteriores', takeaway: 'Una opinión puede aportar información sin decidir por ti.', createdAt: '2026-10-03T12:00:00Z' },
  { id: '2', mechanismId: 'external_validation', movement: 'registrar qué información nueva aparece al consultar', takeaway: 'Una opinión puede aportar información sin decidir por ti.', createdAt: '2026-10-02T12:00:00Z' },
  { id: '1', mechanismId: 'external_validation', movement: 'distinguir información de entregar la decisión', takeaway: 'Consultar no significa entregar la decisión.', createdAt: '2026-10-01T12:00:00Z' },
];
const progression = derivePsychologicalProgression({ ...base, history });
const alignedContract = formulatePsychologicalIntervention({
  currentContext: base.pattern,
  desiredChange: base.goal,
  relevantSituations: [base.pattern],
  preferredMovement: 'external_validation:define_decision_criterion',
});
assert.equal(alignedContract.psychological_move, 'definir qué condiciones tendría que cumplir una opción para que la elijas');
assert.match(alignedContract.expected_movement, /definir qué condiciones tendría que cumplir una opción/);
assert.equal(progression.current_psychological_state, 'external_validation:information_vs_delegating_decision');
assert.equal(progression.next_recommended_movement, 'external_validation:define_decision_criterion');
assert.ok(progression.completed_movements.includes('external_validation:information_vs_delegating_decision'));
assert.ok(progression.recent_takeaways.length > 0);

const candidate = (movement, takeaway = 'Definir qué información podría cambiar mi decisión.') => ({
  mechanismId: 'external_validation',
  movement,
  takeaway,
  editorialIdea: movement,
  concept: movement,
  angle: movement,
});

// Production-shaped regression from Adriana's last production intervention:
// the next movement is not another explanation about consulting, but the
// user's own decision criterion.
const adrianaProduction = derivePsychologicalProgression({
  ...base,
  history: [{
    mechanismId: 'external_validation',
    movement: 'Preguntar qué función cumple la opinión buscada: aportar algo que falta o cerrar la decisión.',
    takeaway: 'Antes de pedir otra opinión, identifica qué esperas que aporte.',
  }],
});
assert.equal(adrianaProduction.next_recommended_movement, 'external_validation:define_decision_criterion');
assert.equal(progressionForCandidate(candidate('volver a distinguir información de delegar el cierre', 'Consultar no significa entregar la decisión.'), adrianaProduction).approved, false);
assert.equal(progressionForCandidate(candidate('definir qué criterio usaré para decidir con la información suficiente', 'Un criterio propio ayuda a saber cuándo ya tengo base para decidir.'), adrianaProduction).approved, true);

// Production-shaped history: the persisted machine key is authoritative even
// when the human-readable movement still describes the previous phase.
const canonicalApprovedHistory = derivePsychologicalProgression({
  ...base,
  history: [{
    mechanismId: 'external_validation',
    psychologicalMovementKey: 'external_validation:define_decision_criterion',
    movement: 'distinguir información de entregar la decisión',
    takeaway: 'Las condiciones propias sirven para valorar lo que escuchas.',
  }],
});
assert.equal(canonicalApprovedHistory.completed_movements[0], 'external_validation:define_decision_criterion');
assert.equal(canonicalApprovedHistory.next_recommended_movement, 'external_validation:set_reconsideration_threshold');
assert.equal(progressionForCandidate(candidate('definir qué tendría que cambiar para reconsiderar la decisión', 'Una condición concreta ayuda a saber cuándo revisar.'), canonicalApprovedHistory).approved, true);

// Rejected candidates are not part of the canonical intervention history.
const historyWithoutRejectedCandidate = derivePsychologicalProgression({
  ...base,
  history: [{
    mechanismId: 'external_validation',
    psychologicalMovementKey: 'external_validation:information_vs_delegating_decision',
    movement: 'distinguir información de entregar la decisión',
    takeaway: 'Consultar no significa entregar la decisión.',
  }],
});
assert.equal(historyWithoutRejectedCandidate.completed_movements.includes('external_validation:define_decision_criterion'), false);
assert.equal(historyWithoutRejectedCandidate.next_recommended_movement, 'external_validation:define_decision_criterion');

// 1. Same wording: reject the movement already worked.
assert.equal(progressionForCandidate(candidate('distinguir información de entregar la decisión', 'Consultar no significa entregar la decisión.'), progression).reason, 'repeated_movement');

// 2. Paraphrase: different wording, same functional movement.
assert.equal(progressionForCandidate(candidate('separar los datos que aporta una opinión de dejar que otra persona cierre la decisión'), progression).reason, 'repeated_movement');

// 3. Same topic, next movement: approve.
const next = progressionForCandidate(candidate('definir qué criterio y qué dato concreto serían suficientes para decidir'), progression);
assert.equal(next.approved, true);
assert.equal(next.key, 'external_validation:define_decision_criterion');

// 4. Same situation with legitimate deepening: approve the next phase.
const afterCriteria = derivePsychologicalProgression({ ...base, history: [{ ...history[0], movement: 'definir qué criterio y qué dato concreto serían suficientes para decidir' }, ...history] });
assert.equal(progressionForCandidate(candidate('nombrar qué tendría que cambiar para reconsiderar la decisión'), afterCriteria).approved, true);

// 5. A different mechanism cannot hide the same takeaway.
const differentMechanism = progressionForCandidate({ ...candidate('identificar qué información falta antes de decidir', 'Consultar no significa entregar la decisión.'), mechanismId: 'uncertainty_clarification' }, progression);
assert.equal(differentMechanism.reason, 'repeated_takeaway');

// 6. A new phase remains available after the previous one is recorded.
assert.equal(afterCriteria.next_recommended_movement, 'external_validation:set_reconsideration_threshold');
assert.equal(progressionForCandidate(candidate('definir qué tendría que cambiar para reconsiderar mi decisión', 'Una condición concreta ayuda a saber cuándo revisar.'), afterCriteria).approved, true);

// 7. Three consecutive interventions must advance rather than reword the same idea.
let trajectory = derivePsychologicalProgression({ ...base, history: [] });
const trajectoryKeys = [];
for (const movement of [
  'distinguir información de entregar la decisión',
  'definir qué criterio y qué dato concreto serían suficientes para decidir',
  'nombrar qué tendría que cambiar para reconsiderar la decisión',
]) {
  const result = progressionForCandidate(candidate(movement, `Valor de fase: ${movement}`), trajectory);
  assert.equal(result.approved, true);
  trajectoryKeys.push(result.key);
  trajectory = derivePsychologicalProgression({ ...base, history: [{ mechanismId: 'external_validation', movement, takeaway: `Valor de fase: ${movement}` }, ...trajectoryHistory(trajectory) ] });
}
assert.deepEqual(trajectoryKeys, [
  'external_validation:information_vs_delegating_decision',
  'external_validation:define_decision_criterion',
  'external_validation:set_reconsideration_threshold',
]);

// 8. A topic can return after other work when it has a new movement.
const returning = derivePsychologicalProgression({ ...base, history: [{ mechanismId: 'progress_monitoring', movement: 'nombrar qué cambió', takeaway: 'Puedo observar lo que aprendí.' }] });
assert.equal(progressionForCandidate(candidate('definir qué criterio usaré para decidir'), returning).approved, true);

const profile1Path = PSYCHOLOGICAL_MOVEMENT_PATHS.external_validation;
let profile1History = [];
for (let index = 0; index < profile1Path.length; index += 1) {
  const current = derivePsychologicalProgression({ ...base, history: profile1History, confirmedEvidence: [base.pattern, 'Tomé una decisión laboral y revisé el resultado.'] });
  assert.equal(current.next_recommended_movement, profile1Path[index]);
  profile1History = [{ mechanismId: 'external_validation', movement: profile1Path[index], psychologicalMovementKey: profile1Path[index], takeaway: `takeaway-${index}` }, ...profile1History];
}
const profile1Complete = derivePsychologicalProgression({ ...base, history: profile1History, confirmedEvidence: [base.pattern, 'Tomé una decisión laboral y revisé el resultado.'] });
assert.equal(profile1Complete.next_recommended_movement, null);
assert.deepEqual(profile1Complete.available_next_movements, []);
assert.equal(profile1Complete.progression_reason, 'trajectory_complete');

let profile2History = [];
for (const expected of PSYCHOLOGICAL_MOVEMENT_PATHS.uncertainty_clarification) {
  const current = derivePsychologicalProgression({ ...base, mechanismId: 'uncertainty_clarification', history: profile2History });
  assert.equal(current.next_recommended_movement, expected);
  profile2History = [{ mechanismId: 'uncertainty_clarification', movement: expected, psychologicalMovementKey: expected, takeaway: expected }, ...profile2History];
}
const persistedMovement = 'external_validation:decide_with_sufficient_information';
const persistedSignature = { mechanismId: 'external_validation', psychologicalMovementKey: persistedMovement, movement: persistedMovement };
const reconstructed = JSON.parse(JSON.stringify(persistedSignature));
assert.equal(movementKey(reconstructed), persistedMovement);
const persistedNext = derivePsychologicalProgression({ ...base, history: [reconstructed] });
assert.equal(persistedNext.next_recommended_movement, 'external_validation:build_evidence_of_own_capacity');
const persistedNextWithEvidence = derivePsychologicalProgression({ ...base, history: [reconstructed], confirmedEvidence: ['Tomé una decisión laboral que salió diferente de lo esperado y desde entonces pienso que no sé decidir bien.'] });
assert.equal(persistedNextWithEvidence.next_recommended_movement, 'external_validation:review_outcome_without_self_punishment');
const uncertaintyPersisted = 'uncertainty_clarification:identify_what_is_known';
assert.equal(derivePsychologicalProgression({ ...base, mechanismId: 'uncertainty_clarification', history: [{ mechanismId: 'uncertainty_clarification', psychologicalMovementKey: uncertaintyPersisted, movement: uncertaintyPersisted }] }).next_recommended_movement, 'uncertainty_clarification:choose_a_sufficient_next_step');

function trajectoryHistory(value) {
  return value.recent_movements.map((key, index) => ({ mechanismId: key.split(':')[0], movement: key.split(':').slice(1).join(' ').replaceAll('_', ' '), takeaway: `Historial ${index}` }));
}

console.log(JSON.stringify({
  status: 'PASS',
  current_state: progression.current_psychological_state,
  completed_movements: progression.completed_movements,
  next_recommended_movement: progression.next_recommended_movement,
  trajectory: trajectoryKeys,
}, null, 2));
