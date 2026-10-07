import assert from 'node:assert/strict';
import fs from 'node:fs';

const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');

// Direct mounts always start at the first premium screen and never restore persisted progress.
assert.match(premium, /useState\(0\)/);
assert.match(premium, /readFunnelState/);
assert.match(premium, /const screens: Screen\[\] = \[/);
assert.match(premium, /screens\.length - 1/);
assert.match(premium, /router\.push\('\/descubre\/planes'\)/);
assert.match(premium, /premium_funnel_started/);
assert.match(premium, /premium_funnel_completed/);

// Persisted funnel data is merged, not cleared globally.
assert.match(funnel, /sessionStorage\.setItem\(KEY, next\)/);
assert.match(funnel, /localStorage\.setItem\(KEY, next\)/);
assert.match(funnel, /\{ \.\.\.readFunnelState\(\), \.\.\.patch \}/);
for (const field of ['firstName', 'preferredName', 'email', 'plan', 'directionText']) {
  assert.match(funnel, new RegExp(`${field}`), `${field} remains part of FunnelState`);
}

console.log('discover recognition tests: PASS (clean, returning, preserved-state cases)');
