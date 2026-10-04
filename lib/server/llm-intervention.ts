import { formatCandidateText } from '../intervention-engine.ts';
import type { CalibrationPrompt, EditorialBlock, EditorialBlockType, EditorialDepth, EditorialExperienceType, EditorialInterventionType, InterventionBrief, InterventionCandidate, InterventionFunction, InterventionStructure, SemanticMatch } from '../intervention-engine.ts';
import { canonicalEditorialTypes, closingTypes, directivenessLevels, functionalEmotions, type CanonicalEditorialType, type ClosingType, type Directiveness, type FunctionalEmotion } from '../editorial-contract.ts';

export type LlmCandidate = {
  topic: string;
  intervention_type: EditorialInterventionType;
  depth: EditorialDepth;
  editorial_take: string;
  editorial_idea: string;
  experience_type: EditorialExperienceType;
  blocks: EditorialBlock[];
  recognition?: string;
  explanation?: string;
  insight?: string;
  steps?: string[];
  action?: string;
  closing?: string;
  function: InterventionFunction;
  concept: string;
  angle: string;
  structure: InterventionStructure;
  editorial_type?: CanonicalEditorialType;
  signal?: string;
  evidence_direction?: string;
  movement?: string;
  opening_closing?: string;
  insight_id?: string;
  functional_emotion?: FunctionalEmotion;
  directiveness?: Directiveness;
  closing_type?: ClosingType;
  action_id?: string;
  situation?: string;
  intention?: string;
  longitudinal_evidence_refs?: string[];
};
export type LlmAudit = {
  context_fit: boolean; specificity: boolean; generic_motivation: boolean; chatbot_language: boolean; coaching_language: boolean; therapy_language: boolean; robotic_or_abstract_language: boolean; first_read_comprehension: boolean; editorial_novelty: boolean; experience_novelty: boolean; cliché: boolean; semantic_repetition: boolean; concept_repetition: boolean; structure_repetition: boolean; single_idea: boolean; natural_voice: boolean; unnecessary_advice: boolean; approved: boolean; reasons: string[];
};

const OPENAI_URL = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions';
export const candidateFunctions = ['remind', 'anticipate', 'reframe', 'distinguish', 'interrupt', 'permit', 'anchor', 'redirect'] as const;
export const candidateStructures = ['context_does_not_mean', 'before_then', 'you_can_without', 'distinguish_between', 'when_then', 'specific_permission'] as const;
export const candidateBlockTypes: EditorialBlockType[] = ['idea', 'recognition', 'explanation', 'insight', 'question', 'tool', 'step', 'example', 'action', 'closing'];

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
      response = await fetch(OPENAI_URL, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: llmModel(), max_completion_tokens: 4800, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } } }) });
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

export async function withTechnicalJsonRetryMeta<T>(operation: () => Promise<T>, options: { maxAttempts?: number } = {}): Promise<{ value: T; calls: number; failedCalls: number }> {
  let lastError: unknown;
  let calls = 0;
  let failedCalls = 0;
  for (let attempt = 0; attempt < (options.maxAttempts ?? 2); attempt += 1) {
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

export const candidateSchema = { type: 'object', additionalProperties: false, required: ['candidates'], properties: { candidates: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['topic', 'editorial_take', 'editorial_idea', 'experience_type', 'intervention_type', 'editorial_type', 'functional_emotion', 'directiveness', 'closing_type', 'signal', 'evidence_direction', 'movement', 'opening_closing', 'depth', 'blocks', 'function', 'concept', 'angle', 'structure'], properties: { topic: { type: 'string', minLength: 1, maxLength: 160 }, editorial_take: { type: 'string', minLength: 8, maxLength: 240 }, editorial_idea: { type: 'string', minLength: 8, maxLength: 240 }, experience_type: { type: 'string', enum: ['brief_insight', 'reflection', 'encouragement', 'perspective_shift', 'practical_tool', 'exercise', 'challenge', 'question', 'check_in', 'validation', 'direct_push', 'concrete_example', 'story_or_scenario', 'feedback_request'] }, intervention_type: { type: 'string', enum: ['brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'] }, editorial_type: { type: 'string', enum: [...canonicalEditorialTypes] }, functional_emotion: { type: 'string', enum: [...functionalEmotions] }, directiveness: { type: 'string', enum: [...directivenessLevels] }, closing_type: { type: 'string', enum: [...closingTypes] }, signal: { type: 'string', minLength: 1, maxLength: 240 }, evidence_direction: { type: 'string', minLength: 1, maxLength: 240 }, movement: { type: 'string', minLength: 1, maxLength: 160 }, opening_closing: { type: 'string', minLength: 1, maxLength: 240 }, situation: { type: 'string', maxLength: 240 }, intention: { type: 'string', maxLength: 240 }, insight_id: { type: 'string', maxLength: 120 }, action_id: { type: 'string', maxLength: 120 }, longitudinal_evidence_refs: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 120 } }, depth: { type: 'string', enum: ['brief', 'medium', 'deep'] }, blocks: { type: 'array', minItems: 1, maxItems: 7, items: { type: 'object', additionalProperties: false, required: ['type', 'text'], properties: { type: { type: 'string', enum: candidateBlockTypes }, text: { type: 'string', minLength: 1, maxLength: 420 } } } }, function: { type: 'string', enum: [...candidateFunctions] }, concept: { type: 'string', minLength: 2, maxLength: 120 }, angle: { type: 'string', minLength: 2, maxLength: 180 }, structure: { type: 'string', enum: [...candidateStructures] } } } } } };
type StrictSchemaNode = { type?: string | string[]; properties?: Record<string, StrictSchemaNode>; required?: string[]; additionalProperties?: boolean; items?: StrictSchemaNode; anyOf?: StrictSchemaNode[]; oneOf?: StrictSchemaNode[]; allOf?: StrictSchemaNode[] };

