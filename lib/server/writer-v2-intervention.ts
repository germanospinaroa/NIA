import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextKey } from '@/lib/mvp';
import { feedbackFor, type InterventionBrief, type InterventionCandidate, type InterventionResult } from '@/lib/intervention-engine';
import { applySemanticFidelity, evaluateWriterV2, generateWriterV2, repairGuidanceKeys, writerV2InputFromBrief, type WriterV2Evaluation } from '@/lib/server/writer-v2';
import { judgeSemanticFidelity, SEMANTIC_FIDELITY_MODEL } from '@/lib/server/semantic-fidelity-judge';
import { finishGenerationAttempt, recordEvent, recordExecutionStage, recordProviderCall, startGenerationAttempt, updateExecutionRun, type ExecutionContext } from '@/lib/server/operational-observability';
import { movementKey } from '@/lib/psychological-progression';
import type { ReceptionSnapshot } from '@/lib/server/reception-progression';
import { normalizedMessageHash } from '@/lib/recurrent-daily';

export const WRITER_V2_MODEL = 'gpt-6.1-sol';
export const WRITER_V2_MAX_ATTEMPTS = 2;

function estimatedCost(inputTokens = 0, outputTokens = 0) {
  return (inputTokens * 2 + outputTokens * 10) / 1_000_000;
}

function interventionType(brief: InterventionBrief): string {
  const type = brief.interventionBlueprint?.intervention_type;
  const mapped: Record<string, string> = { microaccion: 'tool', distincion: 'brief_insight', reencuadre: 'practical_guidance', pregunta_precision: 'brief_insight', preparacion_situacional: 'practical_guidance', interrupcion_breve: 'brief_insight', recuperacion_posterior: 'reflection', espejo_contextual: 'reflection', evidencia_longitudinal: 'brief_insight', recalibracion: 'reflection' };
  return (type && mapped[type]) || brief.editorialPlan?.preferred_or_recommended_intervention_type || 'brief_insight';
}

