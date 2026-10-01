import assert from 'node:assert/strict';
import { buildUserTimeline, buildUserUsage, groupProviderUsage } from '../lib/server/admin-user-detail.ts';

const usage = buildUserUsage(
  [{ status: 'approved' }, { status: 'no_approved_intervention' }, { status: 'failed' }],
  [{ status: 'created', delivered_at: null }, { status: 'delivered', delivered_at: '2026-09-01T01:00:00Z' }],
  [{ attempt_type: 'generation' }, { attempt_type: 'technical_retry' }, { attempt_type: 'quality_retry' }],
  4,
  3,
  2,
);
assert.equal(usage.executions.total, 3);
assert.equal(usage.executions.successful, 1);
assert.equal(usage.executions.noApproved, 1);
assert.equal(usage.executions.failed, 1);
assert.equal(usage.approvedInterventions, 2);
assert.equal(usage.deliveredInterventions, 1);
assert.equal(usage.technicalRetries, 1);
assert.equal(usage.qualityRetries, 1);
assert.equal(usage.feedback, 4);

const provider = groupProviderUsage([
  { operation: 'generation', provider: 'openai', model: 'model-a', input_tokens: 10, output_tokens: 5, total_tokens: 15, latency_ms: 40, status: 'success' },
  { operation: 'generation', provider: 'openai', model: 'model-a', input_tokens: 8, output_tokens: 4, total_tokens: 12, latency_ms: 60, status: 'failed' },
]);
assert.equal(provider.length, 1);
assert.equal(provider[0].calls, 2);
assert.equal(provider[0].total_tokens, 27);
assert.equal(provider[0].latency.average, 50);
assert.equal(provider[0].errors, 1);

const timeline = buildUserTimeline(
  [{ id: 'event', event_type: 'feedback_received', occurred_at: '2026-09-03T00:00:00Z', execution_run_id: 'exec' }],
  [{ id: 'ctx', status: 'active', created_at: '2026-09-02T00:00:00Z', context_original: 'Trabajo', source: 'user' }],
  [{ id: 'goal', status: 'ended', created_at: '2026-09-01T00:00:00Z', desired_change_original: 'Decidir' }],
);
assert.deepEqual(timeline.map(item => item.type), ['feedback_received', 'context_active', 'desired_change_previous']);
assert.equal(timeline[0].execution_id, 'exec');

console.log('user-detail tests: PASS');
