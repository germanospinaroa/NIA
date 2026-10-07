import assert from 'node:assert/strict';
import fs from 'node:fs';

const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');
const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const frame = fs.readFileSync('components/funnel/FunnelFrame.tsx', 'utf8');

assert.match(funnel, /discoverScreenIndex\?: number/);
assert.match(funnel, /function readFunnelState/);
assert.match(funnel, /JSON\.parse\(raw\)/);
assert.match(premium, /const stored = readFunnelState\(\)\.discoverScreenIndex/);
assert.match(premium, /stored >= 0 && stored < screens\.length/);
assert.match(premium, /saveFunnelState\(\{ discoverScreenIndex: nextIndex \}\)/);
assert.match(premium, /history\.pushState/);
assert.match(premium, /window\.addEventListener\('popstate'/);
assert.match(premium, /window\.history\.state\?\.niaDiscoverScreen/);
assert.match(premium, /window\.history\.replaceState/);
assert.doesNotMatch(premium, /window\.location.*preferredName/);
assert.match(premium, /href="\/"/);
assert.match(frame, /resetFunnelState/);
console.log('funnel navigation tests: PASS');
