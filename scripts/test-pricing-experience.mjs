import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('app/descubre/planes/page.tsx', 'utf8');
const helper = fs.readFileSync('lib/funnel-personalization.ts', 'utf8');

assert.match(source, /readFunnelState\(\)/);
assert.match(source, /state\.preferredNameConfirmed === true \? addressName\(state\.preferredName\) : ''/);
assert.match(source, /preferredName \? /);
assert.match(source, /tengo una buena noticia/);
assert.match(source, /Ya no tienes que imaginar cómo se sentiría\./);
assert.match(source, /tus propios temas, tus propios momentos y mensajes pensados para ti/);
assert.match(source, /Tus primeros 7 días son gratis\./);
assert.match(source, /Después, tú decides si quieres continuar\./);
assert.match(source, /La opción para quedarte con NIA/);
assert.match(source, /Más flexibilidad/);
assert.match(source, /US\$39\.99/);
assert.match(source, /US\$6\.99/);
assert.match(source, /No se te cobrará nada durante los primeros 7 días\. Puedes cancelar antes de que termine la prueba\./);
assert.match(source, /Empezar mis 7 días con NIA →/);
assert.match(source, /router\.push\('\/acceso'\)/);
assert.match(source, /trackFunnel\('checkout_bypass_started', \{ plan, checkoutMode \}\)/);
assert.doesNotMatch(source, /7 días gratis\. Después, cancelas cuando quieras\./);
assert.doesNotMatch(source, /trackFunnel\([^)]*preferredName/);
assert.match(helper, /replace\(\/\\s\+\/g, ' '\)/);
console.log('pricing experience tests: PASS');
