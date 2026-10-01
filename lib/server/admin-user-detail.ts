export type UserDetailRow = Record<string, unknown>;
const num = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const stats = (values: number[]) => values.length ? { average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), min: Math.min(...values), max: Math.max(...values) } : null;

export function buildUserUsage(executions: UserDetailRow[], interventions: UserDetailRow[], attempts: UserDetailRow[], feedback: number, learningSignals: number, recalibrations: number) {
  return { executions: { total: executions.length, successful: executions.filter(row => row.status === 'approved').length, approved: executions.filter(row => row.status === 'approved').length, noApproved: executions.filter(row => row.status === 'no_approved_intervention').length, failed: executions.filter(row => row.status === 'failed').length }, approvedInterventions: interventions.filter(row => row.status === 'created' || row.status === 'delivered').length, deliveredInterventions: interventions.filter(row => row.status === 'delivered' || row.delivered_at !== null).length, totalGenerationAttempts: attempts.length, technicalRetries: attempts.filter(row => row.attempt_type === 'technical_retry').length, qualityRetries: attempts.filter(row => row.attempt_type === 'quality_retry').length, feedback, learningSignals, recalibrations };
}

export function buildUserTimeline(events: UserDetailRow[], contexts: UserDetailRow[], desiredChanges: UserDetailRow[]) {
  return [
    ...events.map(row => ({ id: String(row.id), type: String(row.event_type), at: String(row.occurred_at), execution_id: row.execution_run_id ? String(row.execution_run_id) : null, entity_id: row.entity_id ? String(row.entity_id) : null, metadata: row.metadata ?? {} })),
    ...contexts.map(row => ({ id: `context-${String(row.id)}`, type: row.status === 'active' ? 'context_active' : 'context_previous', at: String(row.created_at), execution_id: null, entity_id: String(row.id), metadata: { context: row.context_original, source: row.source } })),
    ...desiredChanges.map(row => ({ id: `desired-${String(row.id)}`, type: row.status === 'active' ? 'desired_change_active' : 'desired_change_previous', at: String(row.created_at), execution_id: null, entity_id: String(row.id), metadata: { desired_change: row.desired_change_original } })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80);
}

export function groupProviderUsage(providerCalls: UserDetailRow[]) {
  const operationMap = new Map<string, { operation: string; provider: string; model: string; calls: number; input_tokens: number; output_tokens: number; total_tokens: number; latencies: number[]; errors: number }>();
  for (const row of providerCalls) {
    const key = `${row.operation}:${row.provider}:${row.model ?? 'unknown'}`;
    const current = operationMap.get(key) ?? { operation: String(row.operation), provider: String(row.provider), model: String(row.model ?? 'unknown'), calls: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, latencies: [], errors: 0 };
    current.calls += 1; current.input_tokens += num(row.input_tokens); current.output_tokens += num(row.output_tokens); current.total_tokens += num(row.total_tokens); if (row.latency_ms !== null) current.latencies.push(num(row.latency_ms)); if (row.status === 'failed') current.errors += 1; operationMap.set(key, current);
  }
  return [...operationMap.values()].map(row => ({ operation: row.operation, provider: row.provider, model: row.model, calls: row.calls, input_tokens: row.input_tokens, output_tokens: row.output_tokens, total_tokens: row.total_tokens, latency: stats(row.latencies), errors: row.errors }));
}
