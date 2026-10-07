import assert from 'node:assert/strict';
import fs from 'node:fs';

const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const stage = fs.readFileSync('components/funnel/DiscoverStage.tsx', 'utf8');
const plans = fs.readFileSync('app/descubre/planes/page.tsx', 'utf8');
const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');

assert.match(premium, /useLayoutEffect/);
assert.match(premium, /screenRef\.current\?\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(premium, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(premium, /ref=\{screenRef\}/);
assert.match(stage, /useLayoutEffect/);
assert.match(stage, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(plans, /useLayoutEffect/);
assert.match(plans, /state\.preferredNameConfirmed === true/);
assert.match(funnel, /preferredNameConfirmed\?: boolean/);
assert.doesNotMatch(premium, /smooth/);
assert.doesNotMatch(plans, /smooth/);
console.log('funnel finishing tests: PASS');
