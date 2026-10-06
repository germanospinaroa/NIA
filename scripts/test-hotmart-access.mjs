import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hotmartEventId, purchaseData, validHotmartToken } from '../lib/server/hotmart.ts';

const payload = {
  event: 'PURCHASE_APPROVED',
  data: {
    buyer: { email: 'ADRIANA@example.com', first_name: 'Adriana' },
    purchase: { transaction: 'TX-1', price: { value: 29, currency_code: 'USD' } },
    product: { id: 10, name: 'NIA Pro' },
    plan: { id: 20, name: 'Mensual' },
    subscription: { subscriber_code: 'SUB-1', status: 'ACTIVE', date_next_charge: '2026-11-24' },
  },
};
assert.equal(hotmartEventId(payload), 'PURCHASE_APPROVED:TX-1');
assert.deepEqual(purchaseData(payload), { email: 'adriana@example.com', firstName: 'Adriana', productId: '10', productName: 'NIA Pro', planId: '20', planName: 'Mensual', planKey: '20', subscriberCode: 'SUB-1', transaction: 'TX-1', status: 'active', nextBilling: '2026-11-24', trial: false, amount: 29, currency: 'USD' });
assert.equal(validHotmartToken('secret', 'secret'), true);
assert.equal(validHotmartToken('secret', 'different'), false);
assert.equal(validHotmartToken(null, 'secret'), false);
const hotmartSource = fs.readFileSync('lib/server/hotmart.ts', 'utf8');
assert.match(hotmartSource, /createUser/);
assert.match(hotmartSource, /randomBytes/);
assert.doesNotMatch(hotmartSource, /inviteUserByEmail|emailRedirectTo/);
console.log('hotmart access tests: PASS');
