import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync(new URL('../app/app/page.tsx', import.meta.url), 'utf8');
const login = fs.readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const activate = fs.readFileSync(new URL('../app/activate/page.tsx', import.meta.url), 'utf8');
const tu = fs.readFileSync(new URL('../app/app/tu/page.tsx', import.meta.url), 'utf8');

assert.doesNotMatch(home, /Último mensaje disponible/);
assert.doesNotMatch(home, /title="Hoy"/);
assert.match(home, /formatNextMessageSentence/);
assert.match(login, /signInWithPassword/);
assert.doesNotMatch(login, /signInWithOtp/);
assert.match(activate, /Continuar/);
assert.match(tu, /Tu plan/);
assert.match(tu, /next_billing_at/);
assert.match(tu, /cancel_requested_at/);
console.log('app UI tests: PASS');
