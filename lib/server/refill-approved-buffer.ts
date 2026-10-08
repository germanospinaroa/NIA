import type { SupabaseClient } from '@supabase/supabase-js';
import { buildBrief } from '@/lib/server/intervention';
import { generateWriterV2, evaluateWriterV2, writerV2InputFromBrief, applySemanticFidelity } from '@/lib/server/writer-v2';
import { judgeSemanticFidelity } from '@/lib/server/semantic-fidelity-judge';
import { getMovementTargetGuidance } from '@/lib/movement-expression';
import { contextVersion, legacyContextVersion, normalizedMessageHash, planDailyIntervention, projectedReceptionStage, type ApprovedBufferItem } from '@/lib/recurrent-daily';
import { storeApprovedMessage } from '@/lib/server/approved-message-buffer';
import { localDate, nextPsychologicalDeliveryDate } from '@/lib/server/whatsapp-schedule';
import { chooseNextIntervention, type DailyDeliveryLifecycle } from '@/lib/server/next-intervention';
import { startIdempotentExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';

/** Product model: delivered history plus one future NEXT. */
export const TARGET_FUTURE_INTERVENTIONS = 1;
export const TARGET_BUFFER_DAYS = TARGET_FUTURE_INTERVENTIONS;
export const MIN_BUFFER_DAYS = TARGET_FUTURE_INTERVENTIONS;
export const DEFAULT_MAX_COST_USD = 0.03;
export const DEFAULT_REFILL_RUN_MAX_COST_USD = 0.15;
export const ELIGIBLE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;

export type RefillPriority = 'critical' | 'urgent' | 'normal';
export type ProductionEligibilityRow = { userId: string; accountStatus: string | null; whatsappEnabled: boolean | null; whatsappConnected: boolean; subscriptionStatus: string | null };
export type RefillOrchestrationCandidate = { userId: string; bufferBefore: number; requiredLocalDate?: string; requiredDateCovered?: boolean; refillStartDate?: string };
export type RefillOrchestrationUserResult = { userId: string; bufferBefore: number; bufferAfter: number; created: number; skipped: string[]; failureReason: string | null; estimatedCostUsd: number; priority: RefillPriority | null };
export type RefillOrchestrationResult = { users: RefillOrchestrationUserResult[]; estimatedCostUsd: number; budgetExhausted: boolean };

export function isEligibleProductionUser(row: ProductionEligibilityRow) {
  return row.accountStatus === 'active' && row.whatsappEnabled === true && row.whatsappConnected && ELIGIBLE_SUBSCRIPTION_STATUSES.includes(row.subscriptionStatus as typeof ELIGIBLE_SUBSCRIPTION_STATUSES[number]);
}

export function refillPriority(bufferBefore: number, _minBufferDays = MIN_BUFFER_DAYS, _targetBufferDays = TARGET_BUFFER_DAYS): RefillPriority | null {
  void _minBufferDays;
  void _targetBufferDays;
  return bufferBefore === 0 ? 'critical' : 'normal';
}

export type RefillResult = {
  userId: string;
  minBufferDays: number;
  targetBufferDays: number;
  created: ApprovedBufferItem[];
  skipped: string[];
  calls: { writer: number; judge: number; repairs: number };
  usage: { writerInput: number; writerOutput: number; judgeInput: number; judgeOutput: number; estimatedCostUsd: number };
  usageRecords: { model: string; purpose: 'writer' | 'judge'; intendedLocalDate: string; attempt: number; inputTokens: number; outputTokens: number; estimatedCostUsd: number }[];
};

type RefillOrchestrationOptions = {
  minBufferDays?: number;
  targetBufferDays?: number;
  perUserMaxCostUsd?: number;
  globalMaxCostUsd?: number;
  refill?: (userId: string, options: { minBufferDays: number; targetBufferDays: number; maxCostUsd: number; requiredLocalDate?: string; refillStartDate?: string; onEvent?: RefillOrchestrationOptions['onEvent'] }) => Promise<RefillResult>;
  onEvent?: (event: { userId?: string; eventType: string; metadata?: Record<string, unknown> }) => void | Promise<void>;
};

async function emitRefillEvent(options: RefillOrchestrationOptions, event: { userId?: string; eventType: string; metadata?: Record<string, unknown> }) {
  try { await options.onEvent?.(event); } catch { /* observability never blocks refill */ }
}

export async function orchestrateRefillUsers(candidates: RefillOrchestrationCandidate[], options: RefillOrchestrationOptions = {}): Promise<RefillOrchestrationResult> {
  const minBufferDays = options.minBufferDays ?? MIN_BUFFER_DAYS;
  const targetBufferDays = options.targetBufferDays ?? TARGET_BUFFER_DAYS;
  const perUserMaxCostUsd = options.perUserMaxCostUsd ?? DEFAULT_MAX_COST_USD;
  const globalMaxCostUsd = options.globalMaxCostUsd ?? Number(process.env.REFILL_RUN_MAX_COST_USD || DEFAULT_REFILL_RUN_MAX_COST_USD);
  const refill = options.refill ?? (async () => { throw new Error('refill_runner_not_configured'); });
  const users: RefillOrchestrationUserResult[] = [];
  let estimatedCostUsd = 0;
  let budgetExhausted = false;

  for (const candidate of candidates) {
    const priority: RefillPriority = candidate.bufferBefore === 0 || (candidate.requiredLocalDate && !candidate.requiredDateCovered) ? 'critical' : 'normal';
    const remainingBudget = globalMaxCostUsd - estimatedCostUsd;
    if (remainingBudget <= 0) {
      budgetExhausted = true;
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter: candidate.bufferBefore, created: 0, skipped: ['budget_exhausted'], failureReason: null, estimatedCostUsd: 0, priority });
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'budget_exhausted', metadata: { buffer_before: candidate.bufferBefore, priority } });
      continue;
    }
    await emitRefillEvent(options, { userId: candidate.userId, eventType: candidate.requiredLocalDate && !candidate.requiredDateCovered ? 'buffer_coverage_gap' : 'refill_started', metadata: { buffer_before: candidate.bufferBefore, priority, required_local_date: candidate.requiredLocalDate ?? null } });
    try {
      const result = await refill(candidate.userId, { minBufferDays, targetBufferDays, maxCostUsd: Math.min(perUserMaxCostUsd, remainingBudget), requiredLocalDate: candidate.requiredLocalDate, refillStartDate: candidate.refillStartDate, onEvent: options.onEvent });
      const cost = Number(result.usage.estimatedCostUsd || 0);
      estimatedCostUsd += cost;
      const bufferAfter = result.created.length ? 1 : Math.min(1, candidate.bufferBefore);
      const repaired = Boolean(candidate.requiredLocalDate && result.created.some(item => item.intendedLocalDate === candidate.requiredLocalDate));
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'refill_completed', metadata: { buffer_before: candidate.bufferBefore, buffer_after: bufferAfter, created: result.created.length, priority, estimated_cost_usd: cost } });
      if (repaired) await emitRefillEvent(options, { userId: candidate.userId, eventType: 'buffer_coverage_repaired', metadata: { required_local_date: candidate.requiredLocalDate, buffer_before: candidate.bufferBefore, buffer_after: bufferAfter } });
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'schedule_reconciled', metadata: { required_local_date: candidate.requiredLocalDate ?? null, buffer_after: bufferAfter, created: result.created.length } });
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter, created: result.created.length, skipped: result.skipped, failureReason: null, estimatedCostUsd: cost, priority });
    } catch (error) {
      const failureReason = error instanceof Error ? error.message : 'refill_failed';
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'refill_failed', metadata: { buffer_before: candidate.bufferBefore, priority, reason: failureReason } });
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter: candidate.bufferBefore, created: 0, skipped: [], failureReason, estimatedCostUsd: 0, priority });
    }
  }
  return { users, estimatedCostUsd, budgetExhausted };
}

