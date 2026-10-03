import assert from 'node:assert/strict';
import { createLinkCode, extractLinkCode, hashLinkCode, maskPhone, whatsappDeepLink } from '../lib/server/whatsapp.ts';

const first = createLinkCode();
const second = createLinkCode();
assert.match(first, /^NIA-[A-F0-9]{6}$/);
assert.match(second, /^NIA-[A-F0-9]{6}$/);
assert.notEqual(first, second);
assert.equal(hashLinkCode(first), hashLinkCode(first.toLowerCase()));
assert.equal(extractLinkCode(`Hola NIA. Código: ${first}`), first);
assert.equal(extractLinkCode('Hola sin código'), null);
assert.equal(maskPhone('573001231234'), '+57 •••••••234');
const previous = process.env.WHATSAPP_BUSINESS_NUMBER;
process.env.WHATSAPP_BUSINESS_NUMBER = '573001231234';
assert.match(whatsappDeepLink(first), /^https:\/\/wa\.me\/573001231234\?text=/);
if (previous === undefined) delete process.env.WHATSAPP_BUSINESS_NUMBER; else process.env.WHATSAPP_BUSINESS_NUMBER = previous;
console.log('whatsapp contract tests: PASS');
