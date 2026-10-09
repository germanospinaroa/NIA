import { evaluateMovementExpression, type MovementTargetGuidance } from '@/lib/movement-expression';
import type { ReceptionStage, ReceptionTimeOfDay } from '@/lib/server/reception-progression';

export const SEMANTIC_FIDELITY_MODEL = 'gpt-6-luna';

export type SemanticFidelityInput = {
  addressName: string;
  confirmedContext: string;
  desiredChange: string;
  receptionStage: ReceptionStage;
  timeOfDay: ReceptionTimeOfDay;
  guidance: MovementTargetGuidance;
  adjacentMovements: string[];
  message: string;
  interventionMode?: string;
  angle?: string;
  depth?: string;
  newContribution: string;
  expectedTakeaway: string;
  previousDeliveredTakeaway?: string | null;
  recentTakeaways?: string[];
  priorContributions?: string[];
  relatedSignatures?: string[];
};

export type SemanticFidelityResult = {
  target_expressed: boolean;
  adjacent_drift: boolean;
  dominant_movement: string;
  movement_value: boolean;
  new_contribution_expressed: boolean;
  same_actionable_teaching_as_prior: boolean;
  novel_contribution: boolean;
  semantic_redundancy: boolean;
  personalized: boolean;
  grounded_in_user_context: boolean;
  immediate_clarity: boolean;
  natural_spanish: boolean;
  single_core_idea: boolean;
  whatsapp_readable: boolean;
  system_language_leak: boolean;
  cognitive_overload: boolean;
  clear_takeaway: boolean;
  reason: string;
};

export type SemanticFidelityExecution = {
  result: SemanticFidelityResult;
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  responseId: string | null;
  model: string;
  latencyMs: number;
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['target_expressed', 'adjacent_drift', 'dominant_movement', 'movement_value', 'new_contribution_expressed', 'same_actionable_teaching_as_prior', 'novel_contribution', 'semantic_redundancy', 'personalized', 'grounded_in_user_context', 'immediate_clarity', 'natural_spanish', 'single_core_idea', 'whatsapp_readable', 'system_language_leak', 'cognitive_overload', 'clear_takeaway', 'reason'],
  properties: {
    target_expressed: { type: 'boolean' },
    adjacent_drift: { type: 'boolean' },
    dominant_movement: { type: 'string', maxLength: 120 },
    movement_value: { type: 'boolean' },
    new_contribution_expressed: { type: 'boolean' },
    same_actionable_teaching_as_prior: { type: 'boolean' },
    novel_contribution: { type: 'boolean' },
    semantic_redundancy: { type: 'boolean' },
    personalized: { type: 'boolean' },
    grounded_in_user_context: { type: 'boolean' },
    immediate_clarity: { type: 'boolean' },
    natural_spanish: { type: 'boolean' },
    single_core_idea: { type: 'boolean' },
    whatsapp_readable: { type: 'boolean' },
    system_language_leak: { type: 'boolean' },
    cognitive_overload: { type: 'boolean' },
    clear_takeaway: { type: 'boolean' },
    reason: { type: 'string', minLength: 1, maxLength: 300 },
  },
};