function estimatedWriterCost(input = 0, output = 0) { return (input * 2 + output * 10) / 1_000_000; }
function estimatedJudgeCost(input = 0, output = 0) { return (input * 0.2 + output * 1) / 1_000_000; }
function emptyUsage() { return { writerInput: 0, writerOutput: 0, judgeInput: 0, judgeOutput: 0, estimatedCostUsd: 0 }; }
function emptyCalls() { return { writer: 0, judge: 0, repairs: 0 }; }

type DbBufferRow = { id: string; intended_local_date: string; plan: ApprovedBufferItem['plan']; message: string; status: ApprovedBufferItem['status']; normalized_message_hash: string; intervention_signature: string; context_version: string; created_at: string };

function rowToBufferItem(row: DbBufferRow): ApprovedBufferItem {
  return { id: row.id, intendedLocalDate: String(row.intended_local_date), plan: row.plan, message: row.message, status: row.status, normalizedMessageHash: row.normalized_message_hash, interventionSignature: row.intervention_signature, contextVersion: row.context_version, createdAt: row.created_at };
}

function deliveryLifecycle(rows: Array<{ status?: string | null }>): DailyDeliveryLifecycle {
  if (rows.some(row => row.status === 'sent')) return 'sent';
  if (rows.some(row => row.status === 'locked' || row.status === 'claimed')) return 'locked';
  if (rows.some(row => row.status === 'failed')) return 'failed';
  if (rows.length) return 'pending';
  return 'none';
}

