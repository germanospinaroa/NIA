import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const hotmartSource = read('lib/server/hotmart.ts');
const publicEventsSource = read('app/api/funnel/events/route.ts');
const checkoutRoute = read('app/api/funnel/v3/checkout-attempt/route.ts');
const plansSource = read('app/descubre/v3/planes/page.tsx');
const migration = read('supabase/migrations/20261017133000_emotional_v3_checkout_attribution.sql');

assert.match(hotmartSource, /purchase\.origin/);
assert.match(hotmartSource, /originSck/);
assert.match(hotmartSource, /confirm_funnel_v3_purchase/);
assert.match(hotmartSource, /PURCHASE_APPROVED/);
assert.match(hotmartSource, /PURCHASE_COMPLETE/);
assert.match(checkoutRoute, /randomUUID/);
assert.match(checkoutRoute, /funnel_checkout_attempts/);
assert.match(plansSource, /checkout-attempt/);
assert.match(plansSource, /searchParams\.set\('sck'/);
assert.match(publicEventsSource, /EVENT_NAMES = new Set/);
assert.doesNotMatch(publicEventsSource, /'purchase_confirmed'/);
assert.match(migration, /create table if not exists public\.funnel_checkout_attempts/);
assert.match(migration, /security definer/);
assert.match(migration, /for update/);
assert.match(migration, /'purchase_confirmed'/);
assert.doesNotMatch(migration, /email|phone|buyer|subscriber/i);

const uuid = '11111111-1111-4111-8111-111111111111';
const mockRpcCalls = [];
const mockAdmin = { rpc: async (name, params) => { mockRpcCalls.push({ name, params }); return { data: { status: mockRpcCalls.length === 1 ? 'confirmed' : 'already_confirmed' }, error: null }; } };
const { purchaseData, confirmFunnelV3Attribution } = await import('../lib/server/hotmart.ts');
const fixture = {
  event: 'PURCHASE_APPROVED',
  id: 'hotmart-event-v3-fixture',
  data: { buyer: { email: 'qa@example.invalid' }, purchase: { transaction: 'transaction-v3-fixture', offer: { code: 'r7w7emsp' }, price: { value: 0, currency_code: 'USD' }, origin: { sck: uuid, src: 'instagram', xcod: 'campaign-v3' } }, subscription: { subscriber: { code: 'subscriber-v3-fixture' }, trial: true, date_next_charge: '2099-01-01T00:00:00Z' } }
};
const parsed = purchaseData(fixture, 'PURCHASE_APPROVED');
assert.equal(parsed.originSck, uuid);
assert.equal(parsed.originSrc, 'instagram');
assert.equal(parsed.originXcod, 'campaign-v3');
assert.equal(parsed.planKey, 'monthly');
assert.equal(parsed.trial, true);
const first = await confirmFunnelV3Attribution(mockAdmin, parsed, 'hotmart-event-v3-fixture');
const second = await confirmFunnelV3Attribution(mockAdmin, parsed, 'hotmart-event-v3-complete');
assert.equal(first.status, 'confirmed');
assert.equal(second.status, 'already_confirmed');
assert.equal(mockRpcCalls.length, 2);
assert.equal(mockRpcCalls[0].params.p_correlation_id, uuid);
assert.equal(mockRpcCalls[0].params.p_plan, 'monthly');
assert.equal(mockRpcCalls[0].params.p_offer_code, 'r7w7emsp');
assert.equal(mockRpcCalls[0].params.p_provider_transaction, 'transaction-v3-fixture');

const noOrigin = purchaseData({ ...fixture, data: { ...fixture.data, purchase: { ...fixture.data.purchase, origin: null } } }, 'PURCHASE_APPROVED');
const missing = await confirmFunnelV3Attribution(mockAdmin, noOrigin, 'hotmart-event-no-origin');
assert.equal(missing.status, 'not_attributable');
assert.equal(mockRpcCalls.length, 2);

console.log('funnel v3 attribution tests: ok');
