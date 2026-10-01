import assert from 'node:assert/strict';
import { aggregateDashboard } from '../lib/server/admin-dashboard.ts';
import { parseAdminPeriod } from '../lib/server/admin-data.ts';

const customPeriod = parseAdminPeriod(new URL('https://nia.test/admin?period=custom&date_from=2026-09-01&date_to=2026-09-30'));
assert.equal(customPeriod.from, '2026-09-01T00:00:00.000Z');
assert.equal(customPeriod.to, '2026-09-30T23:59:59.999Z');

const period = { from: '2026-09-01T00:00:00.000Z', to: '2026-10-01T00:00:00.000Z' };
const result = aggregateDashboard({
  users: [{ id: 'u1', created_at: '2026-09-02T00:00:00.000Z' }, { id: 'u2', created_at: '2026-08-02T00:00:00.000Z' }],
  executions: [
    { id: 'e1', user_id: 'u1', status: 'approved', duration_ms: 100, failure_code: null, started_at: '2026-09-02T10:00:00.000Z' },
    { id: 'e2', user_id: 'u1', status: 'no_approved_intervention', duration_ms: 200, failure_code: null, started_at: '2026-09-02T11:00:00.000Z' },
    { id: 'e3', user_id: 'u2', status: 'failed', duration_ms: 300, failure_code: 'persistence_error', started_at: '2026-09-03T10:00:00.000Z' },
  ],
  attempts: [
    { attempt_type: 'generation', candidate_count: 3, approved_candidate_count: 1, rejection_count: 2, duration_ms: 100 },
    { attempt_type: 'quality_retry', candidate_count: 3, approved_candidate_count: 0, rejection_count: 3, duration_ms: 120 },
  ],
  providerCalls: [{ provider: 'test', model: 'model', operation: 'generation', input_tokens: 10, output_tokens: 5, total_tokens: 15, latency_ms: 40, status: 'success', error_code: null, created_at: '2026-09-02T10:00:00.000Z' }],
  interventions: [{ user_id: 'u1', status: 'delivered', created_at: '2026-09-02T10:00:00.000Z', delivered_at: '2026-09-02T10:01:00.000Z' }],
  events: [
    { user_id: 'u1', event_type: 'intervention_requested', metadata: null, occurred_at: '2026-09-02T10:00:00.000Z' },
    { user_id: 'u1', event_type: 'candidate_rejected', metadata: { layer: 'semantic' }, occurred_at: '2026-09-02T10:00:00.000Z' },
  ],
  feedback: 2,
  learningSignals: 1,
  activeSubscriptions: null,
  period,
});

assert.equal(result.users.total, 2);
assert.equal(result.users.active, 2);
assert.equal(result.users.new, 1);
assert.equal(result.interventions.requests, 1);
assert.equal(result.interventions.completed, 2);
assert.equal(result.interventions.approvalRate, 0.5);
assert.equal(result.interventions.delivered, 1);
assert.equal(result.interventions.noApproved, 1);
assert.equal(result.users.onboardingCompleted, 0);
assert.equal(result.generation.candidatesGenerated, 6);
assert.equal(result.generation.candidatesRejected, 5);
assert.equal(result.generation.qualityRetries, 1);
assert.equal(result.errors.total, 1);
assert.equal(result.engine.rejectionLayers.semantic, 1);
assert.equal(result.providerUsage.totalTokens, 15);
assert.equal(result.users.activeSubscriptions, null);
assert.ok(result.unavailable.includes('AI cost'));

const empty = aggregateDashboard({ users: [], executions: [], attempts: [], providerCalls: [], interventions: [], events: [], feedback: 0, learningSignals: 0, activeSubscriptions: null, period });
assert.equal(empty.interventions.approvalRate, null);
assert.equal(empty.errors.total, 0);
assert.equal(empty.performance.execution, null);
assert.equal(empty.providerUsage.calls, 0);

console.log('admin-dashboard tests: PASS');
