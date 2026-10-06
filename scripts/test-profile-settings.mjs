import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/profile/route.ts', 'utf8');
const page = fs.readFileSync('app/app/tu/page.tsx', 'utf8');

assert.match(route, /\.from\('profiles'\)\.update\(values\)\.eq\('id', user\.id\)/);
assert.doesNotMatch(route, /\.from\('profiles'\)\.upsert\(/);
assert.match(route, /\[profile PATCH\] update failed/);

const payload = JSON.stringify({ message_frequency: 1, message_time_1: '08:00', message_time_2: null, timezone: 'America/Bogota' });
assert.match(payload, /message_frequency/);
assert.match(payload, /message_time_1/);
assert.match(payload, /message_time_2/);
assert.match(payload, /timezone/);
assert.doesNotMatch(page, /2 veces al día|Segunda hora/);
assert.match(page, /message_frequency: 1/);
assert.match(page, /message_time_2: null/);

assert.match(page, /setSavedDraft\(/);
assert.match(page, /finally \{ setSaving\(false\); \}/);
assert.match(page, /No pudimos guardar tus cambios/);
assert.match(page, /Tienes cambios sin guardar/);
console.log('profile settings tests: PASS');
