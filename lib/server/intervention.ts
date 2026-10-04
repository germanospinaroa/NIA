import { applyLearningSignals, auditCandidate, auditSemanticCandidate, canonicalConceptKey, feedbackFor, hasSufficientContext, interventionConfig, type CalibrationPrompt, type InterventionBrief, type InterventionCandidate, type InterventionResult, type LearningSignal } from '@/lib/intervention-engine';
import type { ContextKey } from '@/lib/mvp';
import type { SupabaseClient } from '@supabase/supabase-js';
import { auditCandidateWithLLMWithMeta, createEmbeddingWithMeta, generateCalibrationPrompt, generateCandidatesWithLLMWithMeta, llmConfigured, llmModel, embeddingModel, providerAttemptCount, recordInterventionGenerationFailure, type LlmAudit, type ProviderUsageSnapshot } from '@/lib/server/llm-intervention';
import { judgeSemanticRelationshipsWithMeta } from '@/lib/server/semantic-judge';
import { errorCode, recordEvent, recordExecutionStage, recordProviderCall, startGenerationAttempt, finishGenerationAttempt, updateExecutionRun, type ExecutionContext } from '@/lib/server/operational-observability';
import { intentionLabel, invalidIntention, validCustomIntention } from '@/lib/intention';
import { hasInterventionValue } from '@/lib/intervention-quality';
import { buildEditorialMemory, loadEditorialMemory } from '@/lib/server/editorial-memory';
import { planEditorial } from '@/lib/server/editorial-planner';
import type { EditorialSignature } from '@/lib/editorial-contract';
import { formulatePsychologicalIntervention } from '@/lib/psychological-contract';

type DbClient = SupabaseClient;
type HistoryRow = { id: string; text: string; function: string; concept: string; angle: string; structure: string; context_key: string | null; desired_change_snapshot: string | null; current_context_snapshot: string | null; audit_status: string; audit_results: Record<string, unknown>; created_at: string; execution_context?: 'production' | 'qa' | null; topic?: string | null; intervention_type?: string | null; depth?: string | null; blocks?: unknown; editorial_strategy?: string | null; editorial_reason?: string | null; editorial_take?: string | null; editorial_idea?: string | null; experience_type?: string | null; territory_key?: string | null; exercise_present?: boolean | null; question_present?: boolean | null; feedback_requested?: boolean | null; situation?: string | null; intention?: string | null; editorial_type?: string | null; insight_id?: string | null; functional_emotion?: string | null; directiveness?: string | null; closing_type?: string | null; action_id?: string | null; editorial_signature?: EditorialSignature | null; editorial_score?: Record<string, unknown> | null; gate_results?: Record<string, unknown> | null; same_day_repetition?: boolean | null; saturation_state?: string | null; regeneration_reason?: string | null; longitudinal_evidence_refs?: string[] | null; slot?: string | null; local_date?: string | null };
type SignalRow = LearningSignal & { user_id: string };

export class CalibrationRequiredError extends Error {
  calibration: CalibrationPrompt;
  constructor(calibration: CalibrationPrompt) { super('calibration_required'); this.name = 'CalibrationRequiredError'; this.calibration = calibration; }
}

function vectorLiteral(embedding: number[]) { return `[${embedding.join(',')}]`; }

function candidateFromRow(row: HistoryRow): InterventionCandidate {
  const signature = row.editorial_signature ?? {};
  return { text: row.text, topic: row.topic ?? undefined, interventionType: row.intervention_type as InterventionCandidate['interventionType'], depth: row.depth as InterventionCandidate['depth'], blocks: Array.isArray(row.blocks) ? row.blocks as InterventionCandidate['blocks'] : undefined, editorialTake: row.editorial_take ?? undefined, editorialIdea: row.editorial_idea ?? undefined, experienceType: row.experience_type as InterventionCandidate['experienceType'], territoryKey: row.territory_key ?? undefined, exercisePresent: row.exercise_present ?? undefined, questionPresent: row.question_present ?? undefined, feedbackRequested: row.feedback_requested ?? undefined, function: row.function as InterventionCandidate['function'], concept: row.concept, conceptKey: canonicalConceptKey(row.concept), angle: row.angle, structure: row.structure as InterventionCandidate['structure'], editorialType: row.editorial_type as InterventionCandidate['editorialType'], situation: row.situation ?? undefined, intention: row.intention ?? undefined, insightId: row.insight_id ?? undefined, functionalEmotion: row.functional_emotion as InterventionCandidate['functionalEmotion'], directiveness: row.directiveness as InterventionCandidate['directiveness'], closingType: row.closing_type as InterventionCandidate['closingType'], actionId: row.action_id ?? undefined, longitudinalEvidenceRefs: row.longitudinal_evidence_refs ?? undefined, mechanismId: signature.mechanismId ?? undefined, mechanismConfidence: signature.mechanismConfidence as InterventionCandidate['mechanismConfidence'], interventionPurpose: signature.interventionPurpose ?? undefined, psychologicalMove: signature.psychologicalMove ?? undefined, expectedMovement: signature.expectedMovement ?? undefined, takeaway: signature.takeaway ?? undefined, optionalAction: signature.optionalAction ?? null, whyNow: signature.whyNow ?? undefined, riskFlags: signature.riskFlags ?? undefined, editorialScore: row.editorial_score as InterventionCandidate['editorialScore'], gateResults: row.gate_results as InterventionCandidate['gateResults'], saturationState: row.saturation_state as InterventionCandidate['saturationState'] };
}

