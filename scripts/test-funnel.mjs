import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx',
  'app/descubre/entiende/page.tsx',
  'app/descubre/prueba/page.tsx',
  'app/descubre/planes/page.tsx',
  'app/acceso/page.tsx',
  'app/onboarding/page.tsx',
  'app/paywall/page.tsx',
];
for (const file of files) assert.ok(fs.existsSync(file), file + ' exists');
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\\n');
for (const event of ['recognition_1_completed', 'recognition_2_completed', 'recognition_3_completed', 'microdemo_feedback', 'pricing_viewed', 'plan_selected', 'checkout_bypass_started', 'onboarding_completed']) {
  assert.match(source, new RegExp(event), event + ' is tracked');
}
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.doesNotMatch(source, /Continuar a Hotmart|Oferta bloqueada|Hotmart todavía no está conectado/);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
console.log('funnel tests: PASS');
