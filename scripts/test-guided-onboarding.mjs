import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CONTEXT_OPTIONS,
  DESIRED_CHANGE_DIRECTION_KEYS,
  DESIRED_CHANGE_OPTIONS,
  SUPPORT_OPTIONS,
  buildContextOriginal,
  buildContextSummary,
  optionLabel,
} from '../lib/onboarding-choices.ts';
import { isInvalidPreferredName, safePreferredName } from '../lib/profile-name.ts';

const page = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const profileRoute = fs.readFileSync('app/api/profile/route.ts', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');

assert.equal(DESIRED_CHANGE_OPTIONS.length, 8);
assert.equal(CONTEXT_OPTIONS.length, 8);
assert.equal(SUPPORT_OPTIONS.length, 8);
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.trust_decisions, 'trust_own_judgment');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.less_approval, 'less_validation');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.less_overthinking, 'custom');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.boundaries_less_guilt, 'hold_boundaries');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.say_what_i_think, 'say_what_i_mean');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.act_without_total_certainty, 'act_with_doubt');
assert.equal(DESIRED_CHANGE_DIRECTION_KEYS.less_external_opinion, 'less_external_opinions');
assert.equal(optionLabel(CONTEXT_OPTIONS, 'disagreement'), 'Cuando alguien no está de acuerdo conmigo');
assert.equal(buildContextOriginal(['Cuando alguien no está de acuerdo conmigo', 'Antes de una conversación incómoda'], 'Cuando siento que puedo decepcionar a alguien'), 'Cuando alguien no está de acuerdo conmigo. Antes de una conversación incómoda. Cuando siento que puedo decepcionar a alguien.');
assert.equal(buildContextSummary(['A', 'B'], 'C'), 'A · B · C');

for (const value of ['NIA', 'nia', 'Nia', ' NIA ']) {
  assert.equal(isInvalidPreferredName(value), true);
  assert.equal(safePreferredName(value), '');
}
assert.equal(safePreferredName(' María José '), 'María José');

assert.match(page, /preferredNameConfirmed === true/);
assert.match(page, /safePreferredName\(profile\.preferred_name\)/);
assert.doesNotMatch(page, /funnel\.preferredName \|\| funnel\.firstName/);
assert.match(page, /setPreferredNameKnown\(Boolean\(nextPreferred\)\)/);
assert.match(page, /learning_profile: nextLearningProfile/);
assert.match(page, /maxLength=\{300\}/);
assert.match(page, /const atLimit = max > 1 && selected\.length >= max && !isSelected;/);
assert.match(page, /max=\{1\}/);
assert.match(page, /setDesiredChoice\(next\)/);
assert.match(page, /selected\.length >= max/);
const isDisabledAtLimit = (max, selectedCount, isSelected) => max > 1 && selectedCount >= max && !isSelected;
assert.equal(isDisabledAtLimit(1, 1, false), false, 'single-select alternatives stay tappable');
assert.equal(isDisabledAtLimit(4, 4, false), true, 'context cap remains enforced');
assert.equal(isDisabledAtLimit(2, 2, false), true, 'support cap remains enforced');
assert.equal(isDisabledAtLimit(4, 4, true), false, 'selected multi-select choices remain deselectable');
assert.match(page, /discover_with_me/);
assert.match(page, /status: 'skipped'/);
assert.match(page, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.doesNotMatch(page, /<textarea/);
assert.doesNotMatch(page, /placeholder="NIA"/);
assert.doesNotMatch(page, /value="NIA"/);
assert.match(profileRoute, /const displayText = validCustomIntention\(text\) \? text : intentionLabel\(key\)/);
assert.match(css, /\.onboarding-choice\.is-selected/);
assert.match(css, /\.onboarding-choice\.is-limit-disabled/);

console.log('guided onboarding tests: PASS');