const candidateItemSchema = (candidateSchema.properties.candidates.items as unknown) as StrictSchemaNode;
const candidateProperties = candidateItemSchema.properties ?? {};
const nullableCandidateFields: Array<[string, 'string' | 'array']> = [
  ['situation', 'string'],
  ['intention', 'string'],
  ['insight_id', 'string'],
  ['action_id', 'string'],
  ['longitudinal_evidence_refs', 'array'],
];
candidateItemSchema.required = [...new Set([...(candidateItemSchema.required ?? []), ...nullableCandidateFields.map(([key]) => key)])];
for (const [key, type] of nullableCandidateFields) candidateProperties[key] = { ...candidateProperties[key], type: [type, 'null'] };

export function strictSchemaErrors(schema: unknown, path = '$'): string[] {
  if (!schema || typeof schema !== 'object') return [`${path} must be an object`];
  const node = schema as StrictSchemaNode;
  const errors: string[] = [];
  if (node.type === 'object') {
    const properties = node.properties;
    if (!properties) errors.push(`${path}.properties is required`);
    if (node.additionalProperties !== false) errors.push(`${path}.additionalProperties must be false`);
    if (!Array.isArray(node.required)) errors.push(`${path}.required is required`);
    if (properties && Array.isArray(node.required)) {
      const propertyKeys = Object.keys(properties);
      const requiredKeys = new Set(node.required);
      for (const key of propertyKeys) if (!requiredKeys.has(key)) errors.push(`${path}.required is missing ${key}`);
      for (const key of node.required) if (!Object.prototype.hasOwnProperty.call(properties, key)) errors.push(`${path}.required references missing property ${key}`);
      for (const [key, property] of Object.entries(properties)) errors.push(...strictSchemaErrors(property, `${path}.properties.${key}`));
    }
  }
  if (node.type === 'array' && node.items) errors.push(...strictSchemaErrors(node.items, `${path}.items`));
  for (const key of ['anyOf', 'oneOf', 'allOf'] as const) for (const [index, child] of (node[key] ?? []).entries()) errors.push(...strictSchemaErrors(child, `${path}.${key}[${index}]`));
  return errors;
}
const auditSchema = { type: 'object', additionalProperties: false, required: ['context_fit', 'specificity', 'generic_motivation', 'chatbot_language', 'coaching_language', 'therapy_language', 'robotic_or_abstract_language', 'first_read_comprehension', 'editorial_novelty', 'experience_novelty', 'cliché', 'semantic_repetition', 'concept_repetition', 'structure_repetition', 'single_idea', 'natural_voice', 'unnecessary_advice', 'approved', 'reasons'], properties: { context_fit: { type: 'boolean' }, specificity: { type: 'boolean' }, generic_motivation: { type: 'boolean' }, chatbot_language: { type: 'boolean' }, coaching_language: { type: 'boolean' }, therapy_language: { type: 'boolean' }, robotic_or_abstract_language: { type: 'boolean' }, first_read_comprehension: { type: 'boolean' }, editorial_novelty: { type: 'boolean' }, experience_novelty: { type: 'boolean' }, 'cliché': { type: 'boolean' }, semantic_repetition: { type: 'boolean' }, concept_repetition: { type: 'boolean' }, structure_repetition: { type: 'boolean' }, single_idea: { type: 'boolean' }, natural_voice: { type: 'boolean' }, unnecessary_advice: { type: 'boolean' }, approved: { type: 'boolean' }, reasons: { type: 'array', items: { type: 'string' } } } };
const calibrationSchema = { type: 'object', additionalProperties: false, required: ['question', 'options', 'allow_free_text', 'reason', 'missing_context_field'], properties: { question: { type: 'string', minLength: 12, maxLength: 180 }, options: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['id', 'label', 'context_value'], properties: { id: { type: 'string', minLength: 2, maxLength: 40 }, label: { type: 'string', minLength: 2, maxLength: 80 }, context_value: { type: 'string', minLength: 2, maxLength: 180 } } } }, allow_free_text: { type: 'boolean', const: true }, reason: { type: 'string', enum: ['too_general', 'missing_context', 'context_changed', 'desired_change_changed'] }, missing_context_field: { type: 'string', enum: ['current_context', 'active_context', 'relevant_situations', 'desired_change'] } } };

