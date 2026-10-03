import { formatCandidateText } from '../intervention-engine.ts';
import type { CalibrationPrompt, InterventionBrief, InterventionCandidate, InterventionFunction, InterventionStructure, SemanticMatch } from '../intervention-engine.ts';

export type LlmCandidate = {
  recognition: string;
  explanation: string;
  insight: string;
  steps: string[];
  action: string;
  closing: string;
  function: InterventionFunction;
  concept: string;
  angle: string;
  structure: InterventionStructure;
};
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
type LlmError = Error & { status?: number; code?: string; retryable?: boolean; technicalAttempts?: number; providerMeta?: Record<string, unknown> };

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
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 30_000);
  try {
    let response: Response;
    try {
      response = await fetch(OPENAI_URL, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: llmModel(), max_completion_tokens: 2400, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } } }) });
    } catch {
      const networkError = new Error(timedOut ? 'llm_timeout' : 'llm_network_error') as LlmError;
      networkError.code = timedOut ? 'llm_timeout' : 'llm_network_error';
      networkError.retryable = true;
      throw networkError;
    }
    if (!response.ok) {
      const bodyText = await response.text();
      let providerMessage = `HTTP ${response.status}`;
      try {
        const body = JSON.parse(bodyText) as { error?: { message?: unknown } };
        if (typeof body.error?.message === 'string' && body.error.message.trim()) providerMessage = body.error.message;
      } catch {
        // Keep the status-only fallback when the provider does not return JSON.
      }
      const safeMessage = providerMessage.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]').replace(/(?:sk|sess)-[A-Za-z0-9_-]+/g, '[redacted]').replace(/[\r\n\t]+/g, ' ').slice(0, 500);
      const providerError = new Error(`llm_http_${response.status}: ${safeMessage}`) as LlmError;
      providerError.status = response.status;
      providerError.code = `llm_http_${response.status}`;
      providerError.retryable = [408, 429, 500, 502, 503, 504].includes(response.status);
      throw providerError;
    }
    const payload = await response.json() as { id?: unknown; model?: unknown; choices?: { finish_reason?: unknown; message?: { content?: unknown; refusal?: unknown } }[]; usage?: Record<string, unknown> };
    const firstChoice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
    const rawContent = firstChoice?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : null;
    const refusal = firstChoice?.message?.refusal;
    const providerMeta = {
      provider_response_id: typeof payload.id === 'string' ? payload.id : null,
      choices_count: Array.isArray(payload.choices) ? payload.choices.length : 0,
      finish_reason: typeof firstChoice?.finish_reason === 'string' ? firstChoice.finish_reason : null,
      content_present: content !== null && content.length > 0,
      content_length: content?.length ?? 0,
      refusal_present: typeof refusal === 'string' && refusal.length > 0,
      refusal_reason: typeof refusal === 'string' && refusal.length > 0 ? 'provider_refusal' : null,
      usage: normalizeUsage(payload.usage) ?? null,
      model: typeof payload.model === 'string' ? payload.model : llmModel(),
    };
    if (!content) {
      const emptyError = new Error('llm_empty_response') as LlmError;
      emptyError.code = 'llm_empty_response';
      emptyError.retryable = false;
      emptyError.providerMeta = providerMeta;
      console.error('llm_empty_response', providerMeta);
      throw emptyError;
    }
    try {
      return { value: JSON.parse(content), usage: normalizeUsage(payload.usage) };
    } catch {
      const parseError = new Error('llm_invalid_json') as LlmError;
      parseError.code = 'llm_invalid_json';
      parseError.retryable = false;
      throw parseError;
    }
  } finally { clearTimeout(timeout); }
}
export async function requestStructuredJson(name: string, schema: Record<string, unknown>, system: string, user: string): Promise<unknown> {
  return (await requestStructuredJsonWithMeta(name, schema, system, user)).value;
}

