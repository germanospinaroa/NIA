import assert from 'node:assert/strict';
import fs from 'node:fs';
import { passwordRequirementSatisfied } from '../lib/activation-state.ts';

const page = fs.readFileSync('app/activate/page.tsx', 'utf8');
const route = fs.readFileSync('app/api/activation/complete/route.ts', 'utf8');

// A: first activation proceeds after a successful password update.
assert.equal(passwordRequirementSatisfied(null), true);
assert.match(page, /passwordRequirementSatisfied\(updateError\)/);
assert.match(page, /fetch\('\/api\/activation\/complete'/);

// B/C: an already-set password is success, including retry after a transient
// activation-complete failure. The page must not ask for another OTP.
assert.equal(passwordRequirementSatisfied({ code: 'same_password' }), true);
assert.doesNotMatch(page, /Solicita un código nuevo/);
assert.match(page, /No pudimos guardar tu contraseña\. Inténtalo nuevamente\./);

// D: unrelated password errors remain blocking errors.
assert.equal(passwordRequirementSatisfied({ code: 'weak_password' }), false);
assert.equal(passwordRequirementSatisfied({ code: 'invalid_password' }), false);

// E: activation completion is safe to repeat and preserves first activation.
assert.match(route, /current\?\.account_status === 'active' && current\.must_set_password === false/);
assert.match(route, /current\?\.first_activated_at \?\? now/);
assert.match(route, /onboarding_completed: Boolean\(current\?\.onboarding_completed\)/);
assert.doesNotMatch(route, /update\(\{[^}]*onboarding_completed\s*:/s, 'route must not write onboarding completion');

console.log('activation idempotency: PASS (success, same_password, retry, real error, already complete)');
