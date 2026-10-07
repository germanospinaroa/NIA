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
assert.match(source, /addressName\(readFunnelState\(\)\.preferredName\)/);
assert.match(source, /discover_preferred_name_entered'\)/);
assert.doesNotMatch(source, /discover_preferred_name_entered',\s*\{/);
for (const copy of ['NIA te escribió a ti.', 'La conversación puede seguir siendo incómoda.', 'Y ahora imagina esto…', 'Has llegado hasta aquí porque algo de todo esto te hizo sentido.', 'Yo soy NIA.']) assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.doesNotMatch(source, /Buenos días, Juanita\.|Buenos días, Laura\./);
console.log('funnel personalization tests: PASS');