export function isRetryableLlmError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as LlmError;
  if (typeof candidate.retryable === 'boolean') return candidate.retryable;
  if (typeof candidate.status === 'number') return [408, 429, 500, 502, 503, 504].includes(candidate.status);
  if (candidate.code === 'llm_timeout' || candidate.code === 'llm_network_error') return true;
  return candidate.name === 'AbortError';
}

async function withTechnicalJsonRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) { try { return await operation(); } catch (error) { lastError = error; if (!isRetryableLlmError(error)) break; } }
  throw lastError instanceof Error ? lastError : new Error('llm_invalid_json');
}

export async function withTechnicalJsonRetryMeta<T>(operation: () => Promise<T>): Promise<{ value: T; calls: number; failedCalls: number }> {
  let lastError: unknown;
  let calls = 0;
  let failedCalls = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    calls += 1;
    try { return { value: await operation(), calls, failedCalls }; } catch (error) { lastError = error; failedCalls += 1; if (!isRetryableLlmError(error)) break; }
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

export const candidateSchema = { type: 'object', additionalProperties: false, required: ['candidates'], properties: { candidates: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['recognition', 'explanation', 'insight', 'steps', 'action', 'closing', 'function', 'concept', 'angle', 'structure'], properties: { recognition: { type: 'string', minLength: 1, maxLength: 300 }, explanation: { type: 'string', minLength: 1, maxLength: 300 }, insight: { type: 'string', minLength: 1, maxLength: 300 }, steps: { type: 'array', minItems: 2, maxItems: 3, items: { type: 'string' } }, action: { type: 'string', minLength: 1, maxLength: 240 }, closing: { type: 'string', minLength: 1, maxLength: 160 }, function: { type: 'string', enum: [...candidateFunctions] }, concept: { type: 'string', minLength: 2, maxLength: 120 }, angle: { type: 'string', minLength: 2, maxLength: 180 }, structure: { type: 'string', enum: [...candidateStructures] } } } } } };
const auditSchema = { type: 'object', additionalProperties: false, required: ['context_fit', 'specificity', 'generic_motivation', 'chatbot_language', 'coaching_language', 'therapy_language', 'cliché', 'semantic_repetition', 'concept_repetition', 'structure_repetition', 'single_idea', 'natural_voice', 'unnecessary_advice', 'approved', 'reasons'], properties: { context_fit: { type: 'boolean' }, specificity: { type: 'boolean' }, generic_motivation: { type: 'boolean' }, chatbot_language: { type: 'boolean' }, coaching_language: { type: 'boolean' }, therapy_language: { type: 'boolean' }, 'cliché': { type: 'boolean' }, semantic_repetition: { type: 'boolean' }, concept_repetition: { type: 'boolean' }, structure_repetition: { type: 'boolean' }, single_idea: { type: 'boolean' }, natural_voice: { type: 'boolean' }, unnecessary_advice: { type: 'boolean' }, approved: { type: 'boolean' }, reasons: { type: 'array', items: { type: 'string' } } } };
const calibrationSchema = { type: 'object', additionalProperties: false, required: ['question', 'options', 'allow_free_text', 'reason', 'missing_context_field'], properties: { question: { type: 'string', minLength: 12, maxLength: 180 }, options: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['id', 'label', 'context_value'], properties: { id: { type: 'string', minLength: 2, maxLength: 40 }, label: { type: 'string', minLength: 2, maxLength: 80 }, context_value: { type: 'string', minLength: 2, maxLength: 180 } } } }, allow_free_text: { type: 'boolean', const: true }, reason: { type: 'string', enum: ['too_general', 'missing_context', 'context_changed', 'desired_change_changed'] }, missing_context_field: { type: 'string', enum: ['current_context', 'active_context', 'relevant_situations', 'desired_change'] } } };