const system = `Eres el motor de mensajes de NIA. Cada candidato debe entregar valor utilizable después de cerrar WhatsApp, no una frase motivacional. No inventes personas, lugares, trabajos, conflictos ni hechos personales. No hagas terapia, coaching ni claims clínicos. No uses frases genéricas, afirmaciones vacías ni introducciones de chatbot. No uses sostener, mantener tu dirección, volver a tu intención, honrar tu proceso, alinearte contigo ni equivalentes salvo que sean palabras de la usuaria. La situación debe estar confirmada por la usuaria. Devuelve únicamente el JSON solicitado.`;
const candidateGenerationSystem = `${system} El brief editorial decide qué conviene trabajar y cómo variar la entrega. Devuelve la firma SEMA interna: signal, evidence_direction, movement y opening_closing, además de editorial_type, functional_emotion, directiveness y closing_type cuando puedas. No escribas un mensaje final en un campo text. editorial_take es la idea concreta visible; editorial_idea describe qué debe pensar, ver o hacer distinto después. No produzcas una redacción distinta de la misma enseñanza reciente. Escribe para una persona, no para un cliente de coaching. Usa lenguaje simple y natural que se entienda en la primera lectura. No añadas estructura si la idea no la necesita; closing, action, question, insight y steps son opcionales. experience_type no es un calendario: elige según relevancia y ritmo reciente. Cada block solo tiene type y text; usa entre 1 y 7 bloques, sin rellenar. Los 3 candidatos deben variar en idea editorial y experiencia cuando sea útil. No repitas la misma idea entre bloques, candidatos, el slot anterior ni los últimos días. No inventes hechos personales, no hagas terapia, coaching performativo, motivación genérica ni introducciones de chatbot. No uses lenguaje académico o de manual. No escribas explicaciones fuera del JSON ni markdown.`;

export function composeCandidateText(candidate: LlmCandidate) {
  if (!Array.isArray(candidate.blocks)) {
    const legacy = [candidate.recognition, candidate.explanation, candidate.insight, ...(candidate.steps ?? []).map((step, index) => `${index + 1}. ${step}`), candidate.action, candidate.closing].filter((value): value is string => Boolean(value?.trim()));
    return formatCandidateText(legacy.join('\n\n')).trim();
  }
  let stepNumber = 0;
  const parts = candidate.blocks.map(block => {
    const value = block.text.trim();
    if (block.type !== 'step') return value;
    stepNumber += 1;
    return `${stepNumber}. ${value}`;
  }).filter(Boolean);
  return formatCandidateText(parts.join('\n\n')).trim();
}

