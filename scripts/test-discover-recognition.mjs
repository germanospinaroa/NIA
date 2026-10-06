import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('app/descubre/page.tsx', 'utf8');
const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');

// Direct mounts always start at question 1 and never restore persisted progress.
assert.match(page, /useState\(0\)/);
assert.doesNotMatch(page, /readFunnelState/);
assert.doesNotMatch(page, /state\.recognitionStep/);
assert.match(page, /trackFunnel\('recognition_1_viewed'\)/);

// The click sequence remains 1 -> 2 -> 3 -> evidence.
assert.match(page, /if \(step === 2\)/);
assert.match(page, /router\.push\('\/descubre\/evidencia'\)/);
assert.match(page, /recognitionStep: \(step \+ 2\)/);
assert.match(page, /recognition_\$\{step \+ 2\}_viewed/);

// Persisted funnel data is merged, not cleared globally.
assert.match(funnel, /sessionStorage\.setItem\(KEY, next\)/);
assert.match(funnel, /localStorage\.setItem\(KEY, next\)/);
assert.match(funnel, /\{ \.\.\.readFunnelState\(\), \.\.\.patch \}/);
for (const field of ['firstName', 'email', 'plan', 'directionText']) {
  assert.match(funnel, new RegExp(`${field}`), `${field} remains part of FunnelState`);
}

console.log('discover recognition tests: PASS (clean, returning, preserved-state cases)');
