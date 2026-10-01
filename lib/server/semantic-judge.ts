import type { InterventionBrief, InterventionCandidate, SemanticJudgeResult, SemanticMatch, SemanticRelationship } from '@/lib/intervention-engine';
import { interventionConfig } from '@/lib/intervention-engine';
import { requestStructuredJsonWithMeta, type StructuredUsage } from '@/lib/server/llm-intervention';

export const semanticJudgeSchema = { type: 'object', additionalProperties: false, required: ['matches'], properties: { matches: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['intervention_id', 'relationship', 'same_actionable_idea', 'same_angle', 'reason'], properties: { intervention_id: { type: 'string', minLength: 1, maxLength: 120 }, relationship: { type: 'string', enum: ['duplicate', 'same_theme_different_angle', 'distinct'] }, same_actionable_idea: { type: 'boolean' }, same_angle: { type: 'boolean' }, reason: { type: 'string', minLength: 1, maxLength: 400 } } } } } };
export const semanticJudgeSystem = 'Eres el juez semántico de NIA. Determina si una candidata repite esencialmente la misma idea accionable que una intervención anterior. No confundas mismo tema con duplicado: mismo tema con otro momento, conducta, interpretación o ángulo es same_theme_different_angle. Devuelve únicamente el JSON solicitado.';

function validate(value: unknown, expectedIds: Set<string>): value is SemanticJudgeResult {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { matches?: unknown }).matches)) return false;
  const matches = (value as { matches: unknown[] }).matches;
  const returnedIds = new Set<string>();
  const valid = matches.length === expectedIds.size && matches.every(item => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    if (typeof row.intervention_id !== 'string' || !expectedIds.has(row.intervention_id) || returnedIds.has(row.intervention_id)) return false;
    returnedIds.add(row.intervention_id);
    return (['duplicate', 'same_theme_different_angle', 'distinct'] as SemanticRelationship[]).includes(row.relationship as SemanticRelationship) && typeof row.same_actionable_idea === 'boolean' && typeof row.same_angle === 'boolean' && typeof row.reason === 'string' && row.reason.trim().length > 0;
  });
  return valid && returnedIds.size === expectedIds.size;
}

export type SemanticJudgeExecution = { result?: SemanticJudgeResult; calls: number; technicalFailures: number; usage: StructuredUsage; callUsages: StructuredUsage[]; latencyMs: number };

export async function judgeSemanticRelationshipsWithMeta(candidate: InterventionCandidate, brief: InterventionBrief, matches: SemanticMatch[]): Promise<SemanticJudgeExecution> {
  const relevant = [...matches].sort((a, b) => b.similarity - a.similarity).filter(match => match.similarity >= interventionConfig.semanticReviewThreshold).slice(0, 3);
  if (!relevant.length) return { result: undefined, calls: 0, technicalFailures: 0, usage: {}, callUsages: [], latencyMs: 0 };
  const expectedIds = new Set(relevant.map(match => match.intervention_id));
  const started = Date.now(); let calls = 0; let technicalFailures = 0; const usage: StructuredUsage = {}; const callUsages: StructuredUsage[] = []; let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    calls += 1;
    try {
      const response = await requestStructuredJsonWithMeta('nia_semantic_judge', semanticJudgeSchema, semanticJudgeSystem, `Responde para cada match relevante. Pregunta: ¿la nueva intervención expresa esencialmente la misma idea accionable que una intervención anterior, o aporta un ángulo útil y diferente dentro del mismo territorio?\nContexto: ${JSON.stringify({ desired_change: brief.desiredChange, active_context: brief.currentContext })}\nCandidata: ${JSON.stringify(candidate)}\nMatches: ${JSON.stringify(relevant)}`);
      callUsages.push(response.usage ?? {});
      for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens'] as const) usage[key] = (usage[key] ?? 0) + (response.usage?.[key] ?? 0);
      if (!validate(response.value, expectedIds)) throw new Error('semantic_judge_schema_invalid');
      return { result: response.value, calls, technicalFailures, usage, callUsages, latencyMs: Date.now() - started };
    } catch (error) { lastError = error; technicalFailures += 1; }
  }
  const failure = lastError instanceof Error ? lastError : new Error('semantic_judge_failed');
  Object.assign(failure, { technicalAttempts: calls });
  throw failure;
}

export async function judgeSemanticRelationships(candidate: InterventionCandidate, brief: InterventionBrief, matches: SemanticMatch[]): Promise<SemanticJudgeResult | undefined> {
  return (await judgeSemanticRelationshipsWithMeta(candidate, brief, matches)).result;
}
