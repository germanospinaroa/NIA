import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'app/descubre/page.tsx', 'components/funnel/PremiumDiscover.tsx', 'app/descubre/evidencia/page.tsx', 'app/descubre/presenta/page.tsx',
  'app/descubre/nombre/page.tsx', 'app/descubre/agradecimiento/page.tsx', 'app/descubre/vivir/page.tsx',
  'app/descubre/funciona/page.tsx', 'app/descubre/futuro/page.tsx', 'app/descubre/planes/page.tsx',
  'components/funnel/WhatsAppDemo.tsx', 'app/acceso/page.tsx', 'app/auth/callback/route.ts', 'app/onboarding/page.tsx',
];
for (const file of files) assert.ok(fs.existsSync(file), file + ' exists');
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const events = [
  'discover_started', 'premium_funnel_started', 'discover_screen_viewed', 'discover_screen_completed', 'premium_funnel_completed', 'access_code_requested',
  'name_completed', 'demo_viewed', 'demo_whatsapp_viewed', 'how_it_works_viewed', 'future_experience_viewed',
  'plans_viewed', 'plan_selected', 'access_started', 'access_code_verified', 'onboarding_started',
];
for (const event of events) assert.match(source, new RegExp(event), event + ' is tracked');
assert.match(source, /useState\(0\)/);
assert.match(source, /router\.push\('\/descubre\/planes'\)/);
for (const copy of [
  '¿Cuántas veces más vas a saber lo que quieres…', 'y terminar haciendo otra cosa?',
  '¿Y si eso se pudiera entrenar?', 'No. No te pasa solo a ti.',
  'Esa fue exactamente la pregunta que nos hicimos.', 'Te presentamos a NIA.',
  'Imagina que mañana tienes una conversación que llevas días evitando.',
  'Antes de seguir, quiero conocerte.', '¿Cómo quieres que te llame?', 'Tu nombre o como te gusta que te llamen', 'Muéstrame cómo se sentiría', 'Tal vez la conversación siga siendo incómoda.',
  'Pero tú ya no llegas igual.', 'una distinción.', 'un criterio.', 'una pregunta.', 'una forma diferente de responder.',
  'Imagina dentro de unos meses…', 'Quiero vivir NIA',
]) assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), copy + ' copy');
assert.equal((source.match(/const screens: Screen\[\] = \[/)?.length ?? 0), 1);
assert.equal((source.match(/cta: 'Quiero seguir'/g) ?? []).length, 1);
const premiumSource = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
assert.match(premiumSource, /preferredName/);
assert.doesNotMatch(premiumSource, /Buenos días, Juanita\./);
assert.doesNotMatch(premiumSource, /Buenos días, Laura\.|poco a poco|Y eso fue solo un día\./);
assert.equal((premiumSource.match(/Porque cambiar no ocurre por entender algo una vez\./g) ?? []).length, 1);
for (const fact of ['+40.000 participantes', '14.321', 'American Economic Review · 2024']) assert.match(premiumSource, new RegExp(fact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.doesNotMatch(premiumSource, /Esto es NIA\./);
assert.match(premiumSource, /premium-evidence-layout/);
assert.match(premiumSource, /premium-evidence-artifact/);
assert.match(fs.readFileSync('app/activate/page.tsx', 'utf8'), /Tu contraseña debe tener al menos 8 caracteres\./);
assert.match(source, /US\$6\.99/);
assert.match(source, /US\$39\.99/);
assert.match(fs.readFileSync('lib/funnel.ts', 'utf8'), /checkoutMode.*bypass/);
assert.doesNotMatch(fs.readFileSync('app/auth/callback/route.ts', 'utf8'), /exchangeCodeForSession/);
assert.match(fs.readFileSync('app/acceso/page.tsx', 'utf8'), /verifyOtp/);
assert.match(fs.readFileSync('app/api/auth/access/request/route.ts', 'utf8'), /shouldCreateUser: false/);
assert.doesNotMatch(source, /Hotmart|Oferta bloqueada|Continuar a Hotmart|microseñal|¿Cómo te hablaría mejor\?|Así sí|Más real|Otro enfoque|NIA no debería hablarte/);
assert.doesNotMatch(source, /la ciencia demuestra que NIA funciona|científicamente probada|el 50% de las mujeres/);
console.log('funnel tests: PASS');