export function validateLlmCandidate(value: unknown): value is LlmCandidate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LlmCandidate>;
  const blocks = Array.isArray(candidate.blocks) ? candidate.blocks : [];
  const validBlocks = blocks.length >= 1 && blocks.length <= 7 && blocks.every(block => block && typeof block === 'object' && candidateBlockTypes.includes((block as EditorialBlock).type) && typeof (block as EditorialBlock).text === 'string' && (block as EditorialBlock).text.trim().length > 0 && !/[\r\n]/.test((block as EditorialBlock).text));
  if (typeof candidate.topic !== 'string' || !candidate.topic.trim() || typeof candidate.editorial_take !== 'string' || candidate.editorial_take.trim().length < 8 || typeof candidate.editorial_idea !== 'string' || candidate.editorial_idea.trim().length < 8 || !candidate.experience_type || !validBlocks || !candidate.editorial_type || !candidate.functional_emotion || !candidate.directiveness || !candidate.closing_type || !candidate.signal?.trim() || !candidate.evidence_direction?.trim() || !candidate.movement?.trim() || !candidate.opening_closing?.trim()) return false;
  if (!['brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'].includes(candidate.intervention_type as string) || !['brief', 'medium', 'deep'].includes(candidate.depth as string)) return false;
  if (typeof candidate.concept !== 'string' || candidate.concept.trim().length < 2 || typeof candidate.angle !== 'string' || candidate.angle.trim().length < 2 || !candidateFunctions.includes(candidate.function as typeof candidateFunctions[number]) || !candidateStructures.includes(candidate.structure as typeof candidateStructures[number])) return false;
  if (candidate.intervention_type === 'step_by_step' && blocks.filter(block => block.type === 'step').length < 2) return false;
  if (candidate.intervention_type === 'tool' && !blocks.some(block => block.type === 'tool')) return false;
  const text = composeCandidateText(candidate as LlmCandidate);
  return text.length > 0 && (blocks.length === 1 || (text.includes('\n') && text.includes('\n\n'))) && text.length <= 1400;
}

export async function generateCandidatesWithLLM(brief: InterventionBrief): Promise<InterventionCandidate[]> {
  return (await generateCandidatesWithLLMWithMeta(brief)).candidates;
}