function candidateFromMessage(brief: InterventionBrief, message: string, audit: WriterV2Evaluation): InterventionCandidate {
  const blueprint = brief.interventionBlueprint;
  const contract = brief.psychologicalContract;
  const progression = brief.psychologicalProgression;
  const movement = brief.dailyPlan?.canonicalMovement ?? progression?.next_recommended_movement ?? blueprint?.movement ?? contract?.psychological_move ?? 'context_clarification';
  const type = interventionType(brief);
  const blueprintType = blueprint?.intervention_type ?? 'espejo_contextual';
  const functionByType: Record<string, string> = {
    distincion: 'distinguish', reencuadre: 'reframe', microaccion: 'anchor',
    preparacion_situacional: 'anticipate', pregunta_precision: 'redirect',
    espejo_contextual: 'remind', interrupcion_breve: 'interrupt',
    recuperacion_posterior: 'reframe', evidencia_longitudinal: 'remind', recalibracion: 'redirect',
  };
  const signatureKey = movementKey({ mechanismId: contract?.mechanism_id, psychologicalMovementKey: brief.dailyPlan?.canonicalMovement ?? progression?.next_recommended_movement ?? undefined, movement, takeaway: blueprint?.expected_movement, editorialIdea: blueprint?.insight, concept: movement, angle: brief.dailyPlan?.angle ?? blueprint?.intervention_reason });
  return {
    text: message,
    topic: brief.editorialPlan?.recommended_topic ?? brief.contextDomain ?? 'intervención',
    interventionType: type as InterventionCandidate['interventionType'],
    depth: brief.editorialPlan?.recommended_depth as InterventionCandidate['depth'],
    blocks: [{ type: 'idea', text: message }] as InterventionCandidate['blocks'],
    editorialTake: blueprint?.insight,
    editorialIdea: blueprint?.expected_movement,
    experienceType: brief.editorialPlan?.recommended_experience_type as InterventionCandidate['experienceType'],
    territoryKey: brief.contextDomain ?? brief.editorialPlan?.recommended_topic ?? undefined,
    exercisePresent: Boolean(blueprint?.micro_action),
    questionPresent: false,
    feedbackRequested: false,
    function: (functionByType[type] ?? 'reframe') as InterventionCandidate['function'],
    concept: movement,
    conceptKey: signatureKey ?? undefined,
    angle: brief.dailyPlan?.angle ?? blueprint?.intervention_reason ?? movement,
    structure: (blueprint?.micro_action ? 'before_then' : 'specific_permission') as InterventionCandidate['structure'],
    editorialType: ({ espejo_contextual: 'context_mirror', reencuadre: 'reframe', distincion: 'distinction', pregunta_precision: 'precision_question', preparacion_situacional: 'situational_preparation', microaccion: 'micro_action', interrupcion_breve: 'brief_interrupt', recuperacion_posterior: 'recovery', evidencia_longitudinal: 'longitudinal_evidence', recalibracion: 'recalibration' } as Record<string, string>)[blueprintType] as InterventionCandidate['editorialType'],
    signal: blueprint?.signal,
    movement,
    situation: contract?.situation ?? brief.currentContext,
    intention: brief.desiredChange,
    functionalEmotion: blueprint?.functional_emotion as InterventionCandidate['functionalEmotion'],
    directiveness: blueprint?.directiveness as InterventionCandidate['directiveness'],
    closingType: blueprint?.closing_type as InterventionCandidate['closingType'],
    actionId: blueprint?.action_id ?? undefined,
    mechanismId: contract?.mechanism_id,
    mechanismConfidence: contract?.mechanism_confidence,
    interventionPurpose: contract?.intervention_purpose,
    psychologicalMove: movement,
    expectedMovement: blueprint?.expected_movement ?? contract?.expected_movement,
    takeaway: blueprint?.insight ?? contract?.takeaway,
    optionalAction: blueprint?.micro_action ?? null,
    whyNow: contract?.why_now,
    riskFlags: contract?.risk_flags ?? [],
    interventionBlueprint: blueprint ?? null,
    sema: brief.sema ?? null,
    interventionMode: brief.dailyPlan?.interventionMode,
    interventionSignature: brief.dailyPlan?.interventionSignature,
    interventionDepth: brief.dailyPlan?.depth,
    psychologicalProgression: progression ? { approved: true, key: brief.dailyPlan?.canonicalMovement ?? progression.next_recommended_movement, reason: brief.dailyPlan?.reason ?? progression.progression_reason, validDeepening: false } : undefined,
    audit: { status: audit.approved ? 'approved' : 'rejected', approved: audit.approved, reasons: audit.hardFailures, hard_failures: audit.hardFailures, warnings: audit.warnings, checks: { writer_v2: true, critical_gates: audit.approved, semantic_fidelity_judge: Boolean(audit.semanticJudge) }, similarInterventions: [], similarity: 0, semanticFidelity: audit.semanticJudge },
  };
}

function candidateRow(candidate: InterventionCandidate, userId: string, execution: ExecutionContext | undefined, executionContext: 'production' | 'qa', selected: boolean, interventionId: string | null, contract?: InterventionBrief['psychologicalContract']) {
  const signature = {
    executionRunId: execution?.executionId ?? null,
    writerVersion: 'v2',
    topic: candidate.topic ?? null,
    situation: candidate.situation ?? null,
    intention: candidate.intention ?? null,
    interventionType: candidate.editorialType ?? null,
    psychologicalContract: contract ?? null,
    mechanismId: candidate.mechanismId ?? null,
    psychologicalMove: candidate.psychologicalMove ?? null,
    expectedMovement: candidate.expectedMovement ?? null,
    takeaway: candidate.takeaway ?? null,
    optionalAction: candidate.optionalAction ?? null,
    whyNow: candidate.whyNow ?? null,
    psychologicalMovementKey: candidate.conceptKey ?? null,
    interventionBlueprint: candidate.interventionBlueprint ?? null,
    sema: candidate.sema ?? null,
    interventionMode: candidate.interventionMode ?? null,
    interventionSignature: candidate.interventionSignature ?? null,
  };
  return {
    intervention_id: interventionId, user_id: userId, execution_context: executionContext,
    candidate_text: candidate.text, function: candidate.function, concept: candidate.concept,
    angle: candidate.angle, structure: candidate.structure, topic: candidate.topic ?? null,
    intervention_type: candidate.interventionType ?? null, depth: candidate.depth ?? null,
    blocks: candidate.blocks ?? null, editorial_take: candidate.editorialTake ?? null,
    editorial_idea: candidate.editorialIdea ?? null, experience_type: candidate.experienceType ?? null,
    territory_key: candidate.territoryKey ?? null, exercise_present: candidate.exercisePresent ?? false,
    question_present: candidate.questionPresent ?? false, feedback_requested: false,
    situation: candidate.situation ?? null, intention: candidate.intention ?? null,
    editorial_type: candidate.editorialType ?? null, insight_id: null,
    functional_emotion: candidate.functionalEmotion ?? null, directiveness: candidate.directiveness ?? null,
    closing_type: candidate.closingType ?? null, action_id: candidate.actionId ?? null,
    editorial_signature: signature, editorial_score: null, gate_results: null,
    same_day_repetition: false, saturation_state: null, regeneration_reason: null,
    longitudinal_evidence_refs: null, selected_candidate: selected,
    audit_results: candidate.audit, rejection_reason: candidate.audit?.approved ? null : (candidate.audit?.reasons ?? ['writer_v2_rejected']).join(','),
  };
}

