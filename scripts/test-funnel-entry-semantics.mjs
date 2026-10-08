import assert from 'node:assert/strict';
import fs from 'node:fs';

const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');
const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const frame = fs.readFileSync('components/funnel/FunnelFrame.tsx', 'utf8');
const attribution = fs.readFileSync('lib/marketing-attribution.ts', 'utf8');

assert.match(funnel, /sessionStorage\.setItem\(KEY, next\)/, 'current funnel state stays session-scoped');
assert.match(funnel, /delete durable\.discoverScreenIndex/, 'discover index is omitted from localStorage');
assert.match(funnel, /if \(!Object\.prototype\.hasOwnProperty\.call\(sessionState, 'discoverScreenIndex'\)\) delete state\.discoverScreenIndex/);
assert.match(funnel, /export function resetDiscoverProgress/);
assert.match(premium, /type === 'reload' \? historyIndex \?\? storedIndex \?\? 0/);
assert.match(premium, /type === 'back_forward' \? historyIndex \?\? 0 : 0/);
assert.match(premium, /history\.pushState/);
assert.match(premium, /addEventListener\('popstate'/);
assert.match(premium, /onClick=\{resetDiscoverProgress\}/);
assert.match(frame, /onClick=\{resetDiscoverProgress\}/);
for (const key of ['utm_source', 'utm_campaign', 'fbclid']) assert.match(attribution, new RegExp(`['"]${key}['"]`));
assert.doesNotMatch(premium, /localStorage/);
console.log('funnel entry semantics tests: PASS');