const system = `Eres un juez semántico y editorial breve de NIA. Clasifica el significado y la experiencia de lectura del mensaje; no premies un texto solo porque sea técnicamente interpretable.
target_expressed=true solo si el mensaje desarrolla funcionalmente el movimiento canónico indicado.
adjacent_drift=true solo si otro movimiento se convierte en la enseñanza principal; mencionar una idea vecina no basta.
movement_value=true según el valueKind: recognition reconoce una señal o secuencia concreta; distinction separa dos fenómenos; clarification vuelve nombrable una duda; criterion ofrece o construye una referencia para evaluar; action deja un paso ejecutable; practice permite ensayar; review permite revisar un hecho; evidence hace visible evidencia observable.
Para recognition, repetir los hechos del contexto con otras palabras no basta: debe añadir una forma concreta de localizar, nombrar o distinguir la señal/secuencia cuando vuelva a ocurrir. Si solo dice que la persona consulta o ya tiene una respuesta, sin esa forma nueva de reconocerlo, movement_value=false.
No exijas acción a recognition, distinction, clarification, review o evidence si ya entregan ese valor funcional.
new_contribution_expressed=true solo si el mensaje entrega el newContribution requerido y expected_takeaway es reconocible sin sustituirlo por un aprendizaje anterior.
same_actionable_teaching_as_prior=true si el mensaje entrega sustancialmente la misma enseñanza accionable que algún takeaway/contribution previo, aunque cambien palabras, angle, mode o signature.
No diagnostiques ni inventes hechos. novel_contribution=true solo si añade una distinción, criterio, aplicación, práctica, conexión, transferencia, anticipación, evidencia o profundidad que no esté en los takeaways/contributions previos. semantic_redundancy=true si entrega sustancialmente la misma enseñanza sin una contribución nueva.
personalized=true solo si el mensaje usa de forma natural el nombre confirmado y se siente dirigido a esta persona, no si solo antepone un nombre a un texto genérico.
grounded_in_user_context=true solo si contiene un anclaje reconocible al contexto confirmado sin inventar hechos.
immediate_clarity=true solo si una persona entiende en una lectura qué le está diciendo NIA.
single_core_idea=true solo si newContribution y expectedTakeaway forman una sola enseñanza central, no varias ideas compitiendo.
natural_spanish=true solo si suena conversacional, directo y no traducido, burocrático, nominalizado o académico.
whatsapp_readable=true si la longitud y los párrafos permiten leerlo cómodamente en móvil; cognitive_overload=true si exige sostener demasiadas ideas o subordinadas.
clear_takeaway=true si la idea que queda puede resumirse naturalmente en una oración sencilla.
system_language_leak=true si el lector percibe términos o explicaciones de frameworks internos como “movimiento psicológico” o “señal observable”. Devuelve únicamente el JSON solicitado y una razón breve, sin cadena de pensamiento.`;
export function normalizeDominantMovement(raw: string, target: string, adjacentMovements: string[], message: string): string {
  const known = new Set([target, ...adjacentMovements]);
  if (known.has(raw)) return raw;
  const expressedAdjacent = adjacentMovements.filter(key => evaluateMovementExpression(key, message).targetExpressed);
  const family = raw.toLocaleLowerCase('en');
  if (family === 'criterion' && /reconsider|cambiar|cambie|dato nuevo/i.test(message)) {
    const threshold = adjacentMovements.find(key => key.endsWith(':set_reconsideration_threshold'));
    if (threshold) return threshold;
  }
  if (family === 'distinction' && /informaci[oó]n|delegar|decisi[oó]n/i.test(message)) {
    const distinction = adjacentMovements.find(key => key.endsWith(':information_vs_delegating_decision'));
    if (distinction) return distinction;
  }
  if (expressedAdjacent.length === 1) return expressedAdjacent[0];
  const normalized = raw.toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, '_');
  const suffixMatch = adjacentMovements.find(key => key.endsWith(`:${normalized}`));
  return suffixMatch ?? expressedAdjacent[0] ?? adjacentMovements[0] ?? target;
}

