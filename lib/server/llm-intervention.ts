import type { CalibrationPrompt, InterventionBrief, InterventionCandidate, InterventionFunction, InterventionStructure, SemanticMatch } from '@/lib/intervention-engine';

type LlmCandidate = { text: string; function: InterventionFunction; concept: string; angle: string; structure: InterventionStructure };
export type LlmAudit = {
  context_fit: boolean; specificity: boolean; generic_motivation: boolean; chatbot_language: boolean; coaching_language: boolean; therapy_language: boolean; cliché: boolean; semantic_repetition: boolean; concept_repetition: boolean; structure_repetition: boolean; single_idea: boolean; natural_voice: boolean; unnecessary_advice: boolean; approved: boolean; reasons: string[];
};

const OPENAI_URL = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions';
export const candidateFunctions = ['remind', 'anticipate', 'reframe', 'distinguish', 'interrupt', 'permit', 'anchor', 'redirect'] as const;
export const candidateStructures = ['context_does_not_mean', 'before_then', 'you_can_without', 'distinguish_between', 'when_then', 'specific_permission'] as const;

export function llmConfigured() { return Boolean(process.env.OPENAI_API_KEY); }
export function embeddingsConfigured() { return Boolean(process.env.OPENAI_API_KEY); }
export function llmModel() { return process.env.OPENAI_MODEL || 'gpt-5-mini'; }
export function embeddingModel() { return process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'; }

export type StructuredUsage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; cached_input_tokens?: number; cache_write_tokens?: number };
export type ProviderUsageSnapshot = StructuredUsage;

function normalizeUsage(raw?: Record<string, unknown>): StructuredUsage | undefined {
  if (!raw) return undefined;
  const inputDetails = (raw.input_tokens_details ?? raw.prompt_tokens_details) as Record<string, unknown> | undefined;
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  return {
    prompt_tokens: number(raw.prompt_tokens ?? raw.input_tokens),
    completion_tokens: number(raw.completion_tokens ?? raw.output_tokens),
    total_tokens: number(raw.total_tokens),
    cached_input_tokens: number(inputDetails?.cached_tokens),
    cache_write_tokens: number(inputDetails?.cache_write_tokens),
  };
}
export async function requestStructuredJsonWithMeta(name: string, schema: Record<string, unknown>, system: string, user: string): Promise<{ value: unknown; usage?: StructuredUsage }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('llm_not_configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(OPENAI_URL, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: llmModel(), max_completion_tokens: 1200, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } } }) });
    if (!response.ok) throw new Error(`llm_http_${response.status}`);
    const payload = await response.json() as { choices?: { message?: { content?: string } }[]; usage?: Record<string, unknown> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('llm_empty_response');
    return { value: JSON.parse(content), usage: normalizeUsage(payload.usage) };
  } finally { clearTimeout(timeout); }
}
export async function requestStructuredJson(name: string, schema: Record<string, unknown>, system: string, user: string): Promise<unknown> {
  return (await requestStructuredJsonWithMeta(name, schema, system, user)).value;
}

async function withTechnicalJsonRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) { try { return await operation(); } catch (error) { lastError = error; } }
  throw lastError instanceof Error ? lastError : new Error('llm_invalid_json');
}

async function withTechnicalJsonRetryMeta<T>(operation: () => Promise<T>): Promise<{ value: T; calls: number; failedCalls: number }> {
  let lastError: unknown;
  let calls = 0;
  let failedCalls = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    calls += 1;
    try { return { value: await operation(), calls, failedCalls }; } catch (error) { lastError = error; failedCalls += 1; }
  }
  const failure = lastError instanceof Error ? lastError : new Error('llm_invalid_json');
  Object.assign(failure, { technicalAttempts: calls });
  throw failure;
}

export function providerAttemptCount(error: unknown) {
  const attempts = error && typeof error === 'object' && 'technicalAttempts' in error ? Number((error as { technicalAttempts?: unknown }).technicalAttempts) : 1;
  return Number.isInteger(attempts) && attempts > 0 ? attempts : 1;
}

