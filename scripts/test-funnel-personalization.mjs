import assert from 'node:assert/strict';
import fs from 'node:fs';
import { addressName } from '../lib/funnel-personalization.ts';

assert.equal(addressName(' Andre  '), 'Andre');
assert.equal(addressName('María   José'), 'María José');
assert.equal(addressName('Ana-María'), 'Ana-María');
assert.equal(addressName(''), '');
assert.equal(addressName(null), '');
const longName = 'Nombre Muy Largo Con Muchos Caracteres Para Revisar El Flujo';
assert.equal(addressName(longName), longName);

const source = fs.readFileSync(new URL('../components/funnel/PremiumDiscover.tsx', import.meta.url), 'utf8');
assert.match(source, /preferredNameConfirmed === true/);
assert.match(source, /preferredName: value, preferredNameConfirmed: true/);
assert.match(source, /discover_preferred_name_entered'\)/);
assert.doesNotMatch(source, /discover_preferred_name_entered',\s*\{/);
for (const copy of ['NIA te escribió a ti.', 'La conversación puede seguir siendo incómoda.', 'Esos momentos van a volver.', 'Porque la duda puede volver.', 'Lo que puede cambiar es quién decide cuando aparezca.', 'tu propio criterio.', 'Antes de mostrártelo, quiero conocerte.', 'se sienta tuyo', 'Yo soy NIA.']) assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(source, /placeholder="Juanita"/);
assert.doesNotMatch(source, /value="Juanita"/);
assert.doesNotMatch(source, /Buenos días, Juanita\.|Buenos días, Laura\./);
assert.doesNotMatch(source, /Y ahora imagina esto/);
console.log('funnel personalization tests: PASS');