async function dailyState(admin: SupabaseClient, userId: string, today: string) {
  const { data: interactions, error: interactionError } = await admin.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', today);
  if (interactionError) throw new Error('refill_daily_state_unavailable');
  const ids = (interactions ?? []).map(row => row.id);
  if (!ids.length) return { interaction: false, delivery: 'none' as DailyDeliveryLifecycle };
  const { data: deliveries, error: deliveryError } = await admin.from('whatsapp_daily_deliveries').select('status').in('interaction_id', ids);
  if (deliveryError) throw new Error('refill_daily_state_unavailable');
  return { interaction: true, delivery: deliveryLifecycle((deliveries ?? []) as Array<{ status?: string | null }>) };
}

async function invalidateRows(admin: SupabaseClient, userId: string, ids: string[], now: Date) {
  if (!ids.length) return;
  const { error } = await admin.from('approved_intervention_buffer').update({ status: 'invalidated', invalidated_at: now.toISOString() }).eq('user_id', userId).in('id', ids).in('status', ['approved', 'buffered']);
  if (error) throw new Error('schedule_buffer_repair_failed');
}

async function rescheduleRow(admin: SupabaseClient, userId: string, id: string, targetLocalDate: string) {
  const { data, error } = await admin.from('approved_intervention_buffer').update({ intended_local_date: targetLocalDate }).eq('user_id', userId).eq('id', id).in('status', ['approved', 'buffered']).select('*').single();
  if (error || !data) throw new Error('next_intervention_reschedule_failed');
  return rowToBufferItem(data);
}

async function refillWithProductionClaim(admin: SupabaseClient, userId: string, options: Parameters<typeof refillApprovedBuffer>[2] = {}) {
  const claim = await startIdempotentExecutionRun(admin, {
    userId,
    channel: 'whatsapp',
    triggerSource: 'buffer_refill',
    idempotencyKey: `buffer-refill:${userId}:${Date.now()}`,
    requestId: crypto.randomUUID(),
    executionContext: 'production',
    concurrencyKey: 'approved-buffer-next',
  });
  if (!claim.created) return { userId, minBufferDays: MIN_BUFFER_DAYS, targetBufferDays: TARGET_FUTURE_INTERVENTIONS, created: [], skipped: ['refill_in_progress'], calls: emptyCalls(), usage: emptyUsage(), usageRecords: [] } satisfies RefillResult;
  try {
    const result = await refillApprovedBuffer(admin, userId, options);
    await updateExecutionRun(admin, claim.context, { status: result.created.length ? 'approved' : 'no_approved_intervention', stageResults: { next: { created: result.created.length, skipped: result.skipped } } });
    return result;
  } catch (error) {
    await updateExecutionRun(admin, claim.context, { status: 'failed', failure: error });
    throw error;
  }
}