function addUsage(target: StructuredUsage, source?: StructuredUsage) {
  for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'cached_input_tokens', 'cache_write_tokens'] as const) target[key] = (target[key] ?? 0) + (source?.[key] ?? 0);
}

const candidateSchema = { type: 'object', additionalProperties: false, required: ['candidates'], properties: { candidates: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['text', 'function', 'concept', 'angle', 'structure'], properties: { text: { type: 'string', minLength: 180, maxLength: 900 }, function: { type: 'string', enum: [...candidateFunctions] }, concept: { type: 'string', minLength: 2, maxLength: 120 }, angle: { type: 'string', minLength: 2, maxLength: 180 }, structure: { type: 'string', enum: [...candidateStructures] } } } } } };
const auditSchema = { type: 'object', additionalProperties: false, required: ['context_fit', 'specificity', 'generic_motivation', 'chatbot_language', 'coaching_language', 'therapy_language', 'cliché', 'semantic_repetition', 'concept_repetition', 'structure_repetition', 'single_idea', 'natural_voice', 'unnecessary_advice', 'approved', 'reasons'], properties: { context_fit: { type: 'boolean' }, specificity: { type: 'boolean' }, generic_motivation: { type: 'boolean' }, chatbot_language: { type: 'boolean' }, coaching_language: { type: 'boolean' }, therapy_language: { type: 'boolean' }, 'cliché': { type: 'boolean' }, semantic_repetition: { type: 'boolean' }, concept_repetition: { type: 'boolean' }, structure_repetition: { type: 'boolean' }, single_idea: { type: 'boolean' }, natural_voice: { type: 'boolean' }, unnecessary_advice: { type: 'boolean' }, approved: { type: 'boolean' }, reasons: { type: 'array', items: { type: 'string' } } } };
const calibrationSchema = { type: 'object', additionalProperties: false, required: ['question', 'options', 'allow_free_text', 'reason', 'missing_context_field'], properties: { question: { type: 'string', minLength: 12, maxLength: 180 }, options: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['id', 'label', 'context_value'], properties: { id: { type: 'string', minLength: 2, maxLength: 40 }, label: { type: 'string', minLength: 2, maxLength: 80 }, context_value: { type: 'string', minLength: 2, maxLength: 180 } } } }, allow_free_text: { type: 'boolean', const: true }, reason: { type: 'string', enum: ['too_general', 'missing_context', 'context_changed', 'desired_change_changed'] }, missing_context_field: { type: 'string', enum: ['current_context', 'active_context', 'relevant_situations', 'desired_change'] } } };

const system = `Eres el motor de mensajes de NIA. Cada candidato debe entregar valor utilizable después de cerrar WhatsApp, no una frase motivacional. Escribe un texto humano y específico de 70 a 150 palabras que incluya: reconocimiento de lo que la persona está trabajando, una explicación sencilla de lo que puede estar pasando, un insight que distinga dos cosas, una herramienta concreta con 2 o 3 pasos o preguntas, una acción pequeña para hoy y un cierre que transmita claridad o capacidad. Usa párrafos o viñetas para que se pueda leer. No inventes personas, lugares, trabajos, conflictos ni hechos personales. No hagas terapia, coaching ni claims clínicos. No uses frases genéricas, afirmaciones vacías ni introducciones de chatbot. No uses sostener, mantener tu dirección, volver a tu intención, honrar tu proceso, alinearte contigo ni equivalentes salvo que sean palabras de la usuaria. La situación debe estar confirmada por la usuaria. En el JSON, function y structure son identificadores internos cerrados. concept y angle son descripciones semánticas libres en español. Devuelve únicamente el JSON solicitado.`;

