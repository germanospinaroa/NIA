import assert from 'node:assert/strict';
import fs from 'node:fs';
import { addressName } from '../lib/funnel-personalization.ts';

assert.equal(addressName(' Andre  '), 'Andre');
assert.equal(addressName('María   José'), 'María José');
assert.equal(addressName('Ana-María'), 'Ana-María');
assert.equal(addressName(''), '');
assert.equal(addressName(null), '');
const source = fs.readFileSync(new URL('../components/funnel/PremiumDiscover.tsx', import.meta.url), 'utf8');
assert.match(source, /preferredNameConfirmed: true/);
assert.match(source, /discover_preferred_name_entered/);
assert.match(source, /placeholder="Juanita"/);
assert.doesNotMatch(source, /value="Juanita"/);
assert.match(source, /displayName \? .*imagina/);
assert.match(source, /Buenos días, \$\{name\}/);
assert.doesNotMatch(source, /Yo soy NIA|Antes de mostrártelo, quiero conocerte/);
console.log('funnel personalization tests: PASS');
