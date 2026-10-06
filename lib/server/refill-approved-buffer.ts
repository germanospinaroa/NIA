import type { SupabaseClient } from '@supabase/supabase-js';
import { buildBrief } from '@/lib/server/intervention';
import { generateWriterV2, evaluateWriterV2, writerV2InputFromBrief, applySemanticFidelity } from '@/lib/server/writer-v2';
import { judgeSemanticFidelity } from '@/lib/server/semantic-fidelity-judge';
import { getMovementTargetGuidance } from '@/lib/movement-expression';
import { contextVersion, hasExactMessageDuplicate, MIN_APPROVED_BUFFER_DAYS, normalizedMessageHash, planDailyIntervention, projectedReceptionStage, type ApprovedBufferItem, type ProspectiveLearning } from '@/lib/recurrent-daily';
import { storeApprovedMessage } from '@/lib/server/approved-message-buffer';
import { localDate } from '@/lib/server/whatsapp-schedule';

export const TARGET_BUFFER_DAYS = 5;
export const MIN_BUFFER_DAYS = MIN_APPROVED_BUFFER_DAYS;
export const DEFAULT_MAX_COST_USD = 0.03;
export const DEFAULT_REFILL_RUN_MAX_COST_USD = 0.15;

export type RefillPriority = 'critical' | 'urgent' | 'normal';

export type ProductionEligibilityRow = {
  userId: string;
  accountStatus: string | null;
  whatsappEnabled: boolean | null;
  whatsappConnected: boolean;
  subscriptionStatus: string | null;
};

export type RefillOrchestrationCandidate = { userId: string; bufferBefore: number };

export type RefillOrchestrationUserResult = {
  userId: string;
  bufferBefore: number;
  bufferAfter: number;
  created: number;
  skipped: string[];
  failureReason: string | null;
  estimatedCostUsd: number;
  priority: RefillPriority | null;
};

export type RefillOrchestrationResult = {
  users: RefillOrchestrationUserResult[];
  estimatedCostUsd: number;
  budgetExhausted: boolean;
};

export function isEligibleProductionUser(row: ProductionEligibilityRow) {
  return row.accountStatus === 'active' && row.whatsappEnabled === true && row.whatsappConnected && row.subscriptionStatus === 'active';
}

export function refillPriority(bufferBefore: number, minBufferDays = MIN_BUFFER_DAYS, targetBufferDays = TARGET_BUFFER_DAYS): RefillPriority | null {
  if (bufferBefore >= targetBufferDays) return null;
  if (bufferBefore === 0) return 'critical';
  if (bufferBefore < minBufferDays) return 'urgent';
  return 'normal';
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
  refill?: (userId: string, options: { minBufferDays: number; targetBufferDays: number; maxCostUsd: number }) => Promise<RefillResult>;
  onEvent?: (event: { userId?: string; eventType: string; metadata?: Record<string, unknown> }) => void | Promise<void>;
};

