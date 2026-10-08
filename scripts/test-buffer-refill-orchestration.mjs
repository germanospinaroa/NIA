import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isEligibleProductionUser, orchestrateRefillUsers, refillPriority } from '../lib/server/refill-approved-buffer.ts';

assert.equal(refillPriority(5), null);
assert.equal(refillPriority(4), 'normal');
assert.equal(refillPriority(2), 'urgent');
assert.equal(refillPriority(0), 'critical');

const users = [
  { userId: 'A', bufferBefore: 5 },
  { userId: 'B', bufferBefore: 4 },
  { userId: 'C', bufferBefore: 2 },
  { userId: 'D', bufferBefore: 0 },
  { userId: 'E', bufferBefore: 2 },
];
const calls = [];
const events = [];
const result = await orchestrateRefillUsers(users, {
  globalMaxCostUsd: 0.12,
  perUserMaxCostUsd: 0.03,
  onEvent: event => events.push(event),
  refill: async (userId) => {
    calls.push(userId);
    if (userId === 'E') throw new Error('simulated_generation_failure');
    const before = users.find(user => user.userId === userId).bufferBefore;
    return { userId, minBufferDays: 3, targetBufferDays: 5, created: Array.from({ length: 5 - before }, (_, index) => ({ id: `${userId}-${index}` })), skipped: [], calls: { writer: 0, judge: 0, repairs: 0 }, usage: { writerInput: 0, writerOutput: 0, judgeInput: 0, judgeOutput: 0, estimatedCostUsd: 0.01 }, usageRecords: [] };
  },
});

assert.deepEqual(result.users.find(user => user.userId === 'A'), { userId: 'A', bufferBefore: 5, bufferAfter: 5, created: 0, skipped: ['buffer_at_target'], failureReason: null, estimatedCostUsd: 0, priority: null });
for (const userId of ['B', 'C', 'D']) {
  const row = result.users.find(user => user.userId === userId);
  assert.equal(row.bufferAfter, 5);
  assert.equal(row.failureReason, null);
}
const failed = result.users.find(user => user.userId === 'E');
assert.equal(failed.failureReason, 'simulated_generation_failure');
assert.deepEqual(calls, ['B', 'C', 'D', 'E']);
assert.equal(events.some(event => event.eventType === 'refill_failed' && event.userId === 'E'), true);
assert.equal(events.some(event => event.eventType === 'zero_buffer' && event.userId === 'D'), true);
assert.equal(result.users.every(user => user.bufferAfter <= 5), true);

const budget = await orchestrateRefillUsers([{ userId: 'G', bufferBefore: 0 }, { userId: 'H', bufferBefore: 0 }], { globalMaxCostUsd: 0.01, perUserMaxCostUsd: 0.03, refill: async userId => ({ userId, minBufferDays: 3, targetBufferDays: 5, created: [], skipped: [], calls: { writer: 0, judge: 0, repairs: 0 }, usage: { writerInput: 0, writerOutput: 0, judgeInput: 0, outputTokens: 0, completionTokens: 0, judgeOutput: 0, estimatedCostUsd: 0.01 }, usageRecords: [] }) });
assert.equal(budget.budgetExhausted, true);
assert.equal(budget.users[1].skipped.includes('budget_exhausted'), true);

const eligible = { userId: 'eligible', accountStatus: 'active', whatsappEnabled: true, whatsappConnected: true, subscriptionStatus: 'active' };
assert.equal(isEligibleProductionUser(eligible), true);
assert.equal(isEligibleProductionUser({ ...eligible, subscriptionStatus: 'trialing' }), true);
for (const status of ['canceled', 'cancelled', 'expired', 'refunded', 'chargeback', 'past_due', 'overdue']) assert.equal(isEligibleProductionUser({ ...eligible, subscriptionStatus: status }), false, `${status} must be excluded`);
for (const field of ['accountStatus', 'whatsappEnabled', 'whatsappConnected', 'subscriptionStatus']) {
  const copy = { ...eligible };
  if (field === 'accountStatus') copy[field] = 'pending_activation';
  if (field === 'whatsappEnabled') copy[field] = false;
  if (field === 'whatsappConnected') copy[field] = false;
  if (field === 'subscriptionStatus') copy[field] = null;
  assert.equal(isEligibleProductionUser(copy), false, `${field} must be required`);
}

const route = fs.readFileSync(new URL('../app/api/cron/refill-buffer/route.ts', import.meta.url), 'utf8');
assert.match(route, /REFILL_PRODUCTION_ENABLED/);
assert.match(route, /qa_single_user/);
assert.match(route, /refillEligibleProductionUsers/);
assert.match(route, /refillApprovedBuffer/);
console.log(JSON.stringify({ status: 'PASS', users: { A: 'skip', B: 'refilled', C: 'refilled', D: 'refilled', E: 'isolated_failure', F: 'ineligible' }, budget: 'PASS', eligibility: 'PASS' }, null, 2));
