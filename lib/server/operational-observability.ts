import type { SupabaseClient } from '@supabase/supabase-js';
import { persistProviderCallCost } from './cost-ledger.ts';
import { createAdminClient } from '../supabase/admin.ts';

type DbClient = SupabaseClient;

function operationalClient(fallback: DbClient): DbClient {
  return process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL ? createAdminClient() : fallback;
}

export type ExecutionStatus = 'started' | 'generating' | 'auditing' | 'approved' | 'no_approved_intervention' | 'failed';
export type AttemptType = 'generation' | 'technical_retry' | 'quality_retry';
export type ProviderOperation = 'generation' | 'embedding' | 'semantic_judge' | 'llm_audit';

export type ExecutionContext = {
  executionId: string;
  requestId: string;
  userId: string;
  channel: 'web' | 'whatsapp';
  triggerSource: string;
  idempotencyKey?: string;
  startedAt: number;
};

export type ProviderUsage = {
  provider: string;
  model?: string;
  operation: ProviderOperation;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;
  cacheWriteTokens?: number;
  latencyMs?: number;
  status: 'success' | 'failed';
  errorCode?: string;
  errorMessage?: string;
};

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/Bearer\s+[^\s]+/gi, 'Bearer [redacted]').replace(/(api[_-]?key|authorization|token|secret)[^\s]*/gi, '[redacted]').slice(0, 500);
}

export function errorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('llm_empty_response')) return 'llm_empty_response';
  if (message.includes('llm_candidate_schema_invalid')) return 'llm_candidate_schema_invalid';
  if (message.includes('llm_http_429')) return 'provider_429';
  if (message.includes('llm_http_408') || message.includes('AbortError') || message.includes('aborted')) return 'provider_timeout';
  if (/llm_http_5\d\d/.test(message)) return 'provider_5xx';
  if (message.includes('embedding_')) return 'embedding_error';
  if (message.includes('semantic_judge')) return 'semantic_judge_error';
  if (message.includes('audit')) return 'audit_error';
  if (message.includes('candidate_save') || message.includes('intervention_save')) return 'persistence_error';
  if (message.includes('no_approved_intervention')) return 'no_approved_intervention';
  return message.slice(0, 100) || 'unknown_error';
}

export async function startExecutionRun(
  supabase: DbClient,
  input: { userId: string; channel: 'web' | 'whatsapp'; triggerSource: string; idempotencyKey?: string },
): Promise<ExecutionContext> {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const db = operationalClient(supabase);
  const { data, error } = await db.from('execution_runs').insert({
    user_id: input.userId,
    request_id: requestId,
    idempotency_key: input.idempotencyKey ?? null,
    channel: input.channel,
    trigger_source: input.triggerSource,
    status: 'started',
  }).select('id').single();
  if (error || !data) {
    console.error('[nia-execution-run-save-failed]', { code: error?.code, message: safeMessage(error?.message || 'no execution row returned'), details: safeMessage(error?.details || '') });
    throw new Error('execution_run_save_failed');
  }
  return { executionId: data.id, requestId, userId: input.userId, channel: input.channel, triggerSource: input.triggerSource, idempotencyKey: input.idempotencyKey, startedAt };
}

export async function updateExecutionRun(supabase: DbClient, context: ExecutionContext, input: { status: ExecutionStatus; interventionId?: string | null; failure?: unknown; candidateCount?: number; retryCount?: number; stageResults?: Record<string, unknown> }) {
  const failure = input.failure ? { failure_code: errorCode(input.failure), failure_message: safeMessage(input.failure) } : {};
  await operationalClient(supabase).from('execution_runs').update({
    status: input.status,
    intervention_id: input.interventionId ?? null,
    completed_at: input.status === 'started' || input.status === 'generating' || input.status === 'auditing' ? null : new Date().toISOString(),
    duration_ms: input.status === 'started' || input.status === 'generating' || input.status === 'auditing' ? null : Date.now() - context.startedAt,
    candidate_count: input.candidateCount,
    retry_count: input.retryCount,
    stage_results: input.stageResults,
    ...failure,
  }).eq('id', context.executionId).eq('user_id', context.userId);
}