export function validateLlmCandidate(value: unknown): value is LlmCandidate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LlmCandidate>;
  return typeof candidate.text === 'string' && candidate.text.trim().length >= 180 && candidate.text.length <= 900 && typeof candidate.concept === 'string' && candidate.concept.trim().length >= 2 && typeof candidate.angle === 'string' && candidate.angle.trim().length >= 2 && candidateFunctions.includes(candidate.function as typeof candidateFunctions[number]) && candidateStructures.includes(candidate.structure as typeof candidateStructures[number]);
}

export async function generateCandidatesWithLLM(brief: InterventionBrief): Promise<InterventionCandidate[]> {
  return (await generateCandidatesWithLLMWithMeta(brief)).candidates;
}

export async function generateCandidatesWithLLMWithMeta(brief: InterventionBrief): Promise<{ candidates: InterventionCandidate[]; calls: number; technicalRetries: number; technicalFailures: number; usage: StructuredUsage; callUsages: ProviderUsageSnapshot[]; latencyMs: number }> {
  const started = Date.now();
  const usage: StructuredUsage = {};
  const callUsages: ProviderUsageSnapshot[] = [];
  const execution = await withTechnicalJsonRetryMeta(async () => {
    const response = await requestStructuredJsonWithMeta('nia_intervention_candidates', candidateSchema, system, `Construye exactamente 3 candidatos diferentes. Deben variar en ángulo y estructura, no ser paráfrasis. Cada uno debe cumplir la estructura de valor completa descrita en el sistema. Usa únicamente hechos y situaciones confirmados por la usuaria. Si el brief no contiene una situación concreta, no la inventes. Restricciones activas: ${(brief.generationConstraints ?? []).join(' | ') || 'ninguna adicional'}. Brief completo:\n${JSON.stringify(brief)}`);
    callUsages.push(response.usage ?? {});
    addUsage(usage, response.usage);
    const value = response.value as { candidates?: unknown };
    if (!Array.isArray(value.candidates) || value.candidates.length !== 3 || !value.candidates.every(validateLlmCandidate)) throw new Error('llm_candidate_schema_invalid');
    return value.candidates as LlmCandidate[];
  });
  return { candidates: execution.value.map(candidate => ({ ...candidate, audit: undefined })), calls: execution.calls, technicalRetries: execution.calls - 1, technicalFailures: execution.failedCalls, usage, callUsages, latencyMs: Date.now() - started };
}

export function validateCalibrationPrompt(value: unknown): value is CalibrationPrompt {
  if (!value || typeof value !== 'object') return false;
  const prompt = value as Partial<CalibrationPrompt>;
  return typeof prompt.question === 'string' && prompt.question.trim().length >= 12 && Array.isArray(prompt.options) && prompt.options.length >= 2 && prompt.options.length <= 4 && prompt.options.every(option => option && typeof option.id === 'string' && typeof option.label === 'string' && typeof option.context_value === 'string') && prompt.allow_free_text === true && (prompt.reason === 'too_general' || prompt.reason === 'missing_context' || prompt.reason === 'context_changed' || prompt.reason === 'desired_change_changed') && (prompt.missing_context_field === 'current_context' || prompt.missing_context_field === 'active_context' || prompt.missing_context_field === 'relevant_situations' || prompt.missing_context_field === 'desired_change');
}

export async function generateCalibrationPrompt(brief: InterventionBrief, reason: CalibrationPrompt['reason']): Promise<CalibrationPrompt> {
  const value = await withTechnicalJsonRetry(async () => {
    const result = await requestStructuredJson('nia_calibration_prompt', calibrationSchema, system, `Genera una única pregunta breve para obtener el dato mínimo que falta. No aconsejes, no motives y no hagas coaching. No asumas que ninguna opción describe a la usuaria: preséntalas como posibilidades. Devuelve entre 2 y 4 opciones distinguibles y siempre permite texto libre. Si el motivo es context_changed, el contexto anterior ya no debe tratarse como actual. Si el motivo es desired_change_changed, el objetivo anterior ya no debe tratarse como activo. Objetivo actual: ${brief.desiredChange}. Contexto actual confirmado: ${brief.currentContext || 'no confirmado'}. Situaciones conocidas: ${JSON.stringify(brief.relevantSituations ?? [])}. Motivo: ${reason}.`) as CalibrationPrompt;
    if (!validateCalibrationPrompt(result)) throw new Error('calibration_prompt_schema_invalid');
    const missing_context_field = reason === 'context_changed' ? 'active_context' : reason === 'desired_change_changed' ? 'desired_change' : result.missing_context_field;
    return { ...result, reason, missing_context_field };
  });
  return value;
}

