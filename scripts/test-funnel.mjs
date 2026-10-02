import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx', 'app/descubre/evidencia/page.tsx', 'app/descubre/presenta/page.tsx',
  'app/descubre/nombre/page.tsx', 'app/descubre/agradecimiento/page.tsx', 'app/descubre/vivir/page.tsx',
  'app/descubre/funciona/page.tsx', 'app/descubre/futuro/page.tsx', 'app/descubre/planes/page.tsx',
  'components/funnel/WhatsAppDemo.tsx', 'app/acceso/page.tsx', 'app/auth/callback/route.ts', 'app/onboarding/page.tsx',
];
for (const file of files) assert.ok(fs.existsSync(file), file + ' exists');
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const events = [
  'recognition_1_viewed',
  'recognition_1_completed', 'recognition_2_completed', 'recognition_3_completed', 'evidence_viewed', 'nia_introduced',
  'name_completed', 'demo_viewed', 'demo_whatsapp_viewed', 'how_it_works_viewed', 'future_experience_viewed',
  'plans_viewed', 'plan_selected', 'access_started', 'magic_link_requested', 'onboarding_started',
];
for (const event of events) assert.match(source, new RegExp(event), event + ' is tracked');
assert.match(source, /recognition_\$\{step \+ 1\}_continue/);
assert.match(source, /recognition_\$\{step \+ 2\}_viewed/);
for (const copy of [
  '¿Te ha pasado que estabas segura de una decisión y, después de escuchar a alguien, empezaste a dudar?',
  '¿Y luego te quedas pensando: «¿Será que de verdad estaba equivocada?»',
  '¿Y alguna vez terminas cambiando de idea, cediendo o haciendo algo distinto a lo que tú querías?',
  'HAY ALGO IMPORTANTE DETRÁS DE ESTO', 'No estás inventando lo que te pasa.',
  'Cuando alguien te aconseja sin escucharte', 'Querer algo no siempre basta',
  'Hola. Soy NIA.', 'Quiero conocerte un poco antes de seguir.', 'Gracias,',
  'Ahora sí', 'directamente por WhatsApp', 'Así funciona NIA.', '¿Y qué quiero que empiece a pasar contigo?',
  'Si esto es lo que quieres empezar a trabajar, NIA puede hacerlo contigo.', 'Empezar →',
]) assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), copy + ' copy');
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
assert.match(fs.readFileSync('app/auth/callback/route.ts', 'utf8'), /exchangeCodeForSession/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\.signInWithOtp/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /auth\/callback\?next=\/onboarding/);
assert.doesNotMatch(source, /Hotmart|Oferta bloqueada|Continuar a Hotmart|microseñal|¿Cómo te hablaría mejor\?|Así sí|Más real|Otro enfoque|NIA no debería hablarte/);
assert.doesNotMatch(source, /la ciencia demuestra que NIA funciona|científicamente probada|el 50% de las mujeres/);
console.log('funnel tests: PASS');
