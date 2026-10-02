import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx', 'app/descubre/entiende/page.tsx', 'app/descubre/presenta/page.tsx',
  'app/descubre/nombre/page.tsx', 'app/descubre/razon/page.tsx', 'app/descubre/evidencia/page.tsx',
  'app/descubre/vivir/page.tsx', 'app/descubre/contexto/page.tsx', 'app/descubre/situacion/page.tsx',
  'app/descubre/respuesta/page.tsx', 'app/descubre/feedback/page.tsx', 'app/descubre/adaptacion/page.tsx',
  'app/descubre/explica/page.tsx', 'app/descubre/futuro/page.tsx', 'app/descubre/continuidad/page.tsx',
  'app/descubre/planes/page.tsx', 'app/acceso/page.tsx', 'app/auth/callback/route.ts', 'app/onboarding/page.tsx',
];
for (const file of files) assert.ok(fs.existsSync(file), file + ' exists');
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const events = [
  'recognition_1_viewed',
  'understand_viewed', 'name_submitted', 'evidence_viewed', 'context_selected', 'demo_viewed', 'demo_feedback', 'demo_adaptation_viewed',
  'future_experience_viewed', 'plan_viewed', 'plan_selected', 'email_submitted', 'magic_link_sent', 'onboarding_started', 'intention_submitted',
  'timing_selected', 'first_intervention_received', 'first_intervention_feedback',
];
for (const event of events) assert.match(source, new RegExp(event), event + ' is tracked');
assert.match(source, /recognition_\$\{step \+ 1\}_continue/);
assert.match(source, /recognition_\$\{step \+ 2\}_viewed/);
for (const copy of [
  '¿Te ha pasado que sabes lo que quieres… pero cuando llega el momento terminas cediendo, callándote o buscando otra opinión?',
  'Hola. Soy NIA.', 'Y esto no nos lo estamos inventando.', 'Para enseñártelo bien, dime dónde te gustaría probarlo primero.',
  '¿Esto te habría ayudado en ese momento?', 'Sí, esto me sirve.', 'Quiero otra forma de verlo.', 'No, esto no me representa.',
  '¿Ves lo que acaba de pasar?', 'Ahora imagina tener esto contigo de verdad.', 'Ahora sí, vamos a hacerlo tuyo.',
  '¿Qué te gustaría hacer diferente cuando vuelva a aparecer ese momento?', '¿Cuándo te vendría mejor recibir tu momento con NIA?',
]) assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), copy + ' copy');
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
assert.match(fs.readFileSync('app/auth/callback/route.ts', 'utf8'), /exchangeCodeForSession/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\.signInWithOtp/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\/callback\?next=\/onboarding/);
assert.doesNotMatch(source, /Hotmart|Oferta bloqueada|Continuar a Hotmart|microseñal|¿Cómo te hablaría mejor\?|Así sí|Más real|Otro enfoque/);
assert.doesNotMatch(source, /la ciencia demuestra que NIA funciona|científicamente probada|el 50% de las mujeres/);
console.log('funnel tests: PASS');
