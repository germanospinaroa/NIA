export type DashboardUser = { id: string; created_at: string };
export type DashboardExecution = { id: string; user_id: string; status: string; duration_ms: number | null; failure_code: string | null; started_at: string };
export type DashboardAttempt = { attempt_type: string; candidate_count: number; approved_candidate_count: number; rejection_count: number; duration_ms: number | null };
export type DashboardProviderCall = { provider: string; model: string | null; operation: string; input_tokens: number | null; output_tokens: number | null; total_tokens: number | null; latency_ms: number | null; status: string; error_code: string | null; created_at: string };
export type DashboardIntervention = { user_id: string; status: string; created_at: string; delivered_at: string | null };
export type EditorialDashboardIntervention = DashboardIntervention & { topic: string | null; intervention_type: string | null; depth: string | null; experience_type?: string | null };
export type DashboardEvent = { user_id: string | null; event_type: string; metadata: Record<string, unknown> | null; occurred_at: string };

const numberOrZero = (value: number | null | undefined) => Number.isFinite(Number(value)) ? Number(value) : 0;
const stats = (values: number[]) => values.length ? { average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), min: Math.min(...values), max: Math.max(...values) } : null;
const countBy = (values: string[]) => values.reduce<Record<string, number>>((result, value) => { result[value] = (result[value] ?? 0) + 1; return result; }, {});
const utcDay = (value: string) => value.slice(0, 10);

