import assert from 'node:assert/strict';
import { aggregateCosts, aggregateDashboardCost, aggregateUserCosts, calculateProviderCallCost } from '../lib/server/cost-ledger.ts';

const pricing = (overrides = {}) => ({ id: 'p1', provider: 'openai', model: 'gpt-6-luna', operation_type: 'generation', input_price_per_1m: 0.10, cached_input_price_per_1m: null, cache_write_price_per_1m: null, output_price_per_1m: 0.50, effective_from: '2026-10-01T00:00:00Z', effective_to: null, currency: 'USD', ...overrides });
const call = (overrides = {}) => ({ id: 'c1', execution_run_id: 'e1', provider: 'openai', model: 'gpt-6-luna', operation: 'generation', input_tokens: 1_000_000, output_tokens: 1_000_000, total_tokens: 2_000_000, created_at: '2026-10-01T12:00:00Z', ...overrides });

assert.equal(calculateProviderCallCost(call(), pricing()).total_cost, 0.6);
assert.equal(calculateProviderCallCost(call({ id: 'embed', model: 'text-embedding-3-small', operation: 'embedding', output_tokens: null }), pricing({ id: 'pe', model: 'text-embedding-3-small', operation_type: 'embedding', input_price_per_1m: 0.02, output_price_per_1m: 0 })).total_cost, 0.02);
assert.equal(calculateProviderCallCost(call({ input_tokens: 0, output_tokens: 0 }), pricing()).total_cost, 0);
assert.equal(calculateProviderCallCost(call({ input_tokens: null }), pricing()).cost_reason, 'missing_usage');
assert.equal(calculateProviderCallCost(call({ model: null }), pricing()).cost_reason, 'unknown_model');
assert.equal(calculateProviderCallCost(call(), null).cost_reason, 'missing_pricing');
assert.notEqual(calculateProviderCallCost(call(), pricing({ input_price_per_1m: 0.10 })).total_cost, calculateProviderCallCost(call(), pricing({ input_price_per_1m: 0.20 })).total_cost);
const cached = calculateProviderCallCost(call({ input_tokens: 1_000_000, cached_input_tokens: 200_000, cache_write_tokens: 100_000 }), pricing({ cached_input_price_per_1m: 0.03, cache_write_price_per_1m: 0.04 }));
assert.ok(Math.abs(cached.input_cost - 0.07) < 1e-9);
assert.ok(Math.abs(cached.cached_input_cost - 0.006) < 1e-9);
assert.ok(Math.abs(cached.cache_write_cost - 0.004) < 1e-9);
assert.ok(Math.abs(cached.total_cost - 0.58) < 1e-9);
assert.equal(calculateProviderCallCost(call({ cached_input_tokens: 1 }), pricing()).cost_reason, 'missing_pricing');
assert.equal(calculateProviderCallCost(call({ input_tokens: 1, output_tokens: 0, cached_input_tokens: 2 }), pricing()).cost_reason, 'invalid_cache_usage');

const costs = [
  { provider_call_id: 'c1', cost_status: 'available', total_cost: 0.6, pricing_id: 'p1', cost_reason: null, input_cost: 0.1, cached_input_cost: 0, cache_write_cost: 0, output_cost: 0.5, currency: 'USD', calculated_at: '2026-10-01T12:01:00Z', operation: 'generation' },
  { provider_call_id: 'c2', cost_status: 'available', total_cost: 0.02, pricing_id: 'pe', cost_reason: null, input_cost: 0.02, cached_input_cost: 0, cache_write_cost: 0, output_cost: 0, currency: 'USD', calculated_at: '2026-10-01T12:01:00Z', operation: 'embedding' },
  { provider_call_id: 'c3', cost_status: 'unavailable', total_cost: null, pricing_id: null, cost_reason: 'missing_usage', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, currency: 'USD', calculated_at: '2026-10-01T12:01:00Z', operation: 'llm_audit' },
];
assert.equal(aggregateCosts(costs).total, 0.62);
assert.equal(aggregateCosts(costs).unavailableCalls, 1);
assert.equal(aggregateCosts(costs).byOperation.length, 3);

const calls = [call(), call({ id: 'c2', execution_run_id: 'e2', model: 'text-embedding-3-small', operation: 'embedding', created_at: '2026-09-30T12:00:00Z' }), call({ id: 'c3', execution_run_id: 'e1', created_at: '2026-09-01T12:00:00Z' })];
const userCosts = aggregateUserCosts(calls, costs, new Date('2026-10-01T13:00:00Z'));
assert.equal(userCosts.today, 0.6);
assert.equal(userCosts.sevenDays, 0.62);
assert.equal(userCosts.executions, 2);
assert.equal(userCosts.averagePerExecution, 0.31);

const dashboard = aggregateDashboardCost(calls, costs, 2, '2026-09-25T00:00:00Z');
assert.equal(dashboard.total, 0.62);
assert.equal(dashboard.averagePerActiveUser, 0.31);
assert.equal(dashboard.byModel.length, 2);

console.log('cost-ledger tests: PASS');
