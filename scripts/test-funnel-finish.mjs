import assert from 'node:assert/strict';
import fs from 'node:fs';

const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const stage = fs.readFileSync('components/funnel/DiscoverStage.tsx', 'utf8');
const plans = fs.readFileSync('app/descubre/planes/page.tsx', 'utf8');
const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');
const styles = fs.readFileSync('app/globals.css', 'utf8');

assert.match(premium, /useLayoutEffect/);
assert.match(premium, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.doesNotMatch(premium, /screenRef|ref=\{screenRef\}/);
assert.match(stage, /useLayoutEffect/);
assert.match(stage, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(plans, /useLayoutEffect/);
assert.match(plans, /state\.preferredNameConfirmed === true/);
assert.match(funnel, /preferredNameConfirmed\?: boolean/);
assert.doesNotMatch(premium, /smooth/);
assert.doesNotMatch(plans, /smooth/);

assert.match(styles, /\.premium-funnel[^\{]*\{[^}]*overflow-x:\s*clip;[^}]*overflow-y:\s*visible;/s);
assert.match(styles, /\.premium-screen\s*\{[^}]*min-height:\s*100dvh;[^}]*padding:/s);
assert.doesNotMatch(styles, /\.premium-screen\s*\{[^}]*overflow(?:-[xy])?\s*:/s);
assert.doesNotMatch(styles, /\.premium-screen-(?:4|6|7|8|9)[^\{]*\{[^}]*overflow-y\s*:\s*(?:auto|scroll)/s);
assert.doesNotMatch(styles, /\.nia-continuity-frame \.plans-screen[^\{]*\{[^}]*overflow-y\s*:\s*(?:auto|scroll)/s);
assert.match(styles, /\.premium-action\s*\{[^}]*position:\s*fixed;/s);
assert.match(styles, /\.premium-screen\s*\{[^}]*padding:[^;]*150px/s);
console.log('premium natural-scroll CSS regression: PASS');
console.log('funnel finishing tests: PASS');