export function aggregateDashboard(input: {
  users: DashboardUser[];
  executions: DashboardExecution[];
  attempts: DashboardAttempt[];
  providerCalls: DashboardProviderCall[];
  interventions: DashboardIntervention[];
  editorialInterventions?: EditorialDashboardIntervention[];
  events: DashboardEvent[];
  feedback: number;
  learningSignals: number;
  activeSubscriptions: number | null;
  period: { from: string; to: string };
}) {
  const { users, executions, attempts, providerCalls, interventions, events, period } = input;
  const approvedExecutions = executions.filter(row => row.status === 'approved').length;
  const noApproved = executions.filter(row => row.status === 'no_approved_intervention').length;
  const failedExecutions = executions.filter(row => row.status === 'failed').length;
  const completedExecutions = approvedExecutions + noApproved;
  const durations = executions.map(row => numberOrZero(row.duration_ms)).filter(value => value > 0);
  const candidatesGenerated = attempts.reduce((sum, row) => sum + numberOrZero(row.candidate_count), 0);
  const candidatesApproved = attempts.reduce((sum, row) => sum + numberOrZero(row.approved_candidate_count), 0);
  const candidatesRejected = attempts.reduce((sum, row) => sum + numberOrZero(row.rejection_count), 0);
  const eventCounts = countBy(events.map(row => row.event_type));
  const rejectionEvents = events.filter(row => row.event_type === 'candidate_rejected');
  const rejectionLayers = countBy(rejectionEvents.map(row => typeof row.metadata?.layer === 'string' ? row.metadata.layer : 'unknown'));
  const providerErrors = providerCalls.filter(row => row.status === 'failed');
  const errorRows = [
    ...executions.filter(row => row.status === 'failed').map(row => ({ code: row.failure_code || 'unknown_error', operation: 'execution', provider: 'NIA', occurred_at: row.started_at })),
    ...providerErrors.map(row => ({ code: row.error_code || 'provider_error', operation: row.operation, provider: row.provider, occurred_at: row.created_at })),
  ];
  const errorMap = new Map<string, { code: string; operation: string; provider: string; count: number; last_occurred_at: string }>();
  for (const row of errorRows) {
    const key = `${row.code}:${row.operation}:${row.provider}`;
    const current = errorMap.get(key);
    if (current) { current.count += 1; if (row.occurred_at > current.last_occurred_at) current.last_occurred_at = row.occurred_at; }
    else errorMap.set(key, { code: row.code, operation: row.operation, provider: row.provider, count: 1, last_occurred_at: row.occurred_at });
  }
  const executionHealth = [...new Set(executions.map(row => utcDay(row.started_at)))].sort().map(day => {
    const rows = executions.filter(row => utcDay(row.started_at) === day);
    return { date: day, executions: rows.length, approved: rows.filter(row => row.status === 'approved').length, noApproved: rows.filter(row => row.status === 'no_approved_intervention').length, failed: rows.filter(row => row.status === 'failed').length };
  });
  const providerLatency = Object.entries(providerCalls.reduce<Record<string, number[]>>((result, row) => { if (row.latency_ms !== null) (result[row.operation] ??= []).push(Number(row.latency_ms)); return result; }, {})).map(([operation, values]) => ({ operation, ...stats(values) })).filter(row => row.average !== null);
  const usersActive = new Set([...executions.map(row => row.user_id), ...events.map(row => row.user_id)].filter(Boolean)).size;
  const usersToday = new Set(events.filter(row => row.occurred_at >= new Date().toISOString().slice(0, 10)).map(row => row.user_id).filter(Boolean)).size;
  const usersCreated = users.filter(user => user.created_at >= period.from && user.created_at < period.to).length;
  const delivered = interventions.filter(row => row.status === 'delivered' || row.delivered_at !== null).length;
  const failedInterventions = interventions.filter(row => row.status === 'failed').length;
  const eventSummary = Object.entries(eventCounts).map(([event_type, count]) => ({ event_type, count })).sort((a, b) => b.count - a.count);
  const providerSummary = Object.entries(providerCalls.reduce<Record<string, { provider: string; model: string; calls: number; input_tokens: number; output_tokens: number; total_tokens: number; latency: number[]; errors: number }>>((result, row) => {
    const key = `${row.provider}:${row.model ?? 'unknown'}`;
    const current = result[key] ??= { provider: row.provider, model: row.model ?? 'unknown', calls: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, latency: [], errors: 0 };
    current.calls += 1; current.input_tokens += numberOrZero(row.input_tokens); current.output_tokens += numberOrZero(row.output_tokens); current.total_tokens += numberOrZero(row.total_tokens); if (row.latency_ms !== null) current.latency.push(Number(row.latency_ms)); if (row.status === 'failed') current.errors += 1; return result;
  }, {})).map(([, row]) => ({ provider: row.provider, model: row.model, calls: row.calls, input_tokens: row.input_tokens, output_tokens: row.output_tokens, total_tokens: row.total_tokens, latency: stats(row.latency), errors: row.errors }));
  const editorial = input.editorialInterventions ?? [];
  const topicCounts = countBy(editorial.map(row => row.topic).filter((value): value is string => Boolean(value)));
  const formatCounts = countBy(editorial.map(row => row.intervention_type).filter((value): value is string => Boolean(value)));
  const depthCounts = countBy(editorial.map(row => row.depth).filter((value): value is string => Boolean(value)));
  const experienceCounts = countBy(editorial.map(row => row.experience_type).filter((value): value is string => Boolean(value)));
  return {
    users: { total: users.length, active: usersActive, new: usersCreated, onboardingCompleted: eventCounts.onboarding_completed ?? 0, activityToday: usersToday, activeSubscriptions: input.activeSubscriptions },
    interventions: { requests: eventCounts.intervention_requested ?? 0, completed: completedExecutions, approved: approvedExecutions, delivered, failed: failedInterventions, noApproved, approvalRate: completedExecutions ? approvedExecutions / completedExecutions : null },
    generation: { attempts: attempts.length, candidatesGenerated, candidatesApproved, candidatesRejected, technicalRetries: attempts.filter(row => row.attempt_type === 'technical_retry').length, qualityRetries: attempts.filter(row => row.attempt_type === 'quality_retry').length },
    errors: { total: errorRows.length, breakdown: [...errorMap.values()].sort((a, b) => b.count - a.count) },
    performance: { execution: stats(durations), provider: providerLatency },
    engine: { executions: executions.length, approved: approvedExecutions, noApproved, failed: failedExecutions, rejectionLayers, executionHealth },
    feedback: { received: input.feedback, learningSignals: input.learningSignals },
    providerUsage: { calls: providerCalls.length, inputTokens: providerCalls.reduce((sum, row) => sum + numberOrZero(row.input_tokens), 0), outputTokens: providerCalls.reduce((sum, row) => sum + numberOrZero(row.output_tokens), 0), totalTokens: providerCalls.reduce((sum, row) => sum + numberOrZero(row.total_tokens), 0), latency: stats(providerCalls.map(row => numberOrZero(row.latency_ms)).filter(value => value > 0)), providers: providerSummary },
    events: eventSummary,
    editorial: { topics: Object.entries(topicCounts).sort((a, b) => b[1] - a[1]), formats: Object.entries(formatCounts).sort((a, b) => b[1] - a[1]), experiences: Object.entries(experienceCounts).sort((a, b) => b[1] - a[1]), depths: Object.entries(depthCounts).sort((a, b) => b[1] - a[1]) },
    available: ['users', 'executions', 'interventions', 'generation', 'errors', 'performance', 'feedback', 'learning_signals', 'provider_usage', 'event_log'],
    unavailable: ['AI cost', 'WhatsApp usage/cost', 'Infrastructure cost', 'MRR', 'Churn', 'Trial conversion'],
  };
}