async function emitRefillEvent(options: RefillOrchestrationOptions, event: { userId?: string; eventType: string; metadata?: Record<string, unknown> }) {
  try { await options.onEvent?.(event); } catch { /* observability must not stop another user's refill */ }
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
    const priority = refillPriority(candidate.bufferBefore, minBufferDays, targetBufferDays);
    if (!priority) {
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter: candidate.bufferBefore, created: 0, skipped: ['buffer_at_target'], failureReason: null, estimatedCostUsd: 0, priority: null });
      continue;
    }
    await emitRefillEvent(options, { userId: candidate.userId, eventType: candidate.bufferBefore === 0 ? 'zero_buffer' : candidate.bufferBefore < minBufferDays ? 'below_min_buffer' : 'refill_started', metadata: { buffer_before: candidate.bufferBefore, priority } });
    const remainingBudget = globalMaxCostUsd - estimatedCostUsd;
    if (remainingBudget <= 0) {
      budgetExhausted = true;
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'budget_exhausted', metadata: { buffer_before: candidate.bufferBefore, priority } });
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter: candidate.bufferBefore, created: 0, skipped: ['budget_exhausted'], failureReason: null, estimatedCostUsd: 0, priority });
      continue;
    }
    try {
      const result = await refill(candidate.userId, { minBufferDays, targetBufferDays, maxCostUsd: Math.min(perUserMaxCostUsd, remainingBudget) });
      const cost = Number(result.usage.estimatedCostUsd || 0);
      estimatedCostUsd += cost;
      const created = result.created.length;
      const bufferAfter = Math.min(targetBufferDays, candidate.bufferBefore + created);
      if (estimatedCostUsd >= globalMaxCostUsd) budgetExhausted = true;
      await emitRefillEvent(options, { userId: candidate.userId, eventType: 'refill_completed', metadata: { buffer_before: candidate.bufferBefore, buffer_after: bufferAfter, created, priority, estimated_cost_usd: cost } });
      users.push({ userId: candidate.userId, bufferBefore: candidate.bufferBefore, bufferAfter, created, skipped: result.skipped, failureReason: null, estimatedCostUsd: cost, priority });
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
function futureDate(timezone: string | null | undefined, now: Date, offset: number) { return localDate(timezone, new Date(now.getTime() + offset * 86_400_000)); }

export async function refillEligibleProductionUsers(admin: SupabaseClient, options: RefillOrchestrationOptions & { now?: Date } = {}) {
  const { data: profiles, error: profileError } = await admin.from('profiles').select('id,account_status,whatsapp_enabled').eq('account_status', 'active').eq('whatsapp_enabled', true);
  if (profileError) throw new Error('refill_profiles_unavailable');
  const profileRows = (profiles ?? []) as Array<{ id: string; account_status: string | null; whatsapp_enabled: boolean | null }>;
  if (!profileRows.length) return { eligibleUsers: 0, ...await orchestrateRefillUsers([], options) };
  const userIds = profileRows.map(row => row.id);
  const [{ data: connections, error: connectionError }, { data: subscriptions, error: subscriptionError }, { data: bufferRows, error: bufferError }] = await Promise.all([
    admin.from('whatsapp_connections').select('user_id,wa_id,status').in('user_id', userIds).eq('status', 'connected'),
    admin.from('subscriptions').select('user_id,status').in('user_id', userIds).eq('status', 'active'),
    admin.from('approved_intervention_buffer').select('user_id').in('user_id', userIds).in('status', ['approved', 'buffered']),
  ]);
  if (connectionError) throw new Error('refill_connections_unavailable');
  if (subscriptionError) throw new Error('refill_subscriptions_unavailable');
  if (bufferError) throw new Error('refill_buffer_counts_unavailable');
  const connected = new Set((connections ?? []).filter(row => Boolean(row.wa_id)).map(row => row.user_id));
  const activeSubscription = new Set((subscriptions ?? []).map(row => row.user_id));
  const eligibility = profileRows.map(row => ({ userId: row.id, accountStatus: row.account_status, whatsappEnabled: row.whatsapp_enabled, whatsappConnected: connected.has(row.id), subscriptionStatus: activeSubscription.has(row.id) ? 'active' : null }));
  const eligibleIds = new Set(eligibility.filter(isEligibleProductionUser).map(row => row.userId));
  const counts = new Map<string, number>();
  for (const row of bufferRows ?? []) if (eligibleIds.has(row.user_id)) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  const candidates = [...eligibleIds].map(userId => ({ userId, bufferBefore: counts.get(userId) ?? 0 }));
  return {
    eligibleUsers: candidates.length,
    ...await orchestrateRefillUsers(candidates, {
      ...options,
      refill: (userId, refillOptions) => refillApprovedBuffer(admin, userId, { ...refillOptions, now: options.now }),
    }),
  };
}

export async function refillApprovedBuffer(admin: SupabaseClient, userId: string, options: { now?: Date; minBufferDays?: number; targetBufferDays?: number; maxCostUsd?: number; onUsage?: (record: RefillResult['usageRecords'][number]) => void | Promise<void> } = {}): Promise<RefillResult> {
  const now = options.now ?? new Date();
  const minBufferDays = options.minBufferDays ?? Number(process.env.MIN_BUFFER_DAYS || MIN_APPROVED_BUFFER_DAYS);
  const targetBufferDays = options.targetBufferDays ?? Number(process.env.TARGET_BUFFER_DAYS || TARGET_BUFFER_DAYS);
  const maxCostUsd = options.maxCostUsd ?? Number(process.env.REFILL_MAX_COST_USD || DEFAULT_MAX_COST_USD);
  const { data: profile, error: profileError } = await admin.from('profiles').select('id,timezone').eq('id', userId).single();
  if (profileError || !profile) throw new Error('refill_profile_unavailable');
  const { data: existing, error: existingError } = await admin.from('approved_intervention_buffer').select('*').eq('user_id', userId).neq('status', 'invalidated').order('intended_local_date', { ascending: true });
  if (existingError) throw new Error('refill_buffer_unavailable');
  const reservedRows = (existing ?? []).map(row => ({
    id: row.id,
    intendedLocalDate: row.intended_local_date,
    plan: row.plan,
    message: row.message,
    status: row.status,
    normalizedMessageHash: row.normalized_message_hash,
    interventionSignature: row.intervention_signature,
    contextVersion: row.context_version,
    createdAt: row.created_at,
  })) as ApprovedBufferItem[];
  const existingRows = reservedRows.filter(row => row.status === 'approved' || row.status === 'buffered');
  if (existingRows.length >= targetBufferDays) return { userId, minBufferDays, targetBufferDays, created: [], skipped: ['buffer_at_target'], calls: { writer: 0, judge: 0, repairs: 0 }, usage: { writerInput: 0, writerOutput: 0, judgeInput: 0, judgeOutput: 0, estimatedCostUsd: 0 }, usageRecords: [] };

  const { brief } = await buildBrief(admin, userId, 'intention');
  const deliveredExposures = brief.movementExposures ?? [];
  const plannedSignatures = new Set(reservedRows.map(row => row.interventionSignature));
  const created: ApprovedBufferItem[] = [];
  const skipped: string[] = [];
  const usage = { writerInput: 0, writerOutput: 0, judgeInput: 0, judgeOutput: 0, estimatedCostUsd: 0 };
  const calls = { writer: 0, judge: 0, repairs: 0 };
  const usageRecords: RefillResult['usageRecords'] = [];
  const recordUsage = async (record: RefillResult['usageRecords'][number]) => { usageRecords.push(record); await options.onUsage?.(record); };
  const historicalMessages = brief.recentInterventions ?? [];
  for (let offset = 1; existingRows.length + created.length < targetBufferDays; offset += 1) {
    // Reserve a conservative allowance for one Writer + one Judge before
    // starting an item. A repair is allowed only if the remaining budget can
    // pay for the second pair as well.
    if (usage.estimatedCostUsd + 0.005 > maxCostUsd) break;
    const intendedLocalDate = futureDate(typeof profile.timezone === 'string' ? profile.timezone : null, now, offset);
    if (existingRows.some(row => row.intendedLocalDate === intendedLocalDate) || created.some(row => row.intendedLocalDate === intendedLocalDate)) continue;
    const prospectiveLearning: ProspectiveLearning[] = [...existingRows, ...created].map(item => ({ bufferItemId: item.id ?? `planned:${item.intendedLocalDate}`, intendedLocalDate: item.intendedLocalDate, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.expectedTakeaway ?? item.plan.reason, message: item.message, interventionSignature: item.interventionSignature, newContribution: item.plan.newContribution, expectedTakeaway: item.plan.expectedTakeaway }));
    const planned = planDailyIntervention({ goal: brief.desiredChange, context: brief.currentContext, confirmedEvidence: brief.confirmedEvidence, mechanismId: brief.psychologicalContract?.mechanism_id ?? 'context_clarification', history: deliveredExposures.map(exposure => ({ mechanismId: brief.psychologicalContract?.mechanism_id, psychologicalMovementKey: exposure.canonicalMovement, movement: exposure.canonicalMovement, takeaway: exposure.takeaway, text: exposure.message })), exposures: deliveredExposures, plannedSignatures: [...plannedSignatures], prospectiveLearning, intendedLocalDate, projectedReceptionStage: projectedReceptionStage(deliveredExposures.length, prospectiveLearning.length) }).selected;
    if (plannedSignatures.has(planned.interventionSignature)) { skipped.push(`${intendedLocalDate}:signature_collision`); continue; }
    const nextBrief = { ...brief, dailyPlan: planned, recentInterventions: [...historicalMessages, ...created.map(item => item.message)] };
    const projectedStage = planned.projectedReceptionStage ?? projectedReceptionStage(deliveredExposures.length, prospectiveLearning.length);
    const input = writerV2InputFromBrief(nextBrief, { receptionStage: projectedStage, psychologicalInterventionsDelivered: deliveredExposures.length, timeOfDay: 'morning', receptionInstructions: [] });
    let generated = await generateWriterV2(input, { model: 'gpt-6.1-sol', maxOutputTokens: 240 });
    calls.writer += 1;
    usage.writerInput += generated.usage?.prompt_tokens ?? 0;
    usage.writerOutput += generated.usage?.completion_tokens ?? 0;
    usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
    await recordUsage({ model: 'gpt-6.1-sol', purpose: 'writer', intendedLocalDate, attempt: calls.repairs + 1, inputTokens: generated.usage?.prompt_tokens ?? 0, outputTokens: generated.usage?.completion_tokens ?? 0, estimatedCostUsd: estimatedWriterCost(generated.usage?.prompt_tokens ?? 0, generated.usage?.completion_tokens ?? 0) });
    let evaluation = evaluateWriterV2(generated.message, input);
    const guidance = getMovementTargetGuidance(planned.canonicalMovement);
    if (!guidance) { skipped.push(`${intendedLocalDate}:missing_movement_guidance`); continue; }
    const judge = async () => judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: projectedStage, timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: planned.interventionMode, angle: planned.angle, depth: planned.depth, newContribution: planned.newContribution, expectedTakeaway: planned.expectedTakeaway, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: [...(brief.recentEditorialTakes ?? []), ...prospectiveLearning.map(item => item.message)], priorContributions: [...deliveredExposures.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway]), ...prospectiveLearning.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway])].filter((value): value is string => Boolean(value)), relatedSignatures: [...plannedSignatures], message: generated.message });
    let judged = await judge();
    calls.judge += 1;
    usage.judgeInput += judged.usage.prompt_tokens ?? 0;
    usage.judgeOutput += judged.usage.completion_tokens ?? 0;
    await recordUsage({ model: 'gpt-6-luna', purpose: 'judge', intendedLocalDate, attempt: 1, inputTokens: judged.usage.prompt_tokens ?? 0, outputTokens: judged.usage.completion_tokens ?? 0, estimatedCostUsd: estimatedJudgeCost(judged.usage.prompt_tokens ?? 0, judged.usage.completion_tokens ?? 0) });
    usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
    evaluation = applySemanticFidelity(evaluation, judged.result);
    if (!evaluation.approved && usage.estimatedCostUsd + 0.005 <= maxCostUsd) {
      calls.repairs += 1;
      generated = await generateWriterV2(input, { model: 'gpt-6.1-sol', maxOutputTokens: 240, repairReasons: evaluation.hardFailures });
      calls.writer += 1;
      usage.writerInput += generated.usage?.prompt_tokens ?? 0;
      usage.writerOutput += generated.usage?.completion_tokens ?? 0;
      usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
      await recordUsage({ model: 'gpt-6.1-sol', purpose: 'writer', intendedLocalDate, attempt: 2, inputTokens: generated.usage?.prompt_tokens ?? 0, outputTokens: generated.usage?.completion_tokens ?? 0, estimatedCostUsd: estimatedWriterCost(generated.usage?.prompt_tokens ?? 0, generated.usage?.completion_tokens ?? 0) });
      evaluation = evaluateWriterV2(generated.message, input);
      judged = await judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: projectedStage, timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: planned.interventionMode, angle: planned.angle, depth: planned.depth, newContribution: planned.newContribution, expectedTakeaway: planned.expectedTakeaway, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: [...(brief.recentEditorialTakes ?? []), ...prospectiveLearning.map(item => item.message)], priorContributions: [...deliveredExposures.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway]), ...prospectiveLearning.flatMap(item => [item.newContribution, item.expectedTakeaway, item.takeaway])].filter((value): value is string => Boolean(value)), relatedSignatures: [...plannedSignatures], message: generated.message });
      calls.judge += 1;
      usage.judgeInput += judged.usage.prompt_tokens ?? 0;
      usage.judgeOutput += judged.usage.completion_tokens ?? 0;
      await recordUsage({ model: 'gpt-6-luna', purpose: 'judge', intendedLocalDate, attempt: 2, inputTokens: judged.usage.prompt_tokens ?? 0, outputTokens: judged.usage.completion_tokens ?? 0, estimatedCostUsd: estimatedJudgeCost(judged.usage.prompt_tokens ?? 0, judged.usage.completion_tokens ?? 0) });
      usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
      evaluation = applySemanticFidelity(evaluation, judged.result);
    }
    if (!evaluation.approved || hasExactMessageDuplicate(generated.message, [...historicalMessages, ...reservedRows, ...created.map(item => item.message)])) { skipped.push(`${intendedLocalDate}:${evaluation.hardFailures.join('|') || 'exact_message_duplicate'}`); if (usage.estimatedCostUsd > maxCostUsd) break; continue; }
    planned.semanticAudit = {
      target_expressed: judged.result.target_expressed,
      adjacent_drift: judged.result.adjacent_drift,
      movement_value: judged.result.movement_value,
      new_contribution_expressed: judged.result.new_contribution_expressed,
      same_actionable_teaching_as_prior: judged.result.same_actionable_teaching_as_prior,
      novel_contribution: judged.result.novel_contribution,
      semantic_redundancy: judged.result.semantic_redundancy,
    };
    const item = { user_id: userId, intended_local_date: intendedLocalDate, plan: planned, message: generated.message, status: 'buffered' as const, normalized_message_hash: normalizedMessageHash(generated.message), intervention_signature: planned.interventionSignature, context_version: contextVersion(brief.currentContext, brief.desiredChange) };
    const storedRow = await storeApprovedMessage(admin, item);
    const stored = {
      id: storedRow.id,
      intendedLocalDate: storedRow.intended_local_date,
      plan: storedRow.plan,
      message: storedRow.message,
      status: storedRow.status,
      normalizedMessageHash: storedRow.normalized_message_hash,
      interventionSignature: storedRow.intervention_signature,
      contextVersion: storedRow.context_version,
      createdAt: storedRow.created_at,
    } as ApprovedBufferItem;
    created.push(stored);
    plannedSignatures.add(planned.interventionSignature);
    if (usage.estimatedCostUsd > maxCostUsd) break;
  }
  if (existingRows.length < minBufferDays && created.length === 0) skipped.push('below_minimum_after_refill');
  return { userId, minBufferDays, targetBufferDays, created, skipped, calls, usage, usageRecords };
}
