import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync('app/admin/qa-real-control.tsx', 'utf8');
const detail = fs.readFileSync('app/admin/users/[id]/page.tsx', 'utf8');

assert.ok(component.includes("fetch('/api/admin/qa/daily-intervention'"));
assert.ok(component.includes('JSON.stringify({ user_id: userId })'));
assert.ok(component.includes('if (running || result) return'));
assert.ok(component.includes('Esta prueba generará una intervención real'));
assert.ok(component.includes('Evolution accepted'));
assert.ok(component.includes('WhatsApp delivery'));
assert.ok(component.includes('Prueba de botones WhatsApp'));
assert.ok(component.includes("fetch('/api/admin/qa/whatsapp-buttons'"));
assert.ok(component.includes('No generará una intervención ni consumirá OpenAI'));
assert.ok(component.includes('if (buttonsRunning || buttonsResult) return'));
assert.ok(component.includes('Revisa tu WhatsApp. Los botones deberían aparecer en el mensaje.'));
assert.ok(detail.includes('QaRealControl'));
assert.ok(detail.includes('data.user.id'));

console.log('admin QA control tests: PASS');
