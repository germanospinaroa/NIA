import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cancelHotmartSubscription, HotmartCancellationError } from '../lib/server/hotmart.ts';

const finalization = fs.readFileSync('lib/server/onboarding-finalization.ts', 'utf8');
const welcomeCron = fs.readFileSync('app/api/cron/welcome/route.ts', 'utf8');
const refill = fs.readFileSync('lib/server/refill-approved-buffer.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261008150000_restore_nia_delivery_crons.sql', 'utf8');
const cancelRoute = fs.readFileSync('app/api/subscription/cancel/route.ts', 'utf8');
const tuPage = fs.readFileSync('app/app/tu/page.tsx', 'utf8');

assert(finalization.indexOf('onboarding_completed: true') < finalization.indexOf('const welcome = await ensureActivationWelcome'));
assert.match(finalization, /first_buffer_prepare_failed/);
assert.match(finalization, /recoverIncompleteActivations/);
assert.match(welcomeCron, /recoverIncompleteActivations/);
assert.match(welcomeCron, /recovery/);
assert.match(refill, /ELIGIBLE_SUBSCRIPTION_STATUSES = \['active', 'trialing'\]/);
assert.match(migration, /nia-daily-whatsapp/);
assert.match(migration, /nia-buffer-refill/);
assert.match(migration, /vault\.decrypted_secrets/);
assert.match(migration, /cron\.unschedule/);
assert.doesNotMatch(tuPage, /window\.confirm/);
assert.match(tuPage, /¿Quieres cancelar tu suscripción\?/);
assert.match(tuPage, /Cancelando…/);
assert.match(cancelRoute, /provider_cancelled_local_sync_pending/);

const originalEnv = { ...process.env };
process.env.HOTMART_CLIENT_ID = 'client-id';
process.env.HOTMART_CLIENT_SECRET = 'client-secret';
process.env.HOTMART_BASIC = 'generated-basic';
const requests = [];
const response = async (url, init) => {
  requests.push({ url: String(url), init });
  if (String(url).startsWith('https://api-sec-vlc.hotmart.com/security/oauth/token')) return new Response(JSON.stringify({ access_token: 'test-token' }), { status: 200, headers: { 'content-type': 'application/json' } });
  return new Response(JSON.stringify({ status: 'INACTIVE', subscriber_code: 'sub/123' }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const result = await cancelHotmartSubscription('sub/123', response);
assert.equal(result.status, 'INACTIVE');
assert.match(requests[0].url, /client_id=client-id/);
assert.match(requests[0].url, /client_secret=client-secret/);
assert.equal(requests[0].init.headers.authorization, 'Basic generated-basic');
assert.equal(requests[1].url, 'https://developers.hotmart.com/payments/api/v1/subscriptions/sub%2F123/cancel');
assert.equal(requests[1].init.headers.authorization, 'Bearer test-token');
assert.equal(JSON.parse(requests[1].init.body).send_mail, false);

await assert.rejects(() => cancelHotmartSubscription('sub/123', async () => new Response(JSON.stringify({ error: 'invalid_client' }), { status: 401 })), error => error instanceof HotmartCancellationError && error.code === 'hotmart_auth_failed');
process.env = originalEnv;
console.log('production recovery/cancellation tests: PASS');
