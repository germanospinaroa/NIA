import type { SupabaseClient } from '@supabase/supabase-js';
import { buildBrief } from '@/lib/server/intervention';
import { generateWriterV2, evaluateWriterV2, writerV2InputFromBrief, applySemanticFidelity } from '@/lib/server/writer-v2';
import { judgeSemanticFidelity } from '@/lib/server/semantic-fidelity-judge';
import { getMovementTargetGuidance } from '@/lib/movement-expression';
import { contextVersion, hasExactMessageDuplicate, MIN_APPROVED_BUFFER_DAYS, normalizedMessageHash, planDailyIntervention, projectedReceptionStage, type ApprovedBufferItem, type ProspectiveLearning } from '@/lib/recurrent-daily';
import { storeApprovedMessage } from '@/lib/server/approved-message-buffer';
import { localDate } from '@/lib/server/whatsapp-schedule';

const TARGET_BUFFER_DAYS = 5;
const DEFAULT_MAX_COST_USD = 0.03;

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

function estimatedWriterCost(input = 0, output = 0) { return (input * 2 + output * 10) / 1_000_000; }
function estimatedJudgeCost(input = 0, output = 0) { return (input * 0.2 + output * 1) / 1_000_000; }
function futureDate(timezone: string | null | undefined, now: Date, offset: number) { return localDate(timezone, new Date(now.getTime() + offset * 86_400_000)); }

