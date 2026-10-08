import assert from 'node:assert/strict';
import fs from 'node:fs';

const feedback = fs.readFileSync('app/api/subscription/cancellation-feedback/route.ts', 'utf8');
const cancelRoute = fs.readFileSync('app/api/subscription/cancel/route.ts', 'utf8');
const page = fs.readFileSync('app/app/tu/page.tsx', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261008190000_subscription_cancellation_feedback.sql', 'utf8');
const contract = fs.readFileSync('lib/cancellation-feedback.ts', 'utf8');

assert.match(page, /¿Quieres cancelar tu suscripción\?/);
assert.match(page, /Antes de cancelar, cuéntanos qué pasó/);
assert.match(page, /Confirma tu cancelación/);
assert.match(page, /Tu suscripción quedó cancelada/);
assert.match(page, /Prefiero no responder/);
assert.match(page, /window\.crypto\.randomUUID/);
assert.doesNotMatch(page, /window\.confirm/);
assert.match(page, /api\/subscription\/cancellation-feedback/);
assert.match(page, /api\/subscription\/cancel/);
assert.match(feedback, /auth\.getUser/);
assert.match(feedback, /user\.id/);
assert.doesNotMatch(feedback, /body\.user_id|body\.subscription_id/);
assert.match(feedback, /invalid_reason_code/);
assert.match(contract, /CANCELLATION_FEEDBACK_MAX_LENGTH = 2000/);
assert.match(cancelRoute, /feedback_id/);
assert.match(cancelRoute, /eq\('user_id', user\.id\)/);
assert.match(cancelRoute, /cancellation_requested_at/);
assert.match(cancelRoute, /cancellation_confirmed_at/);
assert.match(cancelRoute, /cancellation_failed_at/);
assert.match(cancelRoute, /provider_cancelled_local_sync_pending/);
assert.match(migration, /enable row level security/);
assert.match(migration, /unique \(user_id, cancellation_attempt_id\)/);
assert.match(contract, /prefer_not_to_say/);

console.log('cancellation flow static contract tests: PASS');