function relevantFallback(history: HistoryRow[], contextKey: ContextKey, currentContext: string, feedbackGoal?: InterventionBrief['feedbackGoal']): HistoryRow | null {
  if (feedbackGoal === 'specific_context' || feedbackGoal === 'new_wording' || feedbackGoal === 'new_angle') return null;
  const contextTokens = currentContext.toLowerCase().split(/\s+/).filter(token => token.length > 4);
  return history.find(row => hasInterventionValue(row.text) && row.audit_status === 'approved' && (row.context_key === contextKey || contextTokens.some(token => row.current_context_snapshot?.toLowerCase().includes(token)))) ?? null;
}

async function observe(supabase: DbClient, action: () => Promise<unknown>) {
  try { await action(); } catch (error) { console.error('[nia-observability-failed]', error instanceof Error ? error.message : String(error)); }
}

async function recordProviderSnapshots(supabase: DbClient, execution: ExecutionContext | undefined, snapshots: ProviderUsageSnapshot[], input: { generationAttemptId?: string; provider: string; model: string; operation: 'generation' | 'embedding' | 'semantic_judge' | 'llm_audit'; latencyMs: number; status: 'success' | 'failed'; errorCode?: string; errorMessage?: string }) {
  if (!execution) return;
  const perCallLatency = snapshots.length ? Math.round(input.latencyMs / snapshots.length) : input.latencyMs;
  const rows = snapshots.length ? snapshots : [{}];
  for (const usage of rows) await observe(supabase, () => recordProviderCall(supabase, execution, { generationAttemptId: input.generationAttemptId, provider: input.provider, model: input.model, operation: input.operation, inputTokens: usage.prompt_tokens, cachedInputTokens: usage.cached_input_tokens ?? (input.operation === 'embedding' ? 0 : undefined), cacheWriteTokens: usage.cache_write_tokens ?? (input.operation === 'embedding' ? 0 : undefined), outputTokens: usage.completion_tokens ?? (input.operation === 'embedding' ? 0 : undefined), totalTokens: usage.total_tokens, latencyMs: perCallLatency, status: input.status, errorCode: input.errorCode, errorMessage: input.errorMessage }));
}

async function recordFailedProviderAttempts(supabase: DbClient, execution: ExecutionContext | undefined, error: unknown, input: { generationAttemptId?: string; provider: string; model: string; operation: 'generation' | 'embedding' | 'semantic_judge' | 'llm_audit'; latencyMs?: number }) {
  if (!execution) return;
  const attempts = providerAttemptCount(error);
  for (let index = 0; index < attempts; index += 1) {
    const providerAttempt = index === 0 ? { id: input.generationAttemptId, startedAt: 0 } : await startGenerationAttempt(supabase, execution, { attemptNumber: 1, attemptType: 'technical_retry', provider: input.provider, model: input.model });
    await observe(supabase, () => recordProviderCall(supabase, execution, { generationAttemptId: providerAttempt.id, provider: input.provider, model: input.model, operation: input.operation, latencyMs: input.latencyMs, status: 'failed', errorCode: errorCode(error), errorMessage: error instanceof Error ? error.message : String(error) }));
    if (index > 0) await observe(supabase, () => finishGenerationAttempt(supabase, providerAttempt.id as string, providerAttempt.startedAt, { status: 'failed', error }));
  }
}

async function recordSuccessfulRetryFailures(supabase: DbClient, execution: ExecutionContext | undefined, count: number, input: { generationAttemptId?: string; provider: string; model: string; operation: 'generation' | 'semantic_judge' | 'llm_audit' }) {
  if (!execution) return;
  for (let index = 0; index < count; index += 1) {
    await observe(supabase, () => recordProviderCall(supabase, execution, { generationAttemptId: input.generationAttemptId, provider: input.provider, model: input.model, operation: input.operation, status: 'failed', errorCode: 'technical_retry_failed', errorMessage: 'technical retry failed before a subsequent attempt succeeded' }));
  }
}

async function deliverExisting(supabase: DbClient, row: HistoryRow, channel: 'web' | 'whatsapp', execution?: ExecutionContext) {
  await supabase.from('interventions').update({ status: 'delivered', delivered_at: new Date().toISOString(), channel }).eq('id', row.id);
  if (execution) await observe(supabase, () => recordEvent(supabase, { userId: execution.userId, eventType: 'intervention_delivered', entityType: 'intervention', entityId: row.id, executionRunId: execution.executionId, metadata: { reused: true, channel } }));
  const intervention = candidateFromRow(row);
  return { intervention, interventionId: row.id, feedback: feedbackFor(intervention), candidates: [] } satisfies InterventionResult;
}