export async function resolveWithWriterV2(input: {
  supabase: SupabaseClient;
  userId: string;
  contextKey: ContextKey;
  channel: 'web' | 'whatsapp';
  idempotencyKey?: string;
  execution?: ExecutionContext;
  executionContext?: 'production' | 'qa';
  slot?: string | null;
  localDate?: string | null;
  brief: InterventionBrief;
  reception?: ReceptionSnapshot;
}): Promise<InterventionResult> {
  const { supabase, userId, contextKey, channel, idempotencyKey, execution, brief } = input;
  const writerInput = writerV2InputFromBrief(brief, input.reception);
  if (!writerInput.firstName.trim()) throw new Error('personalization_identity_missing');
  const allCandidates: InterventionCandidate[] = [];
  let selected: InterventionCandidate | null = null;
  let totalInput = 0;
  let totalOutput = 0;
  let totalTokens = 0;
  let repairUsed = false;
  let lastReasons: string[] = [];
  let previousRejectedMessage: string | null = null;

  for (let attempt = 1; attempt <= WRITER_V2_MAX_ATTEMPTS; attempt += 1) {
    if (attempt > WRITER_V2_MAX_ATTEMPTS) throw new Error('writer_attempt_limit_exceeded');
    const generationAttempt = execution ? await startGenerationAttempt(supabase, execution, { attemptNumber: attempt, attemptType: attempt === 1 ? 'generation' : 'quality_retry', provider: 'openai', model: WRITER_V2_MODEL }) : null;
    const started = Date.now();
    await recordEvent(supabase, { userId, eventType: 'generation_started', entityType: 'execution_run', entityId: execution?.executionId, executionRunId: execution?.executionId, metadata: { writer_version: 'v2', model: WRITER_V2_MODEL, attempt } });
    try {
      const generated = await generateWriterV2(writerInput, { model: WRITER_V2_MODEL, maxOutputTokens: 320, repairReasons: lastReasons, previousRejectedMessage });
      const usage = { inputTokens: generated.usage?.prompt_tokens ?? 0, outputTokens: generated.usage?.completion_tokens ?? 0, totalTokens: generated.usage?.total_tokens ?? 0 };
      totalInput += usage.inputTokens; totalOutput += usage.outputTokens; totalTokens += usage.totalTokens;
      if (execution) await recordProviderCall(supabase, execution, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: WRITER_V2_MODEL, operation: 'generation', ...usage, latencyMs: Date.now() - started, status: 'success' });
      let evaluation = evaluateWriterV2(generated.message, writerInput);
      if (evaluation.hardFailures.length === 0) {
        const guidance = writerInput.targetMovementGuidance;
        if (!guidance) {
          evaluation = { ...evaluation, approved: false, hardFailures: [...evaluation.hardFailures, 'semantic_fidelity_guidance_missing'], deterministicHardFailures: [...evaluation.deterministicHardFailures, 'semantic_fidelity_guidance_missing'] };
        } else {
          const judgeStarted = Date.now();
          try {
            const judged = await judgeSemanticFidelity({
              addressName: writerInput.firstName,
              confirmedContext: writerInput.situation,
              desiredChange: writerInput.desiredChange,
              receptionStage: writerInput.receptionStage,
              timeOfDay: writerInput.timeOfDay,
              guidance,
              adjacentMovements: guidance.outOfScope,
              interventionMode: brief.dailyPlan?.interventionMode,
              angle: brief.dailyPlan?.angle,
              depth: brief.dailyPlan?.depth,
              newContribution: writerInput.newContribution,
              expectedTakeaway: writerInput.expectedTakeaway,
              previousDeliveredTakeaway: brief.psychologicalProgression?.continuity.previousDeliveredTakeaway,
              recentTakeaways: brief.recentEditorialTakes ?? [],
              priorContributions: (brief.movementExposures ?? []).flatMap(exposure => [exposure.newContribution, exposure.expectedTakeaway, exposure.takeaway]).filter((value): value is string => Boolean(value)),
              relatedSignatures: (brief.movementExposures ?? []).filter(exposure => exposure.canonicalMovement === guidance.target).map(exposure => exposure.interventionSignature).slice(0, 12),
              message: generated.message,
            });
            if (execution) await recordProviderCall(supabase, execution, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: SEMANTIC_FIDELITY_MODEL, operation: 'semantic_judge', inputTokens: judged.usage.prompt_tokens, outputTokens: judged.usage.completion_tokens, totalTokens: judged.usage.total_tokens, latencyMs: judged.latencyMs || Date.now() - judgeStarted, status: 'success' });
            evaluation = applySemanticFidelity(evaluation, judged.result);
          } catch (error) {
            if (execution) await recordProviderCall(supabase, execution, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: SEMANTIC_FIDELITY_MODEL, operation: 'semantic_judge', latencyMs: Date.now() - judgeStarted, status: 'failed', errorMessage: error instanceof Error ? error.message : String(error) });
            evaluation = { ...evaluation, approved: false, hardFailures: [...evaluation.hardFailures, 'semantic_fidelity_judge_unavailable'], deterministicHardFailures: [...evaluation.deterministicHardFailures, 'semantic_fidelity_judge_unavailable'] };
          }
        }
      }
      const candidate = candidateFromMessage(brief, generated.message, evaluation);
      allCandidates.push(candidate);
      lastReasons = evaluation.hardFailures;
      previousRejectedMessage = generated.message;
      if (generationAttempt) await finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'completed', candidateCount: 1, approvedCandidateCount: evaluation.approved ? 1 : 0, rejectionCount: evaluation.approved ? 0 : 1, usage });
      if (execution) {
        await recordExecutionStage(supabase, execution, 'generation', { status: 'completed', writer_version: 'v2', model: WRITER_V2_MODEL, attempt, candidate_count: 1, writer_attempts: attempt, input_tokens: totalInput, output_tokens: totalOutput, total_tokens: totalTokens, estimated_cost_usd: estimatedCost(totalInput, totalOutput), repair_used: attempt > 1, reception_stage: input.reception?.stage ?? null, psychological_interventions_delivered: input.reception?.psychologicalInterventionsDelivered ?? null, time_of_day: input.reception?.timeOfDay ?? null });
        await recordExecutionStage(supabase, execution, 'critical_gates', { status: evaluation.approved ? 'completed' : 'failed', hard_failures: evaluation.hardFailures, warnings: evaluation.warnings, writer_attempts: attempt });
      }
      if (evaluation.approved) { selected = candidate; repairUsed = attempt > 1; break; }
      await recordEvent(supabase, { userId, eventType: 'candidate_rejected', entityType: 'execution_run', entityId: execution?.executionId, executionRunId: execution?.executionId, metadata: { layer: 'writer_v2_critical_gates', reasons: evaluation.hardFailures, contract_version: 'nia_daily_v4', attempt, name_present: evaluation.namePresent, paragraph_count: evaluation.paragraphCount, char_count: evaluation.charCount, clarity: evaluation.semanticJudge?.immediate_clarity ?? null, personalization: evaluation.semanticJudge?.personalized ?? null } });
      if (attempt < WRITER_V2_MAX_ATTEMPTS) await recordEvent(supabase, { userId, eventType: 'writer_repair_requested', entityType: 'execution_run', entityId: execution?.executionId, executionRunId: execution?.executionId, metadata: { failure_codes: evaluation.hardFailures, repair_guidance_keys: repairGuidanceKeys(evaluation.hardFailures), attempt: attempt + 1, contract_version: 'nia_daily_v4' } });
      repairUsed = attempt === 2;
    } catch (error) {
      if (generationAttempt) await finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'failed', error });
      if (execution) await recordProviderCall(supabase, execution, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: WRITER_V2_MODEL, operation: 'generation', latencyMs: Date.now() - started, status: 'failed', errorMessage: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  const executionContext = input.executionContext ?? execution?.executionContext ?? 'production';
  if (!selected) {
    await supabase.from('intervention_candidates').insert(allCandidates.map(candidate => candidateRow(candidate, userId, execution, executionContext, false, null, brief.psychologicalContract)));
    if (execution) {
      await recordExecutionStage(supabase, execution, 'selection_persistence', { status: 'not_reached', writer_version: 'v2', writer_attempts: allCandidates.length, repair_used: repairUsed });
    await updateExecutionRun(supabase, execution, { status: 'no_approved_intervention', failure: new Error('no_approved_intervention_after_repair'), candidateCount: allCandidates.length, retryCount: Math.max(0, allCandidates.length - 1), stageResults: { writer_v2: { attempts: allCandidates.length, estimated_cost_usd: estimatedCost(totalInput, totalOutput) } } });
    }
    throw new Error('no_approved_intervention_after_repair');
  }

  const signature = { ...candidateRow(selected, userId, execution, executionContext, true, null, brief.psychologicalContract).editorial_signature, writerVersion: 'v2', model: WRITER_V2_MODEL, writerAttempts: allCandidates.length, inputTokens: totalInput, outputTokens: totalOutput, totalTokens, estimatedCostUsd: estimatedCost(totalInput, totalOutput), repairUsed };
  const { data: intervention, error } = await supabase.from('interventions').insert({
    user_id: userId, execution_context: executionContext, text: selected.text, function: selected.function,
    concept: selected.concept, angle: selected.angle, structure: selected.structure,
    topic: selected.topic, intervention_type: selected.interventionType, depth: selected.depth,
    blocks: selected.blocks, editorial_take: selected.editorialTake, editorial_idea: selected.editorialIdea,
    experience_type: selected.experienceType, territory_key: selected.territoryKey, exercise_present: selected.exercisePresent,
    question_present: selected.questionPresent, feedback_requested: false, situation: selected.situation,
    intention: selected.intention, editorial_type: selected.editorialType, functional_emotion: selected.functionalEmotion,
    directiveness: selected.directiveness, closing_type: selected.closingType, action_id: selected.actionId,
    editorial_signature: signature, audit_status: 'approved', audit_results: selected.audit, channel,
    normalized_message_hash: normalizedMessageHash(selected.text),
    status: 'delivered', delivered_at: new Date().toISOString(), idempotency_key: idempotencyKey ?? null,
    slot: input.slot ?? null, local_date: input.localDate ?? null, editorial_strategy: brief.editorialPlan?.strategy ?? 'continue_topic',
    editorial_reason: brief.editorialPlan?.topic_reason ?? null, context_key: contextKey,
    desired_change_snapshot: brief.desiredChange, current_context_snapshot: brief.currentContext,
  }).select('*').single();
  if (error || !intervention) throw new Error('intervention_save_failed');
  await supabase.from('intervention_candidates').insert(allCandidates.map(candidate => candidateRow(candidate, userId, execution, executionContext, candidate === selected, intervention.id, brief.psychologicalContract)));
  if (execution) await recordExecutionStage(supabase, execution, 'selection_persistence', { status: 'completed', intervention_id: intervention.id, writer_version: 'v2', writer_attempts: allCandidates.length, estimated_cost_usd: estimatedCost(totalInput, totalOutput) });
  await recordEvent(supabase, { userId, eventType: 'intervention_approved', entityType: 'intervention', entityId: intervention.id, executionRunId: execution?.executionId, metadata: { writer_version: 'v2', writer_attempts: allCandidates.length, repair_used: repairUsed } });
  if (execution) await updateExecutionRun(supabase, execution, { status: 'approved', interventionId: intervention.id, candidateCount: allCandidates.length, retryCount: Math.max(0, allCandidates.length - 1), stageResults: { writer_v2: { model: WRITER_V2_MODEL, writer_attempts: allCandidates.length, input_tokens: totalInput, output_tokens: totalOutput, total_tokens: totalTokens, estimated_cost_usd: estimatedCost(totalInput, totalOutput), repair_used: repairUsed } } });
  return { intervention: selected, interventionId: intervention.id, feedback: feedbackFor(selected), candidates: allCandidates };
}
