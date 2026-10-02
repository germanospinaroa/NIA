import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx',
  'app/descubre/entiende/page.tsx',
  'app/descubre/base/page.tsx',
  'app/descubre/nombre/page.tsx',
  'app/descubre/dia/page.tsx',
  'app/descubre/prueba/page.tsx',
  'app/descubre/explica/page.tsx',
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
for (const event of ['understand_viewed', 'name_submitted', 'demo_started', 'demo_situation_viewed', 'demo_response_selected', 'demo_intervention_viewed', 'demo_value_acknowledged', 'continuity_viewed', 'plan_viewed', 'access_started', 'email_submitted', 'magic_link_requested']) {
  assert.match(source, new RegExp(event), event + ' is tracked');
}
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.doesNotMatch(source, /Continuar a Hotmart|Oferta bloqueada|Hotmart todavía no está conectado/);
assert.doesNotMatch(source, /Sin pago real en esta fase de prueba/);
assert.doesNotMatch(source, /Ahora imagina que pudieras empezar a actuar diferente|NIA no debería hablarte como le habla a todo el mundo|NIA RESPONDE|Esto cambiaría según lo que acabas de decir|Y esto es solo el comienzo|Así sí|Más real|Otro enfoque/);
assert.match(source, /Gollwitzer &amp; Sheeran, 2006/);
assert.match(source, /39542743/);
assert.match(source, /Empiezo a dudar de mí\./);
assert.match(source, /Me dejo llevar por lo que me dicen\./);
assert.match(source, /Sigo con mi idea, pero me cuesta\./);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
assert.match(fs.readFileSync('app/auth/callback/route.ts', 'utf8'), /exchangeCodeForSession/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\.signInWithOtp/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\/callback\?next=\/onboarding/);
assert.match(source, /¿Te pasa que sabes cómo quieres actuar, pero cuando llega el momento te cuesta hacerlo\?/);
assert.match(source, /¿Y que a veces basta con que alguien piense diferente para empezar a dudar de lo que tú querías\?/);
assert.match(source, /¿Que terminas haciendo lo que la otra persona espera, aunque en el fondo querías otra cosa\?/);
assert.doesNotMatch(source, /la neurociencia demuestra|científicamente probada|transformación garantizada/);
const onboarding = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
for (const copy of ['Esto tiene una explicación.', 'Y ahí es donde entra NIA.', 'Antes de seguir, quiero conocerte un poquito.', 'Ahora quiero que lo vivas.', 'Imagina que hoy tienes algo muy claro.', 'Eso es NIA.', 'Y esto es apenas el comienzo.']) {
  assert.match(onboarding, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), copy + ' onboarding copy');
}
assert.match(onboarding, /\{name\}, gracias por estar aquí\./, 'dynamic name onboarding copy');
assert.match(onboarding, /16536643/);
assert.match(onboarding, /onboardingSituationChoice|demo_response_selected/);
assert.match(onboarding, /onboardingFollowupChoice|demo_completed/);
assert.match(onboarding, /Empiezo a dudar\./);
assert.match(onboarding, /Me mantengo en lo que decidí\./);
assert.match(onboarding, /Depende mucho de quién me lo diga\./);
assert.doesNotMatch(onboarding, /Así sí|Más real|Otro enfoque/);
assert.doesNotMatch(onboarding, /className="eyebrow"|className='eyebrow'/);
console.log('funnel tests: PASS');