export async function recordEvent(supabase: DbClient, input: { userId?: string; eventType: string; entityType?: string; entityId?: string; executionRunId?: string; metadata?: Record<string, unknown> }) {
  try {
    const { error } = await operationalClient(supabase).from('event_log').insert({ user_id: input.userId ?? null, event_type: input.eventType, entity_type: input.entityType ?? null, entity_id: input.entityId ?? null, execution_run_id: input.executionRunId ?? null, metadata: input.metadata ?? {} });
    if (error) console.error('[nia-event-log-failed]', error.message);
  } catch (error) { console.error('[nia-event-log-failed]', safeMessage(error)); }
}

export async function recordExecutionStage(supabase: DbClient, context: ExecutionContext, stage: string, result: Record<string, unknown>) {
  try {
    const db = operationalClient(supabase);
    const { data } = await db.from('execution_runs').select('stage_results').eq('id', context.executionId).eq('user_id', context.userId).single();
    const current = data?.stage_results && typeof data.stage_results === 'object' ? data.stage_results as Record<string, unknown> : {};
    const { error } = await db.from('execution_runs').update({ stage_results: { ...current, [stage]: result } }).eq('id', context.executionId).eq('user_id', context.userId);
    if (error) console.error('[nia-stage-log-failed]', error.message);
  } catch (error) { console.error('[nia-stage-log-failed]', safeMessage(error)); }
}

export async function startGenerationAttempt(supabase: DbClient, context: ExecutionContext, input: { attemptNumber: number; attemptType: AttemptType; provider?: string; model?: string }) {
  const startedAt = Date.now();
  const { data, error } = await operationalClient(supabase).from('generation_attempts').insert({ execution_run_id: context.executionId, attempt_number: input.attemptNumber, attempt_type: input.attemptType, provider: input.provider ?? null, model: input.model ?? null, status: 'started' }).select('id').single();
  if (error || !data) throw new Error('generation_attempt_save_failed');
  return { id: data.id as string, startedAt };
}

export async function finishGenerationAttempt(supabase: DbClient, attemptId: string, startedAt: number, input: { status: 'completed' | 'failed'; candidateCount?: number; approvedCandidateCount?: number; rejectionCount?: number; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }; error?: unknown }) {
  const failure = input.error ? { error_code: errorCode(input.error), error_message: safeMessage(input.error) } : {};
  await operationalClient(supabase).from('generation_attempts').update({ status: input.status, completed_at: new Date().toISOString(), duration_ms: Date.now() - startedAt, candidate_count: input.candidateCount ?? 0, approved_candidate_count: input.approvedCandidateCount ?? 0, rejection_count: input.rejectionCount ?? 0, input_tokens: input.usage?.inputTokens ?? null, output_tokens: input.usage?.outputTokens ?? null, total_tokens: input.usage?.totalTokens ?? null, ...failure }).eq('id', attemptId);
}

export async function recordProviderCall(supabase: DbClient, context: ExecutionContext, input: ProviderUsage & { generationAttemptId?: string }) {
  try {
    const { data, error } = await operationalClient(supabase).from('execution_provider_calls').insert({ execution_run_id: context.executionId, generation_attempt_id: input.generationAttemptId ?? null, provider: input.provider, model: input.model ?? null, operation: input.operation, input_tokens: input.inputTokens ?? null, cached_input_tokens: input.cachedInputTokens ?? null, cache_write_tokens: input.cacheWriteTokens ?? null, output_tokens: input.outputTokens ?? null, total_tokens: input.totalTokens ?? null, latency_ms: input.latencyMs ?? null, status: input.status, error_code: input.errorCode ?? null, error_message: input.errorMessage ? safeMessage(input.errorMessage) : null }).select('id,execution_run_id,provider,model,operation,input_tokens,cached_input_tokens,cache_write_tokens,output_tokens,total_tokens,created_at').single();
    if (error) console.error('[nia-provider-call-log-failed]', error.message);
    if (!error && data) {
      const db = operationalClient(supabase);
      await persistProviderCallCost(db, data);
    }
  } catch (error) { console.error('[nia-provider-call-log-failed]', safeMessage(error)); }
}

export async function recordAdminAudit(supabase: DbClient, input: { adminUserId: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown> }) {
  try {
    const { error } = await operationalClient(supabase).from('admin_audit_log').insert({ admin_user_id: input.adminUserId, action: input.action, target_type: input.targetType ?? null, target_id: input.targetId ?? null, metadata: input.metadata ?? {} });
    if (error) console.error('[nia-admin-audit-failed]', error.message);
  } catch (error) { console.error('[nia-admin-audit-failed]', safeMessage(error)); }
}

export { safeMessage };
