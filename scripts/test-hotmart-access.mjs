import assert from 'node:assert/strict';
import fs from 'node:fs';
import { planForHotmartOffer } from '../lib/hotmart-checkout.ts';
import { dateValue, hotmartEventId, purchaseData, validHotmartToken } from '../lib/server/hotmart.ts';

const monthly = {
  id: 'evt-monthly-1', event: 'PURCHASE_APPROVED', data: {
    product: { id: 107, ucode: 'NIA-PROD' }, buyer: { email: 'ADRIANA@example.com', first_name: 'Adriana', last_name: 'Canary' },
    purchase: { transaction: 'TX-MONTHLY-1', status: 'APPROVED', price: { value: 4.99, currency_value: 'USD' }, offer: { code: 'r7w7emsp' }, date_next_charge: '2026-11-24T00:00:00Z' },
    subscription: { subscriber: { code: 'SUB-MONTHLY-1' }, plan: { id: 'plan-monthly', name: 'NIA Mensual' }, status: 'ACTIVE' },
  },
};
const annual = JSON.parse(JSON.stringify(monthly));
annual.id = 'evt-annual-1'; annual.data.purchase.transaction = 'TX-ANNUAL-1'; annual.data.purchase.price.value = 49.99; annual.data.purchase.offer.code = '3z4a0vad'; annual.data.subscription.subscriber.code = 'SUB-ANNUAL-1'; annual.data.subscription.plan.id = 'plan-annual'; annual.data.subscription.plan.name = 'NIA Anual';

assert.equal(hotmartEventId(monthly), 'evt-monthly-1');
assert.equal(planForHotmartOffer('r7w7emsp'), 'monthly');
assert.equal(planForHotmartOffer('3z4a0vad'), 'annual');
assert.equal(planForHotmartOffer('unknown-offer'), null);
assert.equal(dateValue('2026-10-14T00:00:00Z'), '2026-10-14T00:00:00.000Z');
assert.equal(dateValue(1791936000000), '2026-10-14T00:00:00.000Z');
assert.equal(dateValue(1791936000), '2026-10-14T00:00:00.000Z');
assert.equal(dateValue('1791936000000'), '2026-10-14T00:00:00.000Z');
assert.equal(dateValue('not-a-date'), null);
assert.deepEqual(purchaseData(monthly), {
  email: 'adriana@example.com', firstName: 'Adriana', lastName: 'Canary', productId: '107', productName: null,
  planId: 'plan-monthly', planName: 'NIA Mensual', offerCode: 'r7w7emsp', planKey: 'monthly', subscriberCode: 'SUB-MONTHLY-1',
  transaction: 'TX-MONTHLY-1', status: 'approved', purchaseDate: null, cancellationDate: null, nextBilling: '2026-11-24T00:00:00.000Z', trial: false, amount: 4.99, currency: 'USD',
});
assert.equal(purchaseData(annual).planKey, 'annual');
const monthlyTrial = JSON.parse(JSON.stringify(monthly));
monthlyTrial.data.purchase.price.value = 0;
monthlyTrial.data.purchase.approved_date = 1791235200000;
monthlyTrial.data.purchase.date_next_charge = 1791936000000;
assert.equal(purchaseData(monthlyTrial).trial, true);
const annualTrial = JSON.parse(JSON.stringify(annual));
annualTrial.data.purchase.price.value = 0;
annualTrial.data.purchase.approved_date = 1791235200000;
annualTrial.data.purchase.date_next_charge = 1791936000000;
assert.equal(purchaseData(annualTrial).trial, true);
const unknownTrial = JSON.parse(JSON.stringify(monthlyTrial));
unknownTrial.data.purchase.offer.code = 'unknown-offer';
assert.equal(purchaseData(unknownTrial).trial, false);
assert.equal(purchaseData({ event: 'MALFORMED' }).email, '');
assert.equal(validHotmartToken('secret', 'secret'), true);
assert.equal(validHotmartToken('secret', 'different'), false);
assert.equal(validHotmartToken(null, 'secret'), false);

const hotmartSource = fs.readFileSync('lib/server/hotmart.ts', 'utf8');
const webhookRoute = fs.readFileSync('app/api/webhooks/hotmart/route.ts', 'utf8');
const pricingSource = fs.readFileSync('app/descubre/planes/page.tsx', 'utf8');
const thanksSource = fs.readFileSync('app/gracias/page.tsx', 'utf8');
assert.match(hotmartSource, /subscriber.*code/);
assert.match(hotmartSource, /purchase.*offer/);
assert.match(hotmartSource, /hotmart_webhook_events/);
assert.match(hotmartSource, /23505/);
assert.match(hotmartSource, /PURCHASE_REFUNDED|PURCHASE_CHARGEBACK/);
assert.match(hotmartSource, /SUBSCRIPTION_CANCELLATION/);
assert.match(hotmartSource, /offer_not_allowed/);
assert.match(hotmartSource, /grantEvents\.has\(event\)/);
assert.match(hotmartSource, /stale_access_grant/);
assert.match(hotmartSource, /access_until/);
assert.match(hotmartSource, /past_due/);
assert.doesNotMatch(hotmartSource, /ensureUser\(admin, data\).*PURCHASE_REFUNDED/);
assert.match(webhookRoute, /x-hotmart-hottok/);
assert.match(webhookRoute, /validHotmartToken/);
assert.doesNotMatch(hotmartSource, /inviteUserByEmail|emailRedirectTo/);
assert.match(pricingSource, /window\.location\.assign\(checkout\.url\)/);
assert.match(pricingSource, /US\$49\.99/);
assert.match(pricingSource, /US\$4\.99/);
assert.match(thanksSource, /Tu acceso a NIA está casi listo\./);
assert.match(thanksSource, /href: '\/acceso'/);
console.log('hotmart V2 access tests: PASS');