export async function buildBrief(supabase: DbClient, userId: string, contextKey: ContextKey, slot?: string | null, localDate?: string | null): Promise<{ brief: InterventionBrief; history: HistoryRow[]; profile: Record<string, unknown> }> {
  void contextKey;
  const [{ data: profile, error: profileError }, { data: history }, { data: signals }, { data: contexts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('interventions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
    supabase.from('learning_signals').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('context_history').select('context_original,domain,status,created_at').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(20),
  ]);
  if (profileError || !profile) throw new Error('profile_unavailable');
  const rows = ((history ?? []) as HistoryRow[]).filter(row => row.execution_context !== 'qa');
  const rawSignals = (signals ?? []) as SignalRow[];
  const activeContext = typeof profile.current_context_original === 'string' ? profile.current_context_original.trim() : '';
  const directionKey = typeof profile.direction_key === 'string' ? profile.direction_key : '';
  const storedText = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const desiredChange = validCustomIntention(storedText) ? storedText : intentionLabel(directionKey) || '';
  if (!desiredChange || invalidIntention(desiredChange) || directionKey === 'intention_unclear' || !activeContext) throw new Error('profile_incomplete');
  const activeRows = rows.filter(row => !row.current_context_snapshot || row.current_context_snapshot === activeContext);
  const calibrationProfile = profile.learning_profile && typeof profile.learning_profile === 'object' ? (profile.learning_profile as Record<string, unknown>).calibration as Record<string, unknown> | undefined : undefined;
  const resolvedCalibrationAt = calibrationProfile?.status === 'resolved' && typeof calibrationProfile.resolved_at === 'string' ? new Date(calibrationProfile.resolved_at).getTime() : null;
  const effectiveSignals = resolvedCalibrationAt ? rawSignals.filter(signal => {
    const transitionSignal = (calibrationProfile?.reason === 'context_changed' && signal.signal === 'current_context_status') || (calibrationProfile?.reason === 'desired_change_changed' && signal.signal === 'desired_change_status');
    return !transitionSignal || !signal.created_at || new Date(signal.created_at).getTime() > resolvedCalibrationAt;
  }) : rawSignals;
  const brief: InterventionBrief = {
    firstName: profile.first_name,
    desiredChange,
    currentContext: activeContext,
    contextDomain: profile.current_context_domain,
    relevantSituations: (contexts ?? []).map(row => row.context_original).filter(Boolean),
    recurringPatterns: activeRows.slice(0, 8).map(row => `${row.concept}:${row.angle}`),
    userLanguage: [...(profile.desired_change_language ?? []), ...(profile.learning_profile?.userLanguage ?? [])],
    recentInterventions: activeRows.map(row => row.text),
    recentConcepts: activeRows.map(row => row.concept),
    recentAngles: activeRows.map(row => row.angle),
    recentStructures: activeRows.map(row => row.structure),
    recentEditorialIdeas: activeRows.map(row => row.editorial_idea).filter((value): value is string => Boolean(value)),
    recentEditorialTakes: activeRows.map(row => row.editorial_take).filter((value): value is string => Boolean(value)),
    recentExperienceTypes: activeRows.map(row => row.experience_type).filter((value): value is NonNullable<InterventionBrief['recentExperienceTypes']>[number] => Boolean(value)),
    successfulPatterns: [],
    rejectedPatterns: [],
    learningSignals: [],
    preferredLanguage: profile.learning_profile?.preferredLanguage ?? [],
    forbiddenLanguage: profile.learning_profile?.forbiddenLanguage ?? [],
    voiceStyle: profile.voice_style,
    interventionFunction: undefined,
    feedbackGoal: 'relevance',
    sameDayEditorialSignature: (() => { const sameDay = rows.find(row => localDate && row.local_date === localDate && row.slot && row.slot !== slot); return sameDay ? { topic: sameDay.topic, interventionType: sameDay.editorial_type, editorialTake: sameDay.editorial_take, editorialIdea: sameDay.editorial_idea, experienceType: sameDay.experience_type, functionalEmotion: sameDay.functional_emotion, directiveness: sameDay.directiveness, closingType: sameDay.closing_type, actionId: sameDay.action_id, insightId: sameDay.insight_id, structure: sameDay.structure } : undefined; })(),
  };
  const appliedBrief = applyLearningSignals(brief, effectiveSignals);
  let editorialMemory;
  try { editorialMemory = await loadEditorialMemory(supabase, userId); } catch { editorialMemory = buildEditorialMemory([]); }
  const relevantTopics = [profile.current_context_domain, ...(Array.isArray(profile.desired_change_concepts) ? profile.desired_change_concepts : [])].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  appliedBrief.communicationPreference = profile.communication_preference === 'idea' || profile.communication_preference === 'practical' || profile.communication_preference === 'structured' || profile.communication_preference === 'adaptive' ? profile.communication_preference : 'adaptive';
  appliedBrief.editorialPlan = planEditorial({ desiredChange, currentContext: activeContext, communicationPreference: appliedBrief.communicationPreference, memory: editorialMemory, relevantTopics, feedbackGoal: appliedBrief.feedbackGoal, rejectedPatterns: appliedBrief.rejectedPatterns });
  appliedBrief.psychologicalContract = formulatePsychologicalIntervention({ currentContext: activeContext, desiredChange, relevantSituations: appliedBrief.relevantSituations, recurringPatterns: appliedBrief.recurringPatterns, learningSignals: effectiveSignals });
  const calibration = calibrationProfile;
  const recalibratedRecently = calibration?.status === 'resolved' && (calibration.reason === 'context_changed' || calibration.reason === 'desired_change_changed') && typeof calibration.resolved_at === 'string' && Date.now() - new Date(calibration.resolved_at).getTime() < 24 * 60 * 60 * 1000;
  if (recalibratedRecently) appliedBrief.generationConstraints = [...new Set([...(appliedBrief.generationConstraints ?? []), 'Este contexto u objetivo acaba de ser confirmado. Prioriza el dato nuevo y evita repetir el concepto, ángulo o estructura de intervenciones anteriores.'])];
  return { brief: appliedBrief, history: rows, profile: profile as Record<string, unknown> };
}

async function persistCalibrationState(supabase: DbClient, userId: string, profile: Record<string, unknown>, calibration: CalibrationPrompt) {
  const currentLearningProfile = profile.learning_profile && typeof profile.learning_profile === 'object' ? profile.learning_profile as Record<string, unknown> : {};
  const { error } = await supabase.from('profiles').update({ learning_profile: { ...currentLearningProfile, calibration: { status: 'calibration_required', reason: calibration.reason, missing_context_field: calibration.missing_context_field, question: calibration.question, options: calibration.options, allow_free_text: true, created_at: new Date().toISOString() } } }).eq('id', userId);
  if (error) throw new Error('calibration_state_save_failed');
}

function retryBrief(brief: InterventionBrief, attempt: number) {
  if (attempt === 0) return brief;
  const constraints = [...(brief.generationConstraints ?? []), 'No cambies el desired_change ni inventes una dirección nueva.'];
  if (attempt >= 1) constraints.push('Ancla cada candidato a una situación concreta confirmada por la usuaria y usa detalles disponibles.');
  if (attempt >= 1 && brief.generationConstraints?.some(value => value.includes('acaba de ser confirmado'))) constraints.push('No repitas el concepto, ángulo ni estructura de las intervenciones anteriores; busca una formulación realmente distinta dentro del nuevo contexto.');
  if (attempt >= 2) constraints.push('Prioriza un comportamiento observable expresado por la usuaria; si no existe, no lo inventes.');
  return { ...brief, generationConstraints: [...new Set(constraints)] };
}

function enrichAudit(candidate: InterventionCandidate, deterministic: ReturnType<typeof auditCandidate>, semantic: ReturnType<typeof auditSemanticCandidate>, llm: LlmAudit) {
  const approved = deterministic.approved && semantic.approved && llm.approved;
  candidate.audit = {
    status: approved ? 'approved' : 'rejected', approved,
    reasons: [...deterministic.reasons, ...semantic.reasons, ...llm.reasons],
    hard_failures: [...deterministic.hard_failures, ...semantic.hard_failures, ...llm.reasons],
    warnings: [...deterministic.warnings, ...semantic.warnings],
    checks: { ...deterministic.checks, ...semantic.checks, llm_approved: llm.approved, llm_context_fit: llm.context_fit, llm_specificity: llm.specificity, llm_semantic_repetition: llm.semantic_repetition, llm_first_read_comprehension: llm.first_read_comprehension, llm_editorial_novelty: llm.editorial_novelty, llm_experience_novelty: llm.experience_novelty },
    similarInterventions: semantic.similarInterventions,
    similarity: semantic.similarity,
    semanticStatus: semantic.semanticStatus,
    similarityBand: semantic.similarityBand,
    semanticJudge: semantic.semanticJudge,
    deterministic,
    semantic,
    llm,
  };
}

function psychologicalSignature(candidate: InterventionCandidate, contract?: InterventionBrief['psychologicalContract']) {
  return {
    psychologicalContract: contract ?? null,
    mechanismId: candidate.mechanismId ?? null,
    mechanismConfidence: candidate.mechanismConfidence ?? null,
    interventionPurpose: candidate.interventionPurpose ?? null,
    psychologicalMove: candidate.psychologicalMove ?? null,
    expectedMovement: candidate.expectedMovement ?? null,
    takeaway: candidate.takeaway ?? null,
    optionalAction: candidate.optionalAction ?? null,
    whyNow: candidate.whyNow ?? null,
    riskFlags: candidate.riskFlags ?? [],
  };
}

async function persistRejectedCandidates(supabase: DbClient, userId: string, candidates: InterventionCandidate[], interventionId: string | null, executionContext: 'production' | 'qa' = 'production', contract?: InterventionBrief['psychologicalContract'], executionRunId?: string | null) {
  const rows = candidates.map(candidate => ({ intervention_id: interventionId, user_id: userId, execution_context: executionContext, candidate_text: candidate.text, function: candidate.function, concept: candidate.concept, angle: candidate.angle, structure: candidate.structure, topic: candidate.topic ?? null, intervention_type: candidate.interventionType ?? null, depth: candidate.depth ?? null, blocks: candidate.blocks ?? null, editorial_take: candidate.editorialTake ?? null, editorial_idea: candidate.editorialIdea ?? null, experience_type: candidate.experienceType ?? null, territory_key: candidate.territoryKey ?? null, exercise_present: candidate.exercisePresent ?? candidate.blocks?.some(block => block.type === 'step' || block.type === 'tool') ?? false, question_present: candidate.questionPresent ?? candidate.blocks?.some(block => block.type === 'question') ?? false, feedback_requested: candidate.feedbackRequested ?? candidate.experienceType === 'feedback_request', situation: candidate.situation ?? null, intention: candidate.intention ?? null, editorial_type: candidate.editorialType ?? null, insight_id: candidate.insightId ?? null, functional_emotion: candidate.functionalEmotion ?? null, directiveness: candidate.directiveness ?? null, closing_type: candidate.closingType ?? null, action_id: candidate.actionId ?? null, editorial_signature: { executionRunId: executionRunId ?? null, topic: candidate.topic, situation: candidate.situation, intention: candidate.intention, interventionType: candidate.editorialType, insightId: candidate.insightId, editorialTake: candidate.editorialTake, angle: candidate.angle, experienceType: candidate.experienceType, functionalEmotion: candidate.functionalEmotion, directiveness: candidate.directiveness, closingType: candidate.closingType, actionId: candidate.actionId, territoryKey: candidate.territoryKey, structure: candidate.structure, depth: candidate.depth, ...psychologicalSignature(candidate, contract) }, editorial_score: candidate.editorialScore ?? null, gate_results: candidate.gateResults ?? null, same_day_repetition: candidate.sameDayRepetition ?? null, saturation_state: candidate.saturationState ?? null, regeneration_reason: candidate.regenerationReason ?? null, longitudinal_evidence_refs: candidate.longitudinalEvidenceRefs ?? null, selected_candidate: candidate.audit?.approved ?? false, audit_results: candidate.audit ?? { status: 'rejected', approved: false, reasons: ['generation_failed'] }, rejection_reason: candidate.audit?.approved ? null : (candidate.audit?.reasons ?? ['generation_failed']).join(',') }));
  const { error } = await supabase.from('intervention_candidates').insert(rows);
  if (error) throw new Error('candidate_save_failed');
}

export async function resolveIntervention(supabase: DbClient, userId: string, contextKey: ContextKey, channel: 'web' | 'whatsapp' = 'web', idempotencyKey?: string, execution?: ExecutionContext, options?: { maxGenerationAttempts?: number; disableTechnicalGenerationRetry?: boolean; slot?: string | null; localDate?: string | null; executionContext?: 'production' | 'qa'; allowRelevantFallback?: boolean }): Promise<InterventionResult> {
  if (execution) {
    await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'intervention_requested', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { contextKey, channel, idempotencyKey: idempotencyKey ?? null } }));
    await observe(supabase, () => updateExecutionRun(supabase, execution, { status: 'generating' }));
  }
  if (idempotencyKey) {
    const { data: existing } = await supabase.from('interventions').select('*').eq('user_id', userId).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing) return deliverExisting(supabase, existing as HistoryRow, channel, execution);
  }
  const { brief, history, profile } = await buildBrief(supabase, userId, contextKey, options?.slot, options?.localDate);
  if (brief.feedbackGoal === 'recalibration') {
    const desiredChangeChanged = brief.learningSignals?.some(signal => signal.signal === 'desired_change_status' && typeof signal.value === 'object' && signal.value?.value === 'changed');
    const calibration = await generateCalibrationPrompt(brief, desiredChangeChanged ? 'desired_change_changed' : 'context_changed');
    await persistCalibrationState(supabase, userId, profile, calibration);
    throw new CalibrationRequiredError(calibration);
  }
  const contextSufficiency = hasSufficientContext(brief);
  if (!contextSufficiency.sufficient) {
    const calibration = await generateCalibrationPrompt(brief, brief.feedbackGoal === 'specific_context' ? 'too_general' : 'missing_context');
    await persistCalibrationState(supabase, userId, profile, calibration);
    throw new CalibrationRequiredError(calibration);
  }
  if (!brief.psychologicalContract?.sufficient) throw new Error('insufficient_intervention_basis');
  if (!llmConfigured()) {
    if (execution?.executionContext === 'qa') {
      const error = new Error('llm_not_configured');
      recordInterventionGenerationFailure(error, { userId, contextKey, channel });
      throw error;
    }
    const fallback = relevantFallback(history, contextKey, brief.currentContext, brief.feedbackGoal);
    if (fallback) return deliverExisting(supabase, fallback, channel, execution);
    const error = new Error('llm_not_configured_no_relevant_fallback');
    recordInterventionGenerationFailure(error, { userId, contextKey, channel });
    throw error;
  }
  const candidates: InterventionCandidate[] = [];
  let selected: InterventionCandidate | undefined;
  const configuredMaxAttempts = brief.feedbackGoal === 'specific_context' || brief.generationConstraints?.some(value => value.includes('acaba de ser confirmado')) ? interventionConfig.maxGenerationRounds : 1;
  const maxAttempts = options?.maxGenerationAttempts ?? configuredMaxAttempts;
  for (let attempt = 0; attempt < maxAttempts && !selected; attempt += 1) {
    const attemptBrief = retryBrief(brief, attempt);
    const generationAttempt = execution ? await startGenerationAttempt(supabase, execution, { attemptNumber: attempt + 1, attemptType: attempt === 0 ? 'generation' : 'quality_retry', provider: 'openai', model: llmModel() }) : null;
    if (execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'generation_started', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { attempt: attempt + 1, attemptType: attempt === 0 ? 'generation' : 'quality_retry' } }));
    let generated: InterventionCandidate[];
    let generationUsage: { inputTokens?: number; outputTokens?: number; totalTokens?: number } | undefined;
    try {
      const generationStarted = Date.now();
      const generation = await generateCandidatesWithLLMWithMeta(attemptBrief, { maxTechnicalAttempts: options?.disableTechnicalGenerationRetry ? 1 : undefined });
      generationUsage = { inputTokens: generation.usage.prompt_tokens, outputTokens: generation.usage.completion_tokens, totalTokens: generation.usage.total_tokens };
      generated = generation.candidates.map(candidate => ({ ...candidate, conceptKey: canonicalConceptKey(candidate.concept) }));
      if (execution) {
        await observe(supabase, () => recordExecutionStage(supabase, execution, 'generation', { duration_ms: Date.now() - generationStarted, candidate_count: generation.candidates.length, technical_retries: generation.technicalRetries, technical_failures: generation.technicalFailures, attempt: attempt + 1 }));
        await recordSuccessfulRetryFailures(supabase, execution, generation.technicalFailures, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'generation' });
        for (let callIndex = 0; callIndex < generation.callUsages.length; callIndex += 1) {
          const usage = generation.callUsages[callIndex] ?? {};
          const providerAttempt = callIndex === 0 ? generationAttempt : (execution ? await startGenerationAttempt(supabase, execution, { attemptNumber: attempt + 1, attemptType: 'technical_retry', provider: 'openai', model: llmModel() }) : null);
          await observe(supabase, () => recordProviderCall(supabase, execution, { generationAttemptId: providerAttempt?.id, provider: 'openai', model: llmModel(), operation: 'generation', inputTokens: usage.prompt_tokens, cachedInputTokens: usage.cached_input_tokens, cacheWriteTokens: usage.cache_write_tokens, outputTokens: usage.completion_tokens, totalTokens: usage.total_tokens, latencyMs: Math.round(generation.latencyMs / Math.max(1, generation.callUsages.length)), status: 'success' }));
          if (providerAttempt && callIndex > 0) await observe(supabase, () => finishGenerationAttempt(supabase, providerAttempt.id, providerAttempt.startedAt, { status: 'completed', usage: { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, totalTokens: usage.total_tokens } }));
        }
        if (generation.technicalRetries > 0) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'generation_technical_retry', executionRunId: execution.executionId, metadata: { attempt: attempt + 1, retries: generation.technicalRetries } }));
      }
    } catch (error) {
      if (generationAttempt) await observe(supabase, () => finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'failed', error }));
      await recordFailedProviderAttempts(supabase, execution, error, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'generation' });
      recordInterventionGenerationFailure(error, { userId, contextKey, channel, attempt: attempt + 1 });
      if (execution?.executionContext === 'qa') throw error;
      const fallback = options?.allowRelevantFallback === false ? null : relevantFallback(history, contextKey, brief.currentContext, brief.feedbackGoal);
      if (fallback) return deliverExisting(supabase, fallback, channel, execution);
      throw new Error('llm_generation_failed_no_relevant_fallback');
    }
    if (execution) await observe(supabase, () => updateExecutionRun(supabase, execution, { status: 'auditing', candidateCount: candidates.length + generated.length, retryCount: attempt }));
    const attemptCandidates: InterventionCandidate[] = [];
    const auditStarted = Date.now();
    for (const candidate of generated) {
      if (execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'candidate_generated', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { attempt: attempt + 1, candidateIndex: attemptCandidates.length } }));
      const deterministic = auditCandidate(candidate, {
        ...attemptBrief,
        recentEditorialIdeas: [
          ...(attemptBrief.recentEditorialIdeas ?? []),
          ...attemptCandidates.map(previous => previous.editorialIdea).filter((value): value is string => Boolean(value)),
        ],
      });
      if (!deterministic.approved) {
        candidate.audit = deterministic;
        attemptCandidates.push(candidate);
        if (execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'candidate_rejected', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { layer: 'deterministic', reasons: deterministic.reasons } }));
        continue;
      }
      let embedding: number[];
      try {
        const embeddingResult = await createEmbeddingWithMeta(candidate.text);
        embedding = embeddingResult.embedding;
        await recordProviderSnapshots(supabase, execution, [embeddingResult.usage ?? { completion_tokens: 0, cached_input_tokens: 0, cache_write_tokens: 0 }], { generationAttemptId: generationAttempt?.id, provider: 'openai', model: embeddingModel(), operation: 'embedding', latencyMs: embeddingResult.latencyMs, status: 'success' });
      } catch (error) {
        await recordFailedProviderAttempts(supabase, execution, error, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: embeddingModel(), operation: 'embedding' });
        if (generationAttempt) await observe(supabase, () => finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'failed', error }));
        recordInterventionGenerationFailure(error, { userId, contextKey, stage: 'embedding' });
        throw new Error('semantic_audit_unavailable');
      }
      const retrievalStarted = Date.now();
      const { data: matches, error: matchError } = await supabase.rpc('match_intervention_embeddings', { p_user_id: userId, p_query_embedding: vectorLiteral(embedding), p_limit: 3 });
      if (matchError) {
        if (generationAttempt) await observe(supabase, () => finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'failed', error: new Error('semantic_search_unavailable') }));
        throw new Error('semantic_search_unavailable');
      }
      const activeMatches = (matches ?? []).filter((match: { intervention_id?: string }) => {
        const historical = history.find(row => row.id === match.intervention_id);
        return !historical || !historical.current_context_snapshot || historical.current_context_snapshot === attemptBrief.currentContext;
      });
      if (execution) await observe(supabase, () => recordExecutionStage(supabase, execution, 'semantic_retrieval', { duration_ms: Date.now() - retrievalStarted, match_count: activeMatches.length, top_similarity: activeMatches[0]?.similarity ?? null }));
      let semanticJudge;
      try {
        const semanticJudgeStarted = Date.now();
        const semanticExecution = await judgeSemanticRelationshipsWithMeta(candidate, attemptBrief, activeMatches as Parameters<typeof judgeSemanticRelationshipsWithMeta>[2]);
        semanticJudge = semanticExecution.result;
        await recordSuccessfulRetryFailures(supabase, execution, semanticExecution.technicalFailures, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'semantic_judge' });
        await recordProviderSnapshots(supabase, execution, semanticExecution.callUsages, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'semantic_judge', latencyMs: semanticExecution.latencyMs || Date.now() - semanticJudgeStarted, status: 'success' });
      } catch (error) {
        await recordFailedProviderAttempts(supabase, execution, error, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'semantic_judge' });
        recordInterventionGenerationFailure(error, { userId, contextKey, stage: 'semantic_judge' });
        candidate.audit = { ...deterministic, status: 'rejected', approved: false, reasons: [...deterministic.reasons, 'semantic_judge_unavailable'], hard_failures: [...deterministic.hard_failures, 'semantic_judge_unavailable'], warnings: deterministic.warnings, checks: { ...deterministic.checks, semantic_judge_ran: false }, similarInterventions: [], similarity: 0, semanticStatus: 'fail', deterministic };
        attemptCandidates.push(candidate);
        continue;
      }
      const semantic = auditSemanticCandidate(candidate, activeMatches as Parameters<typeof auditSemanticCandidate>[1], semanticJudge);
      if (!semantic.approved) {
        candidate.audit = { ...deterministic, status: 'rejected', approved: false, reasons: [...deterministic.reasons, ...semantic.reasons], hard_failures: [...deterministic.hard_failures, ...semantic.hard_failures], warnings: [...deterministic.warnings, ...semantic.warnings], checks: { ...deterministic.checks, ...semantic.checks }, similarInterventions: semantic.similarInterventions, similarity: semantic.similarity, semanticStatus: semantic.semanticStatus, similarityBand: semantic.similarityBand, semanticJudge: semantic.semanticJudge, deterministic, semantic };
        attemptCandidates.push(candidate);
        if (execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'candidate_rejected', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { layer: 'semantic', reasons: semantic.reasons, similarity: semantic.similarity } }));
        continue;
      }
      try {
        const llmAudit = await auditCandidateWithLLMWithMeta(candidate, attemptBrief, activeMatches as Parameters<typeof auditCandidateWithLLMWithMeta>[2]);
        await recordSuccessfulRetryFailures(supabase, execution, llmAudit.technicalFailures, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'llm_audit' });
        await recordProviderSnapshots(supabase, execution, llmAudit.callUsages, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'llm_audit', latencyMs: llmAudit.latencyMs, status: 'success' });
        enrichAudit(candidate, deterministic, semantic, llmAudit.audit);
        if (!llmAudit.audit.approved && execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'candidate_rejected', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { layer: 'llm', reasons: llmAudit.audit.reasons } }));
      } catch (error) {
        await recordFailedProviderAttempts(supabase, execution, error, { generationAttemptId: generationAttempt?.id, provider: 'openai', model: llmModel(), operation: 'llm_audit' });
        recordInterventionGenerationFailure(error, { userId, contextKey, stage: 'llm_audit' });
        candidate.audit = { ...deterministic, status: 'rejected', approved: false, reasons: [...deterministic.reasons, 'llm_audit_unavailable'], hard_failures: [...deterministic.hard_failures, 'llm_audit_unavailable'], warnings: deterministic.warnings, checks: { ...deterministic.checks, llm_approved: false }, similarInterventions: [], similarity: 0, deterministic };
        if (execution) await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'candidate_rejected', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { layer: 'llm', reasons: ['llm_audit_unavailable'] } }));
      }
      attemptCandidates.push(candidate);
    }
    if (generationAttempt) await finishGenerationAttempt(supabase, generationAttempt.id, generationAttempt.startedAt, { status: 'completed', candidateCount: generated.length, approvedCandidateCount: attemptCandidates.filter(candidate => candidate.audit?.approved).length, rejectionCount: attemptCandidates.filter(candidate => !candidate.audit?.approved).length, usage: generationUsage });
    if (execution) await observe(supabase, () => recordExecutionStage(supabase, execution, 'auditing', { duration_ms: Date.now() - auditStarted, attempt: attempt + 1, candidate_count: attemptCandidates.length, approved_count: attemptCandidates.filter(candidate => candidate.audit?.approved).length, rejected_count: attemptCandidates.filter(candidate => !candidate.audit?.approved).length }));
    candidates.push(...attemptCandidates);
    selected = attemptCandidates.find(candidate => candidate.audit?.approved);
  }
  if (!selected) {
    await persistRejectedCandidates(supabase, userId, candidates, null, options?.executionContext ?? 'production', brief.psychologicalContract, execution?.executionId ?? null);
    if (execution) {
      await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'no_approved_intervention', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { candidateCount: candidates.length, retries: Math.max(0, maxAttempts - 1), rejectionReasons: candidates.flatMap(candidate => candidate.audit?.reasons ?? []), candidateRejections: candidates.map((candidate, index) => ({ index, approved: candidate.audit?.approved === true, rejectionReason: candidate.audit?.reasons ?? ['generation_failed'] })) } }));
      await observe(supabase, () => updateExecutionRun(supabase, execution, { status: 'no_approved_intervention', failure: new Error('no_approved_intervention'), candidateCount: candidates.length, retryCount: Math.max(0, maxAttempts - 1) }));
    }
    throw new Error('no_approved_intervention');
  }
  const persistenceStarted = Date.now();
  let selectedEmbedding: number[];
  try {
    const embeddingResult = await createEmbeddingWithMeta(selected.text);
    selectedEmbedding = embeddingResult.embedding;
    await recordProviderSnapshots(supabase, execution, [embeddingResult.usage ?? { completion_tokens: 0, cached_input_tokens: 0, cache_write_tokens: 0 }], { provider: 'openai', model: embeddingModel(), operation: 'embedding', latencyMs: embeddingResult.latencyMs, status: 'success' });
  } catch (error) {
    await recordFailedProviderAttempts(supabase, execution, error, { provider: 'openai', model: embeddingModel(), operation: 'embedding' });
    recordInterventionGenerationFailure(error, { userId, contextKey, stage: 'selected_embedding' });
    throw new Error('semantic_audit_unavailable');
  }
  const editorialSignature = { executionRunId: execution?.executionId ?? null, topic: selected.topic, situation: selected.situation ?? brief.currentContext, intention: selected.intention ?? brief.desiredChange, interventionType: selected.editorialType, insightId: selected.insightId, editorialTake: selected.editorialTake, angle: selected.angle, experienceType: selected.experienceType, functionalEmotion: selected.functionalEmotion, directiveness: selected.directiveness, closingType: selected.closingType, actionId: selected.actionId, territoryKey: selected.territoryKey ?? selected.topic, structure: selected.structure, depth: selected.depth, ...psychologicalSignature(selected, brief.psychologicalContract) };
  const { data: intervention, error: interventionError } = await supabase.from('interventions').insert({ user_id: userId, execution_context: options?.executionContext ?? execution?.executionContext ?? 'production', text: selected.text, function: selected.function, concept: selected.concept, angle: selected.angle, structure: selected.structure, topic: selected.topic ?? brief.editorialPlan?.recommended_topic ?? null, intervention_type: selected.interventionType ?? brief.editorialPlan?.preferred_or_recommended_intervention_type ?? null, depth: selected.depth ?? brief.editorialPlan?.recommended_depth ?? null, blocks: selected.blocks ?? null, editorial_take: selected.editorialTake ?? null, editorial_idea: selected.editorialIdea ?? null, experience_type: selected.experienceType ?? brief.editorialPlan?.recommended_experience_type ?? null, territory_key: selected.territoryKey ?? selected.topic ?? brief.editorialPlan?.recommended_topic ?? null, exercise_present: selected.exercisePresent ?? selected.blocks?.some(block => block.type === 'step' || block.type === 'tool') ?? false, question_present: selected.questionPresent ?? selected.blocks?.some(block => block.type === 'question') ?? false, feedback_requested: selected.feedbackRequested ?? selected.experienceType === 'feedback_request', situation: selected.situation ?? brief.currentContext, intention: selected.intention ?? brief.desiredChange, editorial_type: selected.editorialType ?? null, insight_id: selected.insightId ?? null, functional_emotion: selected.functionalEmotion ?? null, directiveness: selected.directiveness ?? null, closing_type: selected.closingType ?? null, action_id: selected.actionId ?? null, editorial_signature: editorialSignature, editorial_score: selected.editorialScore ?? null, gate_results: selected.gateResults ?? null, same_day_repetition: selected.sameDayRepetition ?? false, saturation_state: selected.saturationState ?? null, regeneration_reason: selected.regenerationReason ?? null, longitudinal_evidence_refs: selected.longitudinalEvidenceRefs ?? null, slot: options?.slot ?? null, local_date: options?.localDate ?? null, editorial_strategy: brief.editorialPlan?.strategy ?? 'continue_topic', editorial_reason: brief.editorialPlan?.topic_reason ?? null, context_key: contextKey, desired_change_snapshot: brief.desiredChange, current_context_snapshot: brief.currentContext, audit_status: 'approved', audit_results: selected.audit, channel, status: 'created', idempotency_key: idempotencyKey ?? null, embedding: vectorLiteral(selectedEmbedding) }).select('*').single();
  if (interventionError || !intervention) {
    if (idempotencyKey) { const { data: winner } = await supabase.from('interventions').select('*').eq('user_id', userId).eq('idempotency_key', idempotencyKey).maybeSingle(); if (winner) { const existing = candidateFromRow(winner as HistoryRow); return { intervention: existing, interventionId: winner.id, feedback: feedbackFor(existing), candidates: [] }; } }
    throw new Error('intervention_save_failed');
  }
  await persistRejectedCandidates(supabase, userId, candidates, intervention.id, options?.executionContext ?? execution?.executionContext ?? 'production', brief.psychologicalContract, execution?.executionId ?? null);
  await supabase.from('interventions').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', intervention.id).eq('user_id', userId);
  if (execution) {
    await observe(supabase, () => recordExecutionStage(supabase, execution, 'selection_persistence', { duration_ms: Date.now() - persistenceStarted, selected: true, intervention_id: intervention.id }));
    await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'intervention_approved', entityType: 'intervention', entityId: intervention.id, executionRunId: execution.executionId, metadata: { candidateCount: candidates.length } }));
    await observe(supabase, () => recordEvent(supabase, { userId, eventType: 'intervention_delivered', entityType: 'intervention', entityId: intervention.id, executionRunId: execution.executionId, metadata: { channel } }));
    await observe(supabase, () => updateExecutionRun(supabase, execution, { status: 'approved', interventionId: intervention.id, candidateCount: candidates.length, retryCount: Math.max(0, maxAttempts - 1) }));
  }
  return { intervention: selected, interventionId: intervention.id, feedback: feedbackFor(selected), candidates };
}

export { auditCandidate };