export async function generateCandidatesWithLLMWithMeta(brief: InterventionBrief, options: { maxTechnicalAttempts?: number } = {}): Promise<{ candidates: InterventionCandidate[]; calls: number; technicalRetries: number; technicalFailures: number; usage: StructuredUsage; callUsages: ProviderUsageSnapshot[]; latencyMs: number }> {
  const started = Date.now();
  const usage: StructuredUsage = {};
  const callUsages: ProviderUsageSnapshot[] = [];
  const execution = await withTechnicalJsonRetryMeta(async () => {
    const response = await requestStructuredJsonWithMeta('nia_intervention_candidates', candidateSchema, candidateGenerationSystem, `Construye exactamente 3 candidatos diferentes. Usa únicamente hechos y situaciones confirmados por la usuaria. Si el brief no contiene una situación concreta, no la inventes. Cada candidato debe devolver situation solo cuando pueda anclarlo a currentContext o relevantSituations; si no puede, deja situation en null y no compenses con una frase universal. Cuando situation sea null, el texto debe mostrar igualmente evidencia concreta del contexto confirmado si existe; no uses abstracciones como sustituto de personalización. Respeta el brief editorial y evita topics, angles, concepts e ideas editoriales recientes indicados allí. Restricciones activas: ${(brief.generationConstraints ?? []).join(' | ') || 'ninguna adicional'}. Brief editorial: ${JSON.stringify(brief.editorialPlan ?? null)}. Memoria reciente: ${JSON.stringify({ ideas: brief.recentEditorialIdeas ?? [], takes: brief.recentEditorialTakes ?? [], experiences: brief.recentExperienceTypes ?? [], interventions: brief.recentInterventions ?? [] })}. Contexto confirmado y objetivo: ${JSON.stringify({ desiredChange: brief.desiredChange, currentContext: brief.currentContext, relevantSituations: brief.relevantSituations, communicationPreference: brief.communicationPreference })}`);
    callUsages.push(response.usage ?? {});
    addUsage(usage, response.usage);
    const value = response.value as { candidates?: unknown };
    const structuredCandidates = Array.isArray(value.candidates) ? value.candidates : [];
    if (structuredCandidates.length !== 3 || !structuredCandidates.every(validateLlmCandidate)) throw new Error('llm_candidate_schema_invalid');
    return structuredCandidates as LlmCandidate[];
  }, { maxAttempts: options.maxTechnicalAttempts });
    return { candidates: execution.value.map(candidate => ({ text: composeCandidateText(candidate), topic: candidate.topic, editorialTake: candidate.editorial_take, editorialIdea: candidate.editorial_idea, experienceType: candidate.experience_type, territoryKey: candidate.topic, interventionType: candidate.intervention_type, depth: candidate.depth, blocks: candidate.blocks, function: candidate.function, concept: candidate.concept, angle: candidate.angle, structure: candidate.structure, editorialType: candidate.editorial_type ?? brief.editorialPlan?.recommended_editorial_type, signal: candidate.signal, evidenceDirection: candidate.evidence_direction, movement: candidate.movement ?? candidate.function, openingClosing: candidate.opening_closing, situation: candidate.situation ?? undefined, intention: candidate.intention ?? undefined, insightId: candidate.insight_id, functionalEmotion: candidate.functional_emotion ?? brief.editorialPlan?.recommended_functional_emotion, directiveness: candidate.directiveness ?? brief.editorialPlan?.recommended_directiveness, closingType: candidate.closing_type ?? brief.editorialPlan?.recommended_closing_type, actionId: candidate.action_id, longitudinalEvidenceRefs: candidate.longitudinal_evidence_refs, exercisePresent: candidate.blocks.some(block => block.type === 'step' || block.type === 'tool'), questionPresent: candidate.blocks.some(block => block.type === 'question'), feedbackRequested: candidate.experience_type === 'feedback_request', audit: undefined })), calls: execution.calls, technicalRetries: execution.calls - 1, technicalFailures: execution.failedCalls, usage, callUsages, latencyMs: Date.now() - started };
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

Evalúa human_voice y first_read_comprehension. La persona debe entender el mensaje a la primera, aunque la idea sea profunda. Marca robotic_or_abstract_language cuando suene a manual, aplicación o lenguaje conceptual innecesario, especialmente si usa nominalizaciones o frases como “evalúa la calidad de la objeción”, “define un umbral de reconsideración” o “identifica qué información modifica tus criterios”. No rechaces una palabra aislada: evalúa el conjunto. Una recomendación concreta, un mensaje de ánimo o una confrontación clara pueden pasar.

Evalúa editorial_novelty: no apruebes una redacción diferente de la misma enseñanza reciente. Distingue topic, angle, editorial_take y editorial_idea. Mismo topic con otra idea sí puede pasar; mismo editorial_idea aunque cambien palabras, formato o experiencia no debe pasar. Evalúa experience_novelty como una preferencia: una experiencia repetida puede ser válida si la relevancia lo justifica, pero debe advertirse cuando domina la ventana reciente.

Evalúa chatbot_language con precisión. No marques como chatbot el reconocimiento contextual natural, hablarle directamente a la usuaria, resumir el contexto o comenzar describiendo la situación. Marca chatbot_language únicamente cuando adopte una voz de asistente o servicio de apoyo con frases como “entiendo perfectamente”, “gracias por compartir”, “estoy aquí para ayudarte”, “tiene mucho sentido que te sientas”, “sé que esto puede ser difícil” o “vamos a trabajar juntos”.

Evalúa coaching_language como performative_coaching_voice. Una intervención puede recomendar acciones, hacer preguntas, proponer pasos concretos, sugerir una pausa, dar criterios de decisión, proponer una frase para usar o plantear un pequeño experimento. Eso no constituye coaching. Marca coaching_language únicamente cuando la voz se vuelve genérica, motivacional, terapéutica o propia de una sesión de coaching: exhortaciones sobre confianza, autoestima, crecimiento personal, potencial o identidad sin conexión operativa concreta, o motivación en lugar de una herramienta. Evalúa el mensaje completo y su función, no palabras aisladas. Mantén separadas las dimensiones coaching, therapy, chatbot_language y generic_motivation.

Evalúa también la repetición interna sobre blocks[]. No rechaces porque se repita una estructura de composición, un formato o porque el candidato pertenezca al mismo tema que una intervención anterior. Rechaza semantic_repetition o concept_repetition cuando varios bloques vuelvan a expresar la misma idea accionable sin profundizarla, operacionalizarla o añadir una consecuencia distinta. Distingue la repetición histórica de la repetición interna del propio candidato.

Brief:
${JSON.stringify({ desired_change: brief.desiredChange, current_context: brief.currentContext, relevant_context: brief.relevantSituations, candidate, recent_interventions: brief.recentInterventions, recent_editorial_ideas: brief.recentEditorialIdeas, recent_editorial_takes: brief.recentEditorialTakes, recent_experiences: brief.recentExperienceTypes, semantic_matches: semanticMatches, recent_concepts: brief.recentConcepts, recent_structures: brief.recentStructures })}`);
    callUsages.push(response.usage ?? {});
    addUsage(usage, response.usage);
    const value = response.value as LlmAudit;
    if (!value || typeof value.approved !== 'boolean' || !Array.isArray(value.reasons) || typeof value.context_fit !== 'boolean' || typeof value.specificity !== 'boolean' || typeof value.robotic_or_abstract_language !== 'boolean' || typeof value.first_read_comprehension !== 'boolean') throw new Error('llm_audit_schema_invalid');
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