export async function auditCandidateWithLLM(candidate: InterventionCandidate, brief: InterventionBrief, semanticMatches: SemanticMatch[] = []): Promise<LlmAudit> {
  return (await auditCandidateWithLLMWithMeta(candidate, brief, semanticMatches)).audit;
}

export async function auditCandidateWithLLMWithMeta(candidate: InterventionCandidate, brief: InterventionBrief, semanticMatches: SemanticMatch[] = []): Promise<{ audit: LlmAudit; calls: number; technicalRetries: number; technicalFailures: number; usage: StructuredUsage; callUsages: ProviderUsageSnapshot[]; latencyMs: number }> {
  const started = Date.now();
  const usage: StructuredUsage = {};
  const callUsages: ProviderUsageSnapshot[] = [];
  const execution = await withTechnicalJsonRetryMeta(async () => {
    const response = await requestStructuredJsonWithMeta('nia_intervention_audit', auditSchema, system, `Audita este candidato. Aprueba únicamente si todas las dimensiones pasan. No compenses un fallo grave con otro check. No exijas detalles personales que la usuaria no proporcionó: si solo confirmó un ámbito como pareja, trabajo o familia, puedes evaluar una intervención breve anclada a ese ámbito. Rechaza únicamente cuando el candidato presente como hechos datos no confirmados (por ejemplo, conflictos, personas, frases o decisiones concretas no mencionadas).\nBrief:\n${JSON.stringify({ desired_change: brief.desiredChange, current_context: brief.currentContext, relevant_context: brief.relevantSituations, candidate, recent_interventions: brief.recentInterventions, semantic_matches: semanticMatches, recent_concepts: brief.recentConcepts, recent_structures: brief.recentStructures })}`);
    callUsages.push(response.usage ?? {});
    addUsage(usage, response.usage);
    const value = response.value as LlmAudit;
    if (!value || typeof value.approved !== 'boolean' || !Array.isArray(value.reasons) || typeof value.context_fit !== 'boolean' || typeof value.specificity !== 'boolean') throw new Error('llm_audit_schema_invalid');
    return value;
  });
  return { audit: execution.value, calls: execution.calls, technicalRetries: execution.calls - 1, technicalFailures: execution.failedCalls, usage, callUsages, latencyMs: Date.now() - started };
}

export async function createEmbedding(input: string): Promise<number[]> {
  return (await createEmbeddingWithMeta(input)).embedding;
}

export async function createEmbeddingWithMeta(input: string): Promise<{ embedding: number[]; usage?: StructuredUsage; latencyMs: number }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('embeddings_not_configured');
  const started = Date.now();
  const response = await fetch('https://api.openai.com/v1/embeddings', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: embeddingModel(), input }) });
  if (!response.ok) throw new Error(`embeddings_http_${response.status}`);
  const payload = await response.json() as { data?: { embedding?: number[] }[]; usage?: Record<string, unknown> };
  const embedding = payload.data?.[0]?.embedding;
  if (!embedding?.length) throw new Error('embedding_empty');
  return { embedding, usage: normalizeUsage(payload.usage), latencyMs: Date.now() - started };
}

export function recordInterventionGenerationFailure(error: unknown, context: Record<string, unknown>) {
  console.error('[nia-intervention-generation-failed]', { error: error instanceof Error ? error.message : String(error), ...context });
}
