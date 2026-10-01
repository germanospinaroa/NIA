export type InterventionDetailRow = Record<string, unknown>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function bool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function primaryRejectionLayer(auditResults: unknown, rejectionReason?: string | null) {
  const audit = record(auditResults);
  const deterministicNested = record(audit.deterministic);
  const semanticNested = record(audit.semantic);
  const deterministic = Object.keys(deterministicNested).length ? deterministicNested : audit;
  const semantic = Object.keys(semanticNested).length ? semanticNested : audit;
  const checks = record(audit.checks);
  if (deterministic.approved === false || (!Object.keys(deterministic).length && audit.approved === false && rejectionReason?.includes('deterministic'))) return 'deterministic';
  if (semantic.approved === false || audit.semanticStatus === 'fail' || audit.semanticStatus === 'review' && rejectionReason?.includes('semantic')) return 'semantic';
  if (checks.llm_approved === false || record(audit.llm).approved === false) return 'llm';
  return null;
}

export function deriveCandidateObservability(candidate: InterventionDetailRow, finalText?: string | null, index = 0) {
  const audit = record(candidate.audit_results);
  const deterministic = Object.keys(record(audit.deterministic)).length ? record(audit.deterministic) : audit;
  const semantic = Object.keys(record(audit.semantic)).length ? record(audit.semantic) : audit;
  const checks = record(audit.checks);
  const llm = record(audit.llm);
  const selected = audit.approved === true || Boolean(finalText && candidate.candidate_text === finalText && candidate.rejection_reason == null);
  const deterministicApproved = bool(deterministic.approved);
  const semanticApproved = bool(semantic.approved) ?? (audit.semanticStatus === 'pass' ? true : audit.semanticStatus === 'fail' ? false : null);
  const llmApproved = bool(llm.approved) ?? bool(checks.llm_approved);
  const similar = Array.isArray(audit.similarInterventions) ? audit.similarInterventions : Array.isArray(semantic.similarInterventions) ? semantic.similarInterventions : [];
  const judge = audit.semanticJudge ?? semantic.semanticJudge ?? null;
  return {
    ...candidate,
    index: index + 1,
    selected,
    result: selected ? 'approved' : candidate.rejection_reason || audit.approved === false ? 'rejected' : 'not_available',
    primary_rejection_layer: selected ? null : primaryRejectionLayer(candidate.audit_results, String(candidate.rejection_reason ?? '')),
    audits: {
      deterministic: { executed: Object.keys(deterministic).length > 0, approved: deterministicApproved, reasons: Array.isArray(deterministic.reasons) ? deterministic.reasons : [], checks: deterministic.checks ?? {} },
      semantic: { executed: audit.semanticStatus !== undefined || Object.keys(record(audit.semantic)).length > 0, approved: semanticApproved, status: audit.semanticStatus ?? semantic.semanticStatus ?? null, reasons: Array.isArray(semantic.reasons) ? semantic.reasons : [], similarity: number(audit.similarity ?? semantic.similarity), similarity_band: audit.similarityBand ?? semantic.similarityBand ?? null, matches: similar, judge },
      llm: { executed: llmApproved !== null || checks.llm_approved !== undefined, approved: llmApproved, reasons: Array.isArray(llm.reasons) ? llm.reasons : Array.isArray(audit.reasons) && llmApproved === false ? audit.reasons : [], checks: Object.fromEntries(Object.entries(checks).filter(([key]) => key.startsWith('llm_'))) },
    },
  };
}

export function selectCandidate(candidates: InterventionDetailRow[], finalText?: string | null) {
  const observed = candidates.map((candidate, index) => deriveCandidateObservability(candidate, finalText, index));
  return observed.find(candidate => candidate.selected) ?? null;
}

function stat(values: number[]) {
  return values.length ? { average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), min: Math.min(...values), max: Math.max(...values) } : null;
}

export function groupInterventionProviderUsage(providerCalls: InterventionDetailRow[]) {
  const grouped = new Map<string, { operation: string; provider: string; model: string; calls: number; input_tokens: number; output_tokens: number; total_tokens: number; latencies: number[]; errors: number }>();
  for (const call of providerCalls) {
    const key = `${call.operation}:${call.provider}:${call.model ?? 'unknown'}`;
    const current = grouped.get(key) ?? { operation: String(call.operation), provider: String(call.provider), model: String(call.model ?? 'unknown'), calls: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, latencies: [], errors: 0 };
    current.calls += 1;
    current.input_tokens += number(call.input_tokens) ?? 0;
    current.output_tokens += number(call.output_tokens) ?? 0;
    current.total_tokens += number(call.total_tokens) ?? 0;
    if (number(call.latency_ms) !== null) current.latencies.push(number(call.latency_ms)!);
    if (call.status === 'failed') current.errors += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()].map(item => ({ ...item, latency: stat(item.latencies), latencies: undefined }));
}

const SENSITIVE = /(api[_-]?key|authorization|bearer|secret|password|credential|headers?|prompt)/i;

export function sanitizeTechnical(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitizeTechnical(item, depth + 1));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => !SENSITIVE.test(key)).map(([key, item]) => [key, sanitizeTechnical(item, depth + 1)]));
}

export function buildInterventionTimeline(input: { events: InterventionDetailRow[]; execution?: InterventionDetailRow | null; attempts?: InterventionDetailRow[]; feedback?: InterventionDetailRow[]; intervention?: InterventionDetailRow | null }) {
  const rows = input.events.map(event => ({ id: String(event.id), type: String(event.event_type), at: String(event.occurred_at ?? event.created_at), execution_id: event.execution_run_id ? String(event.execution_run_id) : null, metadata: sanitizeTechnical(event.metadata ?? {}) }));
  if (input.execution?.started_at) rows.push({ id: `execution-started-${input.execution.id}`, type: 'execution_started', at: String(input.execution.started_at), execution_id: String(input.execution.id), metadata: {} });
  if (input.intervention?.created_at) rows.push({ id: `intervention-created-${input.intervention.id}`, type: 'intervention_persisted', at: String(input.intervention.created_at), execution_id: input.execution?.id ? String(input.execution.id) : null, metadata: {} });
  for (const attempt of input.attempts ?? []) if (attempt.started_at) rows.push({ id: `attempt-${attempt.id}`, type: `generation_${String(attempt.attempt_type)}`, at: String(attempt.started_at), execution_id: String(attempt.execution_run_id), metadata: { status: attempt.status, candidate_count: attempt.candidate_count } });
  for (const feedback of input.feedback ?? []) if (feedback.created_at) rows.push({ id: `feedback-${feedback.id}`, type: 'feedback_received', at: String(feedback.created_at), execution_id: null, metadata: sanitizeTechnical({ dimension: feedback.dimension, learning_signal: feedback.learning_signal }) });
  return rows.sort((a, b) => a.at.localeCompare(b.at));
}