const system = `Eres el motor de mensajes de NIA. Cada candidato debe entregar valor utilizable después de cerrar WhatsApp, no una frase motivacional. No inventes personas, lugares, trabajos, conflictos ni hechos personales. No hagas terapia, coaching ni claims clínicos. No uses frases genéricas, afirmaciones vacías ni introducciones de chatbot. No uses sostener, mantener tu dirección, volver a tu intención, honrar tu proceso, alinearte contigo ni equivalentes salvo que sean palabras de la usuaria. La situación debe estar confirmada por la usuaria. Devuelve únicamente el JSON solicitado.`;
const candidateGenerationSystem = `${system} Para candidatos de intervención, no escribas el mensaje final en un campo text. Completa exactamente estos campos: recognition, explanation, insight, steps, action y closing. Cada campo cumple una función distinta y no debe repetir la misma idea con sinónimos: el siguiente campo debe profundizarla, operacionalizarla, convertirla en acción o mostrar una consecuencia. recognition entra directamente en la situación o tensión; no repitas desiredChange, no digas “estás buscando”, “estás trabajando en” ni “quieres aprender a”, y no describas el proceso de cambio como un coach. explanation explica un mecanismo sencillo y añade una capa nueva, sin repetir recognition, concept o desiredChange. insight aporta una distinción que aún no se haya expresado. steps operacionaliza el insight: cada paso debe avanzar la intervención y no repetirlo; contiene 2 o 3 instrucciones o preguntas concretas, sin numeración ni saltos de línea. action es una aplicación inmediata y no repite literalmente un step. closing expresa una consecuencia práctica breve; no es un aforismo, slogan, frase motivacional, frase de identidad ni conclusión poética. La aplicación compondrá la presentación final. Mantén aproximadamente 70–150 palabras en total, contexto confirmado, herramienta concreta, variación de función/estructura/ángulo, lenguaje humano y sin claims clínicos. Los 3 candidatos deben ser concisos: recognition, explanation e insight de 15–30 palabras cada uno; cada step de 8–20 palabras; action de 8–20 palabras; closing de 5–15 palabras; concept y angle breves. No escribas explicaciones adicionales fuera del JSON, no repitas ideas entre candidatos y no agregues comentarios, markdown ni texto fuera del schema. En el JSON, function y structure son identificadores internos cerrados; concept y angle son descripciones semánticas libres en español.`;

export function composeCandidateText(candidate: LlmCandidate) {
  const steps = candidate.steps.map((step, index) => `${index + 1}. ${step.trim()}`).join('\n');
  return formatCandidateText([candidate.recognition, candidate.explanation, candidate.insight, steps, candidate.action, candidate.closing].map(value => value.trim()).join('\n\n')).trim();
}

export function validateLlmCandidate(value: unknown): value is LlmCandidate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LlmCandidate>;
  const strings = [candidate.recognition, candidate.explanation, candidate.insight, candidate.action, candidate.closing];
  const validSteps = Array.isArray(candidate.steps) && candidate.steps.length >= 2 && candidate.steps.length <= 3 && candidate.steps.every(step => typeof step === 'string' && step.trim().length > 0 && !/[\r\n]/.test(step) && !/^\s*\d+[.)]\s/.test(step));
  if (!strings.every(value => typeof value === 'string' && value.trim().length > 0) || !validSteps) return false;
  if (typeof candidate.concept !== 'string' || candidate.concept.trim().length < 2 || typeof candidate.angle !== 'string' || candidate.angle.trim().length < 2 || !candidateFunctions.includes(candidate.function as typeof candidateFunctions[number]) || !candidateStructures.includes(candidate.structure as typeof candidateStructures[number])) return false;
  const text = composeCandidateText(candidate as LlmCandidate);
  return text.includes('\n') && text.includes('\n\n') && text.length >= 180 && text.length <= 900;
}

export async function generateCandidatesWithLLM(brief: InterventionBrief): Promise<InterventionCandidate[]> {
  return (await generateCandidatesWithLLMWithMeta(brief)).candidates;
}