function parseResult(value: unknown, target: string, adjacentMovements: string[], message: string): SemanticFidelityResult {
  if (!value || typeof value !== 'object') throw new Error('semantic_fidelity_schema_invalid');
  const row = value as Record<string, unknown>;
  const booleanFields = ['target_expressed', 'adjacent_drift', 'movement_value', 'new_contribution_expressed', 'same_actionable_teaching_as_prior', 'novel_contribution', 'semantic_redundancy', 'personalized', 'grounded_in_user_context', 'immediate_clarity', 'natural_spanish', 'single_core_idea', 'whatsapp_readable', 'system_language_leak', 'cognitive_overload', 'clear_takeaway'];
  if (typeof row.dominant_movement !== 'string' || booleanFields.some(field => typeof row[field] !== 'boolean') || typeof row.reason !== 'string' || !row.reason.trim()) {
    throw new Error('semantic_fidelity_schema_invalid');
  }
  return {
    target_expressed: row.target_expressed as boolean,
    adjacent_drift: row.adjacent_drift as boolean,
    dominant_movement: normalizeDominantMovement(row.dominant_movement.trim() || target, target, adjacentMovements, message),
    movement_value: row.movement_value as boolean,
    new_contribution_expressed: row.new_contribution_expressed as boolean,
    same_actionable_teaching_as_prior: row.same_actionable_teaching_as_prior as boolean,
    novel_contribution: row.novel_contribution as boolean,
    semantic_redundancy: row.semantic_redundancy as boolean,
    personalized: row.personalized as boolean,
    grounded_in_user_context: row.grounded_in_user_context as boolean,
    immediate_clarity: row.immediate_clarity as boolean,
    natural_spanish: row.natural_spanish as boolean,
    single_core_idea: row.single_core_idea as boolean,
    whatsapp_readable: row.whatsapp_readable as boolean,
    system_language_leak: row.system_language_leak as boolean,
    cognitive_overload: row.cognitive_overload as boolean,
    clear_takeaway: row.clear_takeaway as boolean,
    reason: row.reason.trim(),
  };
}

export async function judgeSemanticFidelity(input: SemanticFidelityInput): Promise<SemanticFidelityExecution> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('semantic_fidelity_judge_not_configured');
  const started = Date.now();
  const response = await fetch(process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: SEMANTIC_FIDELITY_MODEL,
      max_completion_tokens: 800,
        messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify({
          confirmed_context: input.confirmedContext,
          desired_change: input.desiredChange,
          reception_stage: input.receptionStage,
          time_of_day: input.timeOfDay,
          canonical_target_movement: input.guidance.target,
          confirmed_address_name: input.addressName,
          target_purpose: input.guidance.purpose,
          target_in_scope: input.guidance.inScope,
          target_out_of_scope: input.guidance.outOfScope,
          value_kind: input.guidance.valueKind,
          adjacent_movements: input.adjacentMovements,
          intervention_mode: input.interventionMode ?? null,
          angle: input.angle ?? null,
          depth: input.depth ?? null,
          new_contribution: input.newContribution,
          expected_takeaway: input.expectedTakeaway,
          previous_delivered_takeaway: input.previousDeliveredTakeaway ?? null,
          recent_takeaways: input.recentTakeaways ?? [],
          prior_contributions: input.priorContributions ?? [],
          related_signatures: input.relatedSignatures ?? [],
          message: input.message,
        }) },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'nia_semantic_fidelity', strict: true, schema } },
    }),
    signal: AbortSignal.timeout(45_000),
  });
  const payload = await response.json().catch(() => ({})) as { id?: unknown; model?: unknown; choices?: Array<{ finish_reason?: unknown; message?: { content?: unknown; refusal?: unknown } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };
  if (!response.ok) throw new Error(`semantic_fidelity_http_${response.status}`);
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    const choice = payload.choices?.[0];
    throw new Error(`semantic_fidelity_empty_response:${String(choice?.finish_reason ?? 'unknown')}:${typeof choice?.message?.refusal === 'string' ? choice.message.refusal.slice(0, 120) : 'no_refusal'}`);
  }
  const result = parseResult(JSON.parse(content), input.guidance.target, input.adjacentMovements, input.message);
  return { result, usage: payload.usage ?? {}, responseId: typeof payload.id === 'string' ? payload.id : null, model: typeof payload.model === 'string' ? payload.model : SEMANTIC_FIDELITY_MODEL, latencyMs: Date.now() - started };
}
