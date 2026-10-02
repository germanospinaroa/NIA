import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx',
  'app/descubre/entiende/page.tsx',
  'app/descubre/nombre/page.tsx',
  'app/descubre/dia/page.tsx',
  'app/descubre/prueba/page.tsx',
  'app/descubre/continuidad/page.tsx',
  'app/descubre/planes/page.tsx',
  'app/acceso/page.tsx',
  'app/auth/callback/route.ts',
  'app/onboarding/page.tsx',
  'app/paywall/page.tsx',
];
for (const file of files) assert.ok(fs.existsSync(file), file + ' exists');
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\\n');
for (const event of ['recognition_1_completed', 'recognition_2_completed', 'recognition_3_completed', 'understand_nia_opened', 'microdemo_started', 'microdemo_feedback', 'microdemo_adapted', 'pricing_viewed', 'plan_selected', 'checkout_bypass_started', 'account_started', 'onboarding_started', 'onboarding_completed']) {
  assert.match(source, new RegExp(event), event + ' is tracked');
}
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.doesNotMatch(source, /Continuar a Hotmart|Oferta bloqueada|Hotmart todavía no está conectado/);
assert.doesNotMatch(source, /Sin pago real en esta fase de prueba/);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
assert.match(fs.readFileSync('app/auth/callback/route.ts', 'utf8'), /exchangeCodeForSession/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\.signInWithOtp/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\/callback\?next=\/onboarding/);
assert.match(source, /¿Te pasa que sabes cómo quieres actuar, pero cuando llega el momento te cuesta hacerlo\?/);
assert.match(source, /¿Y que a veces basta con que alguien piense diferente para empezar a dudar de lo que tú querías\?/);
assert.match(source, /¿Que terminas haciendo lo que la otra persona espera, aunque en el fondo querías otra cosa\?/);
assert.doesNotMatch(source, /la neurociencia demuestra|científicamente probada|transformación garantizada/);
console.log('funnel tests: PASS');
