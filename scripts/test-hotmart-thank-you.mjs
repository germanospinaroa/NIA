import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('app/gracias/page.tsx', 'utf8');

assert.match(source, /status === 'pending' \|\| status === 'analysis'/);
assert.match(source, /title: 'Tu acceso a NIA está casi listo\.'/);
assert.match(source, /title: 'Estamos confirmando tu compra\.'/);
assert.match(source, /En cuanto Hotmart confirme el pago, podrás activar tu acceso a NIA\./);
assert.match(source, /No necesitas volver a comprar ni completar el proceso otra vez\./);
assert.match(source, /title: 'Tu compra está siendo verificada\.'/);
assert.match(source, /Cuando Hotmart termine la revisión, podrás activar tu acceso a NIA\./);
assert.match(source, /No necesitas realizar ninguna acción adicional por ahora\./);
assert.match(source, /action: 'Activar mi acceso'/);
assert.match(source, /action: 'Volver a NIA'/);
assert.match(source, /href: '\/acceso'/);
assert.match(source, /href: '\/'/);
assert.doesNotMatch(source, /createUser|createAdminClient|entitlement|supabase|transaction|email=/i);
assert.match(source, /pending: \{[\s\S]*?action: 'Volver a NIA',[\s\S]*?href: '\/'/);
assert.match(source, /analysis: \{[\s\S]*?action: 'Volver a NIA',[\s\S]*?href: '\/'/);
console.log('hotmart thank-you states: PASS');