export async function refillEligibleProductionUsers(admin: SupabaseClient, options: RefillOrchestrationOptions & { now?: Date } = {}) {
  const now = options.now ?? new Date();
  const { data: profiles, error: profileError } = await admin.from('profiles').select('id,account_status,whatsapp_enabled,timezone,message_time_1,message_frequency,message_time_2').eq('account_status', 'active').eq('whatsapp_enabled', true);
  if (profileError) throw new Error('refill_profiles_unavailable');
  const profileRows = (profiles ?? []) as Array<{ id: string; account_status: string | null; whatsapp_enabled: boolean | null; timezone: string | null; message_time_1: string | null; message_frequency: number | null; message_time_2: string | null }>;
  if (!profileRows.length) return { eligibleUsers: 0, ...await orchestrateRefillUsers([], options) };
  const userIds = profileRows.map(row => row.id);
  const [{ data: connections, error: connectionError }, { data: subscriptions, error: subscriptionError }, { data: bufferRows, error: bufferError }] = await Promise.all([
    admin.from('whatsapp_connections').select('user_id,wa_id,status').in('user_id', userIds).eq('status', 'connected'),
    admin.from('subscriptions').select('user_id,status').in('user_id', userIds).in('status', [...ELIGIBLE_SUBSCRIPTION_STATUSES]),
    admin.from('approved_intervention_buffer').select('user_id,intended_local_date').in('user_id', userIds).in('status', ['approved', 'buffered']),
  ]);
  if (connectionError) throw new Error('refill_connections_unavailable');
  if (subscriptionError) throw new Error('refill_subscriptions_unavailable');
  if (bufferError) throw new Error('refill_buffer_counts_unavailable');
  const connected = new Set((connections ?? []).filter(row => Boolean(row.wa_id)).map(row => row.user_id));
  const subscriptionStatus = new Map((subscriptions ?? []).map(row => [row.user_id, row.status]));
  const eligibleIds = new Set(profileRows.map(row => ({ userId: row.id, accountStatus: row.account_status, whatsappEnabled: row.whatsapp_enabled, whatsappConnected: connected.has(row.id), subscriptionStatus: subscriptionStatus.get(row.id) ?? null })).filter(isEligibleProductionUser).map(row => row.userId));
  const counts = new Map<string, number>();
  for (const row of bufferRows ?? []) if (eligibleIds.has(row.user_id)) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  const candidates = [...eligibleIds].map(userId => ({ userId, bufferBefore: counts.get(userId) ?? 0 }));
  return { eligibleUsers: candidates.length, ...await orchestrateRefillUsers(candidates, { ...options, refill: (userId, refillOptions) => refillWithProductionClaim(admin, userId, { ...refillOptions, now }) }) };
}

