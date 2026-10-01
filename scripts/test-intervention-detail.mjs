import assert from 'node:assert/strict';
import { buildInterventionTimeline, deriveCandidateObservability, groupInterventionProviderUsage, sanitizeTechnical } from '../lib/server/admin-intervention-detail.ts';

const deterministicRejected = deriveCandidateObservability({ id: 'c1', candidate_text: 'generic', rejection_reason: 'generic_motivation', audit_results: { approved: false, reasons: ['generic_motivation'], checks: {} } }, 'selected', 0);
assert.equal(deterministicRejected.primary_rejection_layer, 'deterministic');
assert.equal(deterministicRejected.audits.deterministic.approved, false);

const semanticRejected = deriveCandidateObservability({ id: 'c2', candidate_text: 'same idea', rejection_reason: 'semantic_duplicate', audit_results: { approved: false, semanticStatus: 'fail', similarity: 0.83, semanticJudge: { relationship: 'duplicate', same_actionable_idea: true, same_angle: true, reason: 'same' }, deterministic: { approved: true }, semantic: { approved: false, reasons: ['semantic_duplicate'] }, checks: { llm_approved: null } } }, null, 1);
assert.equal(semanticRejected.primary_rejection_layer, 'semantic');
assert.equal(semanticRejected.audits.semantic.judge.relationship, 'duplicate');
assert.equal(semanticRejected.audits.semantic.similarity, 0.83);

const llmRejected = deriveCandidateObservability({ id: 'c3', candidate_text: 'llm fail', rejection_reason: 'chatbot_language', audit_results: { approved: false, deterministic: { approved: true }, semantic: { approved: true }, checks: { llm_approved: false }, reasons: ['chatbot_language'] } }, null, 2);
assert.equal(llmRejected.primary_rejection_layer, 'llm');
assert.equal(llmRejected.audits.llm.approved, false);

const approved = deriveCandidateObservability({ id: 'c4', candidate_text: 'selected', rejection_reason: null, audit_results: { approved: true, deterministic: { approved: true }, semantic: { approved: true }, checks: { llm_approved: true } } }, 'selected', 3);
assert.equal(approved.selected, true);

const usage = groupInterventionProviderUsage([
  { operation: 'generation', provider: 'openai', model: 'model-a', input_tokens: 10, output_tokens: 5, total_tokens: 15, latency_ms: 40, status: 'success' },
  { operation: 'generation', provider: 'openai', model: 'model-a', input_tokens: 8, output_tokens: 4, total_tokens: 12, latency_ms: 60, status: 'failed' },
]);
assert.equal(usage[0].calls, 2);
assert.equal(usage[0].latency.average, 50);
assert.equal(usage[0].errors, 1);

const sanitized = sanitizeTechnical({ prompt: 'secret', api_key: 'secret', input_tokens: 4, nested: { authorization: 'secret', ok: true } });
assert.deepEqual(sanitized, { input_tokens: 4, nested: { ok: true } });

const timeline = buildInterventionTimeline({
  events: [{ id: 'event-1', event_type: 'intervention_approved', occurred_at: '2026-09-03T00:00:00Z', execution_run_id: 'exec-1' }],
  execution: { id: 'exec-1', started_at: '2026-09-02T00:00:00Z' },
  attempts: [{ id: 'attempt-1', execution_run_id: 'exec-1', attempt_type: 'generation', started_at: '2026-09-02T00:01:00Z', status: 'completed', candidate_count: 3 }],
  feedback: [{ id: 'feedback-1', created_at: '2026-09-04T00:00:00Z', dimension: 'wording_off' }],
  intervention: { id: 'int-1', created_at: '2026-09-02T00:02:00Z' },
});
assert.deepEqual(timeline.map(item => item.type), ['execution_started', 'generation_generation', 'intervention_persisted', 'intervention_approved', 'feedback_received']);

console.log('intervention-detail tests: PASS');
