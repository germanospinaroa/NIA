import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  materialContributionIsNovel,
  normalizedMessageHash,
  planDailyIntervention,
  projectedReceptionStage,
} from '../lib/recurrent-daily.ts';
import { applySemanticFidelity, writerV2Prompt } from '../lib/server/writer-v2.ts';

const context = 'Cuando tengo que tomar una decisión importante, suelo pedir varias opiniones aunque ya tenga una primera respuesta o criterio propio, porque me preocupa equivocarme.';
const goal = 'Confiar más en mis decisiones laborales.';
const mechanismId = 'external_validation';

const repeatedDay1 = 'Ya había una respuesta propia antes de empezar a consultar.';
const repeatedDay5 = 'Reconoce el momento en que empiezas a consultar porque antes ya había una respuesta propia.';
assert.equal(materialContributionIsNovel({ newContribution: repeatedDay5, expectedTakeaway: repeatedDay5 }, [{ newContribution: repeatedDay1, expectedTakeaway: repeatedDay1 }]), false, 'DAY1_DAY5_SEMANTIC_REPETITION must be rejected');
assert.equal(materialContributionIsNovel({ newContribution: 'Puedo distinguir información nueva de entregar la decisión.', expectedTakeaway: 'Una opinión puede aportar información sin decidir por mí.' }, [{ newContribution: repeatedDay1, expectedTakeaway: repeatedDay1 }]), true);

let delivered = [];
let prospective = [];
const plans = [];
for (let day = 1; day <= 5; day += 1) {
  const plan = planDailyIntervention({
    goal,
    context,
    confirmedEvidence: [context],
    mechanismId,
    history: delivered.map(item => ({ mechanismId, psychologicalMovementKey: item.canonicalMovement, movement: item.canonicalMovement, takeaway: item.expectedTakeaway, text: item.message })),
    exposures: delivered,
    plannedSignatures: prospective.map(item => item.interventionSignature),
    prospectiveLearning: prospective,
    intendedLocalDate: `2026-12-${String(day).padStart(2, '0')}`,
    projectedReceptionStage: projectedReceptionStage(delivered.length, prospective.length),
  }).selected;
  plans.push(plan);
  prospective.push({ bufferItemId: `clean-${day}`, intendedLocalDate: `2026-12-${String(day).padStart(2, '0')}`, canonicalMovement: plan.canonicalMovement, takeaway: plan.expectedTakeaway, message: `Fixture ${day}: ${plan.newContribution}`, interventionSignature: plan.interventionSignature, newContribution: plan.newContribution, expectedTakeaway: plan.expectedTakeaway, normalizedMessageHash: normalizedMessageHash(`Fixture ${day}: ${plan.newContribution}`) });
}

assert.equal(plans.length, 5);
assert.equal(plans.every(plan => typeof plan.newContribution === 'string' && plan.newContribution.trim()), true);
assert.equal(plans.every(plan => typeof plan.expectedTakeaway === 'string' && plan.expectedTakeaway.trim()), true);
assert.deepEqual(plans.map(plan => plan.projectedReceptionStage), ['tuning', 'tuning', 'building', 'building', 'building']);
assert.equal(new Set(plans.map(plan => plan.newContribution)).size, 5, 'clean horizon needs five distinct contributions');
assert.equal(new Set(plans.map(plan => plan.expectedTakeaway)).size, 5, 'clean horizon needs five distinct takeaways');
assert.equal(plans.some(plan => plan.canonicalMovement.endsWith(':review_outcome_without_self_punishment')), false);
assert.equal(plans.some(plan => /confirmed event|confirmed behavior|resultado confirmado/i.test(`${plan.newContribution} ${plan.expectedTakeaway}`)), false);

const writerInput = { newContribution: plans[0].newContribution, expectedTakeaway: plans[0].expectedTakeaway, psychologicalMove: plans[0].canonicalMovement, situation: context, desiredChange: goal, confirmedFacts: [context], recentMovements: [], communicationPreference: 'adaptive', safetyConstraints: [], receptionStage: 'tuning', psychologicalInterventionsDelivered: 0, timeOfDay: 'morning', receptionInstructions: [], previousDeliveredMovement: null, previousDeliveredTakeaway: null, previousDeliveredMessage: null, continuityGuidance: [], recentMessages: [] };
const writerPrompt = writerV2Prompt(writerInput);
assert.match(writerPrompt, /new_contribution/);
assert.match(writerPrompt, /expected_takeaway/);

const hardFailed = applySemanticFidelity({ approved: true, hardFailures: [], deterministicHardFailures: [], semanticFailures: [], warnings: [] }, {
  target_expressed: true,
  adjacent_drift: false,
  dominant_movement: plans[0].canonicalMovement,
  movement_value: true,
  new_contribution_expressed: false,
  same_actionable_teaching_as_prior: true,
  novel_contribution: false,
  semantic_redundancy: true,
  reason: 'same teaching',
});
assert.equal(hardFailed.approved, false);
assert.ok(hardFailed.hardFailures.includes('new_contribution_not_expressed'));
assert.ok(hardFailed.hardFailures.includes('same_actionable_teaching_as_prior'));
assert.ok(hardFailed.hardFailures.includes('no_novel_contribution'));
assert.ok(hardFailed.hardFailures.includes('semantic_redundancy'));

const refillSource = fs.readFileSync(new URL('../lib/server/refill-approved-buffer.ts', import.meta.url), 'utf8');
const judgeSource = fs.readFileSync(new URL('../lib/server/semantic-fidelity-judge.ts', import.meta.url), 'utf8');
const harnessSource = fs.readFileSync(new URL('./test-prospective-buffer-real.mjs', import.meta.url), 'utf8');
assert.match(refillSource, /newContribution: planned\.newContribution/);
assert.match(refillSource, /planned\.semanticAudit/);
assert.match(refillSource, /priorContributions/);
assert.match(judgeSource, /new_contribution_expressed/);
assert.match(judgeSource, /same_actionable_teaching_as_prior/);
assert.match(harnessSource, /QA_CLEAN_CONTENT_USER_ID/);
assert.match(harnessSource, /clean_content_fixture_required/);
assert.doesNotMatch(harnessSource, /QA_PROVIDER_USER_ID \|\|/);

console.log(JSON.stringify({ status: 'PASS', day1Day5SemanticRepetition: 'REJECTED', cleanFivePlans: plans.map(plan => ({ movement: plan.canonicalMovement, mode: plan.interventionMode, newContribution: plan.newContribution, expectedTakeaway: plan.expectedTakeaway, stage: plan.projectedReceptionStage })), semanticHardFailWiring: 'PASS', cleanFixtureGuard: 'PASS' }, null, 2));
