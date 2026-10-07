import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const settingsPage = fs.readFileSync('app/app/tu/page.tsx', 'utf8');
const middleware = fs.readFileSync('middleware.ts', 'utf8');
const calibration = fs.readFileSync('app/api/calibration/route.ts', 'utf8');

assert.match(page, /stage === 'identity'/);
assert.match(page, /last_name/);
assert.match(page, /preferred_name/);
assert.match(page, /¿Cómo quieres que te llame\?/);
assert.doesNotMatch(page, /¿Cómo quieres que NIA te llame\?/);
assert.doesNotMatch(page, /<textarea/);
assert.doesNotMatch(page, /Quiero confiar más en mi criterio/);
assert.doesNotMatch(page, /Estoy dudando de mí/);
assert.match(page, /stage === 'context'/);
assert.match(page, /stage === 'desired_change'/);
assert.match(page, /PROFILE_SAVE_ERROR/);
assert.match(page, /stage === 'whatsapp'/);
assert.doesNotMatch(page, /stage === 'ready'/);
assert.match(page, /showTest=\{false\}/);
assert.match(page, /message_frequency: 1/);
assert.match(page, /message_time_2: null/);
assert.match(page, /useState\('08:00'\)/);
assert.doesNotMatch(page, /first_intervention/);
assert.doesNotMatch(page, /firstInterventionContent/);
assert.match(middleware, /supabaseResponse = NextResponse\.next\(\{ request \}\)/);
assert.match(middleware, /return supabaseResponse/);
assert.match(calibration, /export async function GET/);
assert.match(calibration, /export async function POST/);
assert.match(calibration, /success: true/);
assert.match(calibration, /calibration_persistence_unconfirmed/);
assert.match(calibration, /relevant_situations/);
assert.match(settingsPage, /cache: 'no-store'/);
assert.match(settingsPage, /message_frequency: 1/);
assert.match(settingsPage, /message_time_2: null/);

const baseUrl = process.env.NIA_TEST_BASE_URL;
const statePath = process.env.NIA_TEST_STORAGE_STATE;
if (!baseUrl || !statePath) {
  console.log('onboarding auth contract: PASS (authenticated run skipped; set NIA_TEST_BASE_URL and NIA_TEST_STORAGE_STATE for E2E)');
  process.exit(0);
}

assert.notEqual(new URL(baseUrl).hostname, 'nia.gritlab.pro', 'controlled auth test must not target production');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const cookies = (state.cookies ?? []).filter(cookie => cookie.domain === new URL(baseUrl).hostname || cookie.domain === `.${new URL(baseUrl).hostname}`);
assert.ok(cookies.length > 0, 'storage state must contain authenticated cookies');
const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
const headers = { cookie: cookieHeader, 'content-type': 'application/json' };

const onboarding = await fetch(`${baseUrl}/onboarding`, { headers });
assert.equal(onboarding.status, 200, 'authenticated onboarding must load');
const profile = await fetch(`${baseUrl}/api/profile`, { headers });
assert.equal(profile.status, 200, 'authenticated profile must load');
const profileBody = await profile.json();
const existing = profileBody.profile ?? {};
const payload = {
  first_name: existing.first_name || process.env.NIA_TEST_FIRST_NAME || 'Test User',
  direction_key: existing.direction_key || 'trust_own_judgment',
  direction_text: existing.direction_text || 'Quiero practicar una decisión concreta.',
  desired_change_original: existing.desired_change_original || 'Quiero practicar una decisión concreta.',
  current_context_original: existing.current_context_original || 'Cuando alguien cuestiona lo que decidí.',
  current_context_status: 'active',
  message_time_1: '08:00',
  timezone: 'UTC',
  voice_style: existing.voice_style || 'grounded',
  message_frequency: 1,
};
const saved = await fetch(`${baseUrl}/api/profile`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
assert.equal(saved.status, 200, 'authenticated profile PATCH must persist');
const refresh = await fetch(`${baseUrl}/onboarding`, { headers });
assert.equal(refresh.status, 200, 'refresh must keep authenticated onboarding available');
console.log('onboarding auth E2E: PASS');