export async function generateCandidatesWithLLMWithMeta(brief: InterventionBrief): Promise<{ candidates: InterventionCandidate[]; calls: number; technicalRetries: number; technicalFailures: number; usage: StructuredUsage; callUsages: ProviderUsageSnapshot[]; latencyMs: number }> {
  const started = Date.now();
  const usage: StructuredUsage = {};
  const callUsages: ProviderUsageSnapshot[] = [];
  const execution = await withTechnicalJsonRetryMeta(async () => {
    const response = await requestStructuredJsonWithMeta('nia_intervention_candidates', candidateSchema, candidateGenerationSystem, `Construye exactamente 3 candidatos diferentes. Deben variar en ángulo y estructura, no ser paráfrasis. Usa únicamente hechos y situaciones confirmados por la usuaria. Si el brief no contiene una situación concreta, no la inventes. Restricciones activas: ${(brief.generationConstraints ?? []).join(' | ') || 'ninguna adicional'}. Brief completo:\n${JSON.stringify(brief)}`);
    callUsages.push(response.usage ?? {});
    addUsage(usage, response.usage);
    const value = response.value as { candidates?: unknown };
    const structuredCandidates = Array.isArray(value.candidates) ? value.candidates : [];
    if (structuredCandidates.length !== 3 || !structuredCandidates.every(validateLlmCandidate)) throw new Error('llm_candidate_schema_invalid');
    return structuredCandidates as LlmCandidate[];
  });
  return { candidates: execution.value.map(candidate => ({ text: composeCandidateText(candidate), recognition: candidate.recognition, explanation: candidate.explanation, insight: candidate.insight, steps: candidate.steps, action: candidate.action, closing: candidate.closing, function: candidate.function, concept: candidate.concept, angle: candidate.angle, structure: candidate.structure, audit: undefined })), calls: execution.calls, technicalRetries: execution.calls - 1, technicalFailures: execution.failedCalls, usage, callUsages, latencyMs: Date.now() - started };
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
    const response = await requestStructuredJsonWithMeta('nia_intervention_audit', auditSchema, system, `Audita este candidato. Aprueba únicamente si todas las dimensiones pasan. No compenses un fallo grave con otro check. No exijas detalles personales que la usuaria no proporcionó: si solo confirmó un ámbito como pareja, trabajo o familia, puedes evaluar una intervención breve anclada a ese ámbito. Rechaza únicamente cuando el candidato presente como hechos datos no confirmados (por ejemplo, conflictos, personas, frases o decisiones concretas no mencionadas).

Evalúa chatbot_language con precisión. No marques como chatbot el reconocimiento contextual natural, hablarle directamente a la usuaria, resumir el contexto o comenzar describiendo la situación. Marca chatbot_language únicamente cuando adopte una voz de asistente o servicio de apoyo con frases como “entiendo perfectamente”, “gracias por compartir”, “estoy aquí para ayudarte”, “tiene mucho sentido que te sientas”, “sé que esto puede ser difícil” o “vamos a trabajar juntos”.

Evalúa coaching_language como performative_coaching_voice. Una intervención puede recomendar acciones, hacer preguntas, proponer pasos concretos, sugerir una pausa, dar criterios de decisión, proponer una frase para usar o plantear un pequeño experimento. Eso no constituye coaching. Marca coaching_language únicamente cuando la voz se vuelve genérica, motivacional, terapéutica o propia de una sesión de coaching: exhortaciones sobre confianza, autoestima, crecimiento personal, potencial o identidad sin conexión operativa concreta, o motivación en lugar de una herramienta. Evalúa el mensaje completo y su función, no palabras aisladas. Mantén separadas las dimensiones coaching, therapy, chatbot_language y generic_motivation.

Evalúa también la repetición interna. No rechaces porque se repita una estructura de composición o porque el candidato pertenezca al mismo tema que una intervención anterior. Rechaza semantic_repetition o concept_repetition cuando recognition, explanation, insight, steps, action o closing vuelvan a expresar la misma idea accionable sin profundizarla, operacionalizarla o añadir una consecuencia distinta. Distingue la repetición histórica de la repetición interna del propio candidato.

Brief:
${JSON.stringify({ desired_change: brief.desiredChange, current_context: brief.currentContext, relevant_context: brief.relevantSituations, candidate, recent_interventions: brief.recentInterventions, semantic_matches: semanticMatches, recent_concepts: brief.recentConcepts, recent_structures: brief.recentStructures })}`);
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