export async function refillApprovedBuffer(admin: SupabaseClient, userId: string, options: { now?: Date; minBufferDays?: number; targetBufferDays?: number; maxCostUsd?: number; onUsage?: (record: RefillResult['usageRecords'][number]) => void | Promise<void> } = {}): Promise<RefillResult> {
  const now = options.now ?? new Date();
  const minBufferDays = options.minBufferDays ?? Number(process.env.MIN_BUFFER_DAYS || MIN_APPROVED_BUFFER_DAYS);
  const targetBufferDays = options.targetBufferDays ?? Number(process.env.TARGET_BUFFER_DAYS || TARGET_BUFFER_DAYS);
  const maxCostUsd = options.maxCostUsd ?? Number(process.env.REFILL_MAX_COST_USD || DEFAULT_MAX_COST_USD);
  const { data: profile, error: profileError } = await admin.from('profiles').select('id,timezone').eq('id', userId).single();
  if (profileError || !profile) throw new Error('refill_profile_unavailable');
  const { data: existing, error: existingError } = await admin.from('approved_intervention_buffer').select('*').eq('user_id', userId).in('status', ['approved', 'buffered']).order('intended_local_date', { ascending: true });
  if (existingError) throw new Error('refill_buffer_unavailable');
  const existingRows = (existing ?? []).map(row => ({
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
  if (existingRows.length >= targetBufferDays) return { userId, minBufferDays, targetBufferDays, created: [], skipped: ['buffer_at_target'], calls: { writer: 0, judge: 0, repairs: 0 }, usage: { writerInput: 0, writerOutput: 0, judgeInput: 0, judgeOutput: 0, estimatedCostUsd: 0 }, usageRecords: [] };

  const { brief } = await buildBrief(admin, userId, 'intention');
  const deliveredExposures = brief.movementExposures ?? [];
  const plannedSignatures = new Set(existingRows.map(row => row.interventionSignature));
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
    const prospectiveLearning: ProspectiveLearning[] = [...existingRows, ...created].map(item => ({ bufferItemId: item.id ?? `planned:${item.intendedLocalDate}`, intendedLocalDate: item.intendedLocalDate, canonicalMovement: item.plan.canonicalMovement, takeaway: item.plan.reason, message: item.message, interventionSignature: item.interventionSignature }));
    const planned = planDailyIntervention({ goal: brief.desiredChange, context: brief.currentContext, confirmedEvidence: brief.confirmedEvidence, mechanismId: brief.psychologicalContract?.mechanism_id ?? 'context_clarification', history: deliveredExposures.map(exposure => ({ mechanismId: brief.psychologicalContract?.mechanism_id, psychologicalMovementKey: exposure.canonicalMovement, movement: exposure.canonicalMovement, takeaway: exposure.takeaway, text: exposure.message })), exposures: deliveredExposures, plannedSignatures: [...plannedSignatures], prospectiveLearning, intendedLocalDate, projectedReceptionStage: projectedReceptionStage(deliveredExposures.length, prospectiveLearning.length) }).selected;
    if (plannedSignatures.has(planned.interventionSignature)) { skipped.push(`${intendedLocalDate}:signature_collision`); continue; }
    const nextBrief = { ...brief, dailyPlan: planned, recentInterventions: [...historicalMessages, ...created.map(item => item.message)] };
    const input = writerV2InputFromBrief(nextBrief, { receptionStage: 'established', psychologicalInterventionsDelivered: deliveredExposures.length, timeOfDay: 'morning', receptionInstructions: [] });
    let generated = await generateWriterV2(input, { model: 'gpt-6.1-sol', maxOutputTokens: 240 });
    calls.writer += 1;
    usage.writerInput += generated.usage?.prompt_tokens ?? 0;
    usage.writerOutput += generated.usage?.completion_tokens ?? 0;
    usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
    await recordUsage({ model: 'gpt-6.1-sol', purpose: 'writer', intendedLocalDate, attempt: calls.repairs + 1, inputTokens: generated.usage?.prompt_tokens ?? 0, outputTokens: generated.usage?.completion_tokens ?? 0, estimatedCostUsd: estimatedWriterCost(generated.usage?.prompt_tokens ?? 0, generated.usage?.completion_tokens ?? 0) });
    let evaluation = evaluateWriterV2(generated.message, input);
    const guidance = getMovementTargetGuidance(planned.canonicalMovement);
    if (!guidance) { skipped.push(`${intendedLocalDate}:missing_movement_guidance`); continue; }
    const judge = async () => judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: 'established', timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: planned.interventionMode, angle: planned.angle, depth: planned.depth, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: [...(brief.recentEditorialTakes ?? []), ...prospectiveLearning.map(item => item.message)], relatedSignatures: [...plannedSignatures], message: generated.message });
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
      judged = await judgeSemanticFidelity({ confirmedContext: brief.currentContext, desiredChange: brief.desiredChange, receptionStage: 'established', timeOfDay: 'morning', guidance, adjacentMovements: guidance.outOfScope, interventionMode: planned.interventionMode, angle: planned.angle, depth: planned.depth, previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway, recentTakeaways: [...(brief.recentEditorialTakes ?? []), ...prospectiveLearning.map(item => item.message)], relatedSignatures: [...plannedSignatures], message: generated.message });
      calls.judge += 1;
      usage.judgeInput += judged.usage.prompt_tokens ?? 0;
      usage.judgeOutput += judged.usage.completion_tokens ?? 0;
      await recordUsage({ model: 'gpt-6-luna', purpose: 'judge', intendedLocalDate, attempt: 2, inputTokens: judged.usage.prompt_tokens ?? 0, outputTokens: judged.usage.completion_tokens ?? 0, estimatedCostUsd: estimatedJudgeCost(judged.usage.prompt_tokens ?? 0, judged.usage.completion_tokens ?? 0) });
      usage.estimatedCostUsd = estimatedWriterCost(usage.writerInput, usage.writerOutput) + estimatedJudgeCost(usage.judgeInput, usage.judgeOutput);
      evaluation = applySemanticFidelity(evaluation, judged.result);
    }
    if (!evaluation.approved || hasExactMessageDuplicate(generated.message, [...historicalMessages, ...created.map(item => item.message)])) { skipped.push(`${intendedLocalDate}:${evaluation.hardFailures.join('|') || 'exact_message_duplicate'}`); if (usage.estimatedCostUsd > maxCostUsd) break; continue; }
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