export async function refillApprovedBuffer(admin: SupabaseClient, userId: string, options: { now?: Date; minBufferDays?: number; targetBufferDays?: number; maxCostUsd?: number; firstIntendedLocalDate?: string; requiredLocalDate?: string; refillStartDate?: string; fillFromFirstIntendedDate?: boolean; onUsage?: (record: RefillResult['usageRecords'][number]) => void | Promise<void>; onEvent?: RefillOrchestrationOptions['onEvent'] } = {}): Promise<RefillResult> {
  const now = options.now ?? new Date();
  const maxCostUsd = options.maxCostUsd ?? Number(process.env.REFILL_MAX_COST_USD || DEFAULT_MAX_COST_USD);
  const base = { userId, minBufferDays: MIN_BUFFER_DAYS, targetBufferDays: TARGET_FUTURE_INTERVENTIONS, created: [] as ApprovedBufferItem[], skipped: [] as string[], calls: emptyCalls(), usage: emptyUsage(), usageRecords: [] as RefillResult['usageRecords'] };
  const { data: profile, error: profileError } = await admin.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) throw new Error('refill_profile_unavailable');
  const today = localDate(profile.timezone, now);
  const { data: existing, error: existingError } = await admin.from('approved_intervention_buffer').select('*').eq('user_id', userId).neq('status', 'invalidated').order('intended_local_date', { ascending: true }).order('created_at', { ascending: true });
  if (existingError) throw new Error('refill_buffer_unavailable');
  const active = (existing ?? []).filter(row => row.status === 'approved' || row.status === 'buffered').map(rowToBufferItem);
  const state = await dailyState(admin, userId, today);
  const { brief } = await buildBrief(admin, userId, 'intention');
  const currentVersion = contextVersion(brief.currentContext, brief.desiredChange, { communicationPreference: brief.communicationPreference, voiceStyle: brief.voiceStyle, contextDomain: brief.contextDomain, concepts: (profile.desired_change_concepts as string[] | null | undefined) });
  const legacyVersion = legacyContextVersion(brief.currentContext, brief.desiredChange);
  const compatibleVersions = new Set([currentVersion, ...(brief.communicationPreference === 'adaptive' && !brief.voiceStyle ? [legacyVersion] : [])]);
  const preparationDate = nextPsychologicalDeliveryDate(profile, now, { alreadyDeliveredToday: state.delivery === 'sent', dailyInteractionToday: state.interaction });
  const decision = chooseNextIntervention({ today, schedule: profile, now, alreadyDeliveredToday: state.delivery === 'sent', dailyInteractionToday: state.interaction, dailyDelivery: state.delivery, currentContentVersion: currentVersion, activeRows: active.map(row => ({ id: row.id!, intendedLocalDate: row.intendedLocalDate, contextVersion: compatibleVersions.has(row.contextVersion) ? currentVersion : row.contextVersion, status: row.status as 'approved' | 'buffered', createdAt: row.createdAt })), preparationDate });
  await options.onEvent?.({ userId, eventType: decision.action === 'preserve' ? 'next_intervention_valid' : decision.action === 'reschedule' ? 'next_intervention_rescheduled' : decision.action === 'wait_for_delivery' ? 'next_intervention_waiting_for_delivery' : decision.invalidateIds.length ? 'next_intervention_stale' : 'next_intervention_missing', metadata: { intended_local_date: decision.targetLocalDate, content_version: currentVersion, reason: decision.reason } });
  if (decision.action === 'prepare' || decision.action === 'invalidate_and_prepare') await options.onEvent?.({ userId, eventType: 'buffer_coverage_gap', metadata: { required_local_date: decision.targetLocalDate, content_version: currentVersion, reason: decision.reason } });
  if (decision.invalidateIds.length) {
    await invalidateRows(admin, userId, decision.invalidateIds, now);
    await options.onEvent?.({ userId, eventType: 'next_intervention_invalidated', metadata: { count: decision.invalidateIds.length, reason: decision.reason, content_version: currentVersion } });
  }
  if (decision.action === 'wait_for_delivery') return { ...base, skipped: ['delivery_not_sent'] };
  if ((decision.action === 'preserve' || decision.action === 'reschedule') && decision.keepId) {
    const kept = active.find(row => row.id === decision.keepId);
    if (!kept) return { ...base, skipped: ['next_reconciliation_retry'] };
    const row = decision.action === 'reschedule' && decision.targetLocalDate && kept.intendedLocalDate !== decision.targetLocalDate ? await rescheduleRow(admin, userId, decision.keepId, decision.targetLocalDate) : kept;
    return { ...base, skipped: [decision.action === 'reschedule' ? 'next_intervention_rescheduled' : 'next_intervention_valid'], created: [row] };
  }
  const targetDate = decision.targetLocalDate ?? preparationDate;
  if (!targetDate) return { ...base, skipped: ['next_intervention_not_due'] };
  if (base.usage.estimatedCostUsd + 0.005 > maxCostUsd) return { ...base, skipped: ['refill_budget_exhausted'] };
  const deliveredExposures = brief.movementExposures ?? [];
  const planned = planDailyIntervention({ goal: brief.desiredChange, context: brief.currentContext, confirmedEvidence: brief.confirmedEvidence, mechanismId: brief.psychologicalContract?.mechanism_id ?? 'context_clarification', history: deliveredExposures.map(exposure => ({ mechanismId: brief.psychologicalContract?.mechanism_id, psychologicalMovementKey: exposure.canonicalMovement, movement: exposure.canonicalMovement, takeaway: exposure.takeaway, text: exposure.message })), exposures: deliveredExposures, plannedSignatures: [], prospectiveLearning: [], intendedLocalDate: targetDate, projectedReceptionStage: projectedReceptionStage(deliveredExposures.length, 0) }).selected;
  const nextPlan = { ...planned, dependsOnBufferItemId: null, conditionalOnBufferItemId: null };
  const guidance = getMovementTargetGuidance(nextPlan.canonicalMovement);
  if (!guidance) return { ...base, skipped: [`${targetDate}:missing_movement_guidance`] };
  const projectedStage = nextPlan.projectedReceptionStage ?? projectedReceptionStage(deliveredExposures.length, 0);
  const input = writerV2InputFromBrief({ ...brief, dailyPlan: nextPlan }, { receptionStage: projectedStage, psychologicalInterventionsDelivered: deliveredExposures.length, timeOfDay: 'morning', receptionInstructions: [] });
  let generated = await generateWriterV2(input, { model: 'gpt-6.1-sol', maxOutputTokens: 240 });
  base.calls.writer += 1;
  base.usage.writerInput += generated.usage?.prompt_tokens ?? 0;
  base.usage.writerOutput += generated.usage?.completion_tokens ?? 0;
  base.usage.estimatedCostUsd = estimatedWriterCost(base.usage.writerInput, base.usage.writerOutput);
  let evaluation = evaluateWriterV2(generated.message, input);
  let judged = await judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: projectedStage, timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: nextPlan.interventionMode, angle: nextPlan.angle, depth: nextPlan.depth, newContribution: nextPlan.newContribution, expectedTakeaway: nextPlan.expectedTakeaway, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: brief.recentEditorialTakes ?? [], priorContributions: deliveredExposures.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway]).filter((value): value is string => Boolean(value)), relatedSignatures: [], message: generated.message });
  base.calls.judge += 1;
  base.usage.judgeInput += judged.usage.prompt_tokens ?? 0;
  base.usage.judgeOutput += judged.usage.completion_tokens ?? 0;
  base.usage.estimatedCostUsd = estimatedWriterCost(base.usage.writerInput, base.usage.writerOutput) + estimatedJudgeCost(base.usage.judgeInput, base.usage.judgeOutput);
  evaluation = applySemanticFidelity(evaluation, judged.result);
  if (!evaluation.approved && base.usage.estimatedCostUsd + 0.005 <= maxCostUsd) {
    base.calls.repairs += 1;
    generated = await generateWriterV2(input, { model: 'gpt-6.1-sol', maxOutputTokens: 240, repairReasons: evaluation.hardFailures });
    base.calls.writer += 1;
    base.usage.writerInput += generated.usage?.prompt_tokens ?? 0;
    base.usage.writerOutput += generated.usage?.completion_tokens ?? 0;
    evaluation = evaluateWriterV2(generated.message, input);
    judged = await judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: projectedStage, timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: nextPlan.interventionMode, angle: nextPlan.angle, depth: nextPlan.depth, newContribution: nextPlan.newContribution, expectedTakeaway: nextPlan.expectedTakeaway, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: brief.recentEditorialTakes ?? [], priorContributions: deliveredExposures.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway]).filter((value): value is string => Boolean(value)), relatedSignatures: [], message: generated.message });
    base.calls.judge += 1;
    base.usage.judgeInput += judged.usage.prompt_tokens ?? 0;
    base.usage.judgeOutput += judged.usage.completion_tokens ?? 0;
    base.usage.estimatedCostUsd = estimatedWriterCost(base.usage.writerInput, base.usage.writerOutput) + estimatedJudgeCost(base.usage.judgeInput, base.usage.judgeOutput);
    evaluation = applySemanticFidelity(evaluation, judged.result);
  }
  if (!evaluation.approved) return { ...base, skipped: [`${targetDate}:${evaluation.hardFailures.join('|') || 'not_approved'}`] };
  nextPlan.semanticAudit = { target_expressed: judged.result.target_expressed, adjacent_drift: judged.result.adjacent_drift, movement_value: judged.result.movement_value, new_contribution_expressed: judged.result.new_contribution_expressed, same_actionable_teaching_as_prior: judged.result.same_actionable_teaching_as_prior, novel_contribution: judged.result.novel_contribution, semantic_redundancy: judged.result.semantic_redundancy };
  const item = { user_id: userId, intended_local_date: targetDate, plan: nextPlan, message: generated.message, status: 'buffered' as const, normalized_message_hash: normalizedMessageHash(generated.message), intervention_signature: nextPlan.interventionSignature, context_version: currentVersion };
  const storedRow = await storeApprovedMessage(admin, item);
  await options.onEvent?.({ userId, eventType: 'next_intervention_prepared', metadata: { intended_local_date: targetDate, content_version: currentVersion, reused: false } });
  await options.onEvent?.({ userId, eventType: 'buffer_coverage_repaired', metadata: { required_local_date: targetDate, content_version: currentVersion } });
  return { ...base, created: [rowToBufferItem(storedRow)], skipped: ['next_intervention_prepared'] };
}
