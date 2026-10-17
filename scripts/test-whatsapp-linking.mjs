import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseEvolutionMessage } from '../lib/server/whatsapp.ts';

const webhook = fs.readFileSync(new URL('../app/api/whatsapp/webhook/route.ts', import.meta.url), 'utf8');
const linkRoute = fs.readFileSync(new URL('../app/api/whatsapp/link/route.ts', import.meta.url), 'utf8');
const connectionRoute = fs.readFileSync(new URL('../app/api/whatsapp/connection/route.ts', import.meta.url), 'utf8');
const panel = fs.readFileSync(new URL('../components/app/WhatsAppConnectionPanel.tsx', import.meta.url), 'utf8');

// A/B/C/D: a valid sender is the identity, regardless of any previously typed number.
const sender = parseEvolutionMessage({ data: { key: { remoteJid: '573001234567@s.whatsapp.net', fromMe: false }, message: { conversation: 'Código NIA-ABCD' } } });
assert.equal(sender.from, '573001234567');
assert.equal(sender.jidType, 'phone');
const mexico = parseEvolutionMessage({ data: { key: { remoteJid: '5215512345678@s.whatsapp.net', fromMe: false }, message: { conversation: 'Código NIA-EFGH' } } });
assert.equal(mexico.from, '5215512345678');
assert.equal(mexico.jidType, 'phone');
assert.doesNotMatch(webhook, /whatsapp_link_phone_mismatch|normalizedFrom\s*!==|token\.expected_phone/);
assert.doesNotMatch(linkRoute, /isValidPhoneNumber|expectedPhone/);
assert.match(linkRoute, /expected_phone: null/);

// E: Evolution LID payloads use remoteJidAlt when it is the phone JID.
const lid = parseEvolutionMessage({ data: { key: { remoteJid: '1234567890@lid', remoteJidAlt: '5215512345678@s.whatsapp.net', fromMe: false }, message: { conversation: 'Código NIA-IJKL' } } });
assert.equal(lid.from, '5215512345678');
assert.equal(lid.jidType, 'phone');
assert.equal(lid.remoteJidAlt, '5215512345678@s.whatsapp.net');
const unresolved = parseEvolutionMessage({ data: { key: { remoteJid: '1234567890@lid', fromMe: false }, message: { conversation: 'Código NIA-MNOP' } } });
assert.equal(unresolved.from, '');
assert.equal(unresolved.jidType, 'lid');
assert.match(webhook, /whatsapp_link_sender_unresolvable/);

// F/G/H: token lookup requires a valid pending, unexpired token and consumes it once.
assert.match(webhook, /token\.status !== 'pending'/);
assert.match(webhook, /new Date\(token\.expires_at\)\.getTime\(\) < Date\.now\(\)/);
assert.match(webhook, /\.eq\('status', 'pending'\)/);
assert.match(webhook, /whatsapp_link_code_received/);

// I/J: conflicts remain rejected and replace succeeds only after the used token.
assert.match(webhook, /whatsapp_link_conflict/);
assert.match(webhook, /rejection_reason: 'already_connected'/);
assert.match(connectionRoute, /attempt\.purpose === 'replace'/);
assert.match(connectionRoute, /attempt\.status === 'used' && data\?\.status === 'connected'/);
assert.match(panel, /body: JSON\.stringify\(\{ mode: linkMode \}\)/);
assert.doesNotMatch(panel, /expected_phone|confirmedPhone|nationalPhone|phoneCountry/);

console.log('whatsapp sender-of-truth linking tests: PASS');
