import assert from 'node:assert/strict';
import fs from 'node:fs';
import { confirmedEntitlementAccessUntil } from '../lib/entitlement.ts';

const activeEnd = '2026-11-15T00:00:00.000Z';
const trialEnd = '2026-10-22T00:00:00.000Z';

assert.equal(confirmedEntitlementAccessUntil({ status: 'active', access_until: activeEnd }), activeEnd);
assert.equal(confirmedEntitlementAccessUntil({ status: 'trialing', trial: true, trial_ends_at: trialEnd }), trialEnd);
assert.equal(confirmedEntitlementAccessUntil({ status: 'past_due', access_until: activeEnd }), null);
assert.equal(confirmedEntitlementAccessUntil({ status: 'canceled', access_until: activeEnd }), null);
assert.equal(confirmedEntitlementAccessUntil({ status: 'cancelled', current_period_end: activeEnd }), null);
assert.equal(confirmedEntitlementAccessUntil({ status: 'active', current_period_end: activeEnd }), null);

const page = fs.readFileSync('app/app/tu/page.tsx', 'utf8');
const cancelRoute = fs.readFileSync('app/api/subscription/cancel/route.ts', 'utf8');
const hotmart = fs.readFileSync('lib/server/hotmart.ts', 'utf8');
assert.match(page, /confirmedEntitlementAccessUntil\(subscription\)/);
assert.doesNotMatch(page, /displayDate\(subscription\?\.current_period_end\)/);
assert.doesNotMatch(page, /displayDate\(subscription\?\.trial_ends_at\)/);
assert.doesNotMatch(cancelRoute, /date_next_charge/);
assert.match(hotmart, /access_until: isCancellation \? null/);
assert.doesNotMatch(hotmart, /access_until: isCancellation \? input\.nextBilling/);

console.log('entitlement access contract tests: PASS');
