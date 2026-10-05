import type { InterventionBrief } from '../intervention-engine.ts';
import { requestWriterV2Json } from './writer-v2-provider.ts';
import type { ReceptionStage, ReceptionTimeOfDay } from './reception-progression.ts';
import { evaluateMovementExpression, evaluateMovementValue, getMovementTargetGuidance, type MovementExpressionResult, type MovementTargetGuidance, type MovementValueResult } from '../movement-expression.ts';
import type { SemanticFidelityResult } from './semantic-fidelity-judge.ts';
import { hasExactMessageDuplicate } from '../recurrent-daily.ts';

export type WriterV2Input = {
  situation: string;
  desiredChange: string;
  psychologicalMove: string;
  canonicalTargetMovement?: string;
  targetMovementGuidance?: MovementTargetGuidance | null;
  movementExplanation: string;
  confirmedFacts: string[];
  recentMovements: string[];
  communicationPreference: string | null;
  safetyConstraints: string[];
  receptionStage: ReceptionStage;
  psychologicalInterventionsDelivered: number;
  timeOfDay: ReceptionTimeOfDay;
  receptionInstructions: string[];
  previousDeliveredMovement: string | null;
  previousDeliveredTakeaway: string | null;
  previousDeliveredMessage: string | null;
  continuityGuidance: string[];
  recentMessages?: string[];
  allowMovementRevisit?: boolean;
};

export type WriterV2Output = { message: string };

export type WriterV2Evaluation = {
  approved: boolean;
  hardFailures: string[];
  deterministicHardFailures: string[];
  semanticFailures: string[];
  warnings: string[];
  movementExpression?: MovementExpressionResult;
  movementValue?: MovementValueResult;
  semanticJudge?: SemanticFidelityResult;
};

const genericOnly = /^(conf[ií]a en ti|recuerda que eres capaz|es normal dudar|date permiso para confiar)[.! ]*$/i;
const inventedPsychology = /\b(eres insegura|tienes ansiedad|tienes un trauma|te autosaboteas|tu miedo te controla|tienes baja autoestima)\b/i;
const emptyClosing = /(?:nos leemos mañana|descansa[,.]? mañana seguimos|aquí estaré|recuerda que)[.! ]*$/i;
const forbiddenLanguage = /poco\s+a\s+poco/i;
const words = (value: string) => new Set(value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-záéíóúñü]{4,}/gi) ?? []);

/**
 * Deterministic value check for Writer V2. It looks for a usable relation
 * (distinction, criterion, concrete observation or application), not for one
 * magic verb. Metadata is server-authoritative, so the message is evaluated
 * from its own transferable content.
 */
export function hasTransferableValue(message: string) {
  const value = message.trim().toLocaleLowerCase('es');
  if (!value || /^(conf[ií]a en ti|recuerda tu intenci[oó]n|observa c[oó]mo te sientes)[.! ]*$/i.test(value)) return false;
  const distinction = /(?:no es lo mismo|no significa lo mismo|distinguir|separar|la diferencia entre|entre\s+.{3,}\s+y\s+.{3,}|esto sí está indicado|esto no queda indicado|lo que .* antes .* lo que .* después)/i.test(value);
  const criterion = /(?:qué dato concreto|qué información nueva|qué tendría que cambiar|si .* entonces|una regla|un criterio|para reconsiderar|puede cambiar la decisión)/i.test(value);
  const concreteObservation = /(?:fíjate en|f[ií]jate si|observa qué|observa si|anota .* qué|escribe .* qué|completa\s+[^.]{3,}|mi primera respuesta es|para empezar,? necesito saber)/i.test(value);
  const usableQuestion = /¿[^?]{10,}\?/u.test(value) && !/¿c[oó]mo te sientes\??/i.test(value);
  const appliedAction = /(?:antes de|después de|la próxima vez|cuando vuelva a ocurrir|para empezar|puedes usar|puedes separar|puedes comparar|puedes revisar|puedes nombrar)/i.test(value) && value.split(/\s+/).length >= 12;
  return (distinction || criterion || concreteObservation || usableQuestion) && (appliedAction || distinction || criterion || concreteObservation);
}

export function writerV2InputFromBrief(brief: InterventionBrief, reception?: Partial<Pick<WriterV2Input, 'receptionStage' | 'psychologicalInterventionsDelivered' | 'timeOfDay' | 'receptionInstructions'>>): WriterV2Input {
  const blueprint = brief.interventionBlueprint;
  const progression = brief.psychologicalProgression;
  const situation = blueprint?.signal || brief.relevantSituations?.[0] || brief.currentContext || '';
  const movement = brief.dailyPlan?.canonicalMovement || blueprint?.movement || progression?.next_recommended_movement || brief.psychologicalContract?.psychological_move || '';
  const explanation = [blueprint?.insight, blueprint?.expected_movement, blueprint?.micro_action].filter((value): value is string => Boolean(value?.trim())).join(' ');
  return {
    situation,
    desiredChange: brief.desiredChange,
    psychologicalMove: movement,
    canonicalTargetMovement: brief.dailyPlan?.canonicalMovement ?? progression?.next_recommended_movement ?? movement,
    targetMovementGuidance: getMovementTargetGuidance(brief.dailyPlan?.canonicalMovement ?? progression?.next_recommended_movement ?? movement),
    movementExplanation: explanation || brief.psychologicalContract?.psychological_move || '',
    confirmedFacts: [brief.currentContext, ...(brief.relevantSituations ?? []), ...(blueprint?.evidence_basis ?? [])].filter((value): value is string => Boolean(value?.trim())),
    recentMovements: [...new Set([...(progression?.completed_movements ?? []), ...(progression?.recent_movements ?? [])])],
    communicationPreference: brief.communicationPreference ?? null,
    safetyConstraints: ['No inventar hechos, emociones, motivos ni diagnósticos.', 'No hacer terapia, coaching genérico ni promesas clínicas.', 'No sustituir la decisión de la persona.', 'No uses la expresión prohibida "poco a poco".'],
    receptionStage: reception?.receptionStage ?? 'established',
    psychologicalInterventionsDelivered: reception?.psychologicalInterventionsDelivered ?? 0,
    timeOfDay: reception?.timeOfDay ?? 'evening',
    receptionInstructions: reception?.receptionInstructions ?? [],
    previousDeliveredMovement: progression?.continuity.previousDeliveredMovement ?? null,
    previousDeliveredTakeaway: progression?.continuity.previousDeliveredTakeaway ?? null,
    previousDeliveredMessage: progression?.continuity.previousDeliveredMessage ?? null,
    continuityGuidance: [...(progression?.continuity.continuityGuidance ?? []), ...(brief.dailyPlan?.continuityGuidance ?? []), ...(brief.dailyPlan?.noveltyGuidance ?? [])],
    recentMessages: (brief.recentInterventions ?? []).slice(0, 100),
    allowMovementRevisit: Boolean(brief.dailyPlan),
  };
}

export function writerV2Prompt(input: WriterV2Input, repairReasons: string[] = []) {
  return JSON.stringify({
    situation: input.situation,
    desired_change: input.desiredChange,
    psychological_move: input.psychologicalMove,
    movement_explanation: input.movementExplanation,
    target_movement_guidance: input.targetMovementGuidance,
    confirmed_facts: input.confirmedFacts,
    recent_movements_not_to_repeat: input.recentMovements,
    communication_preference: input.communicationPreference,
    safety_constraints: input.safetyConstraints,
    reception_stage: input.receptionStage,
    psychological_interventions_delivered: input.psychologicalInterventionsDelivered,
    time_of_day: input.timeOfDay,
    reception_instructions: input.receptionInstructions,
    previous_delivered_movement: input.previousDeliveredMovement,
    previous_delivered_takeaway: input.previousDeliveredTakeaway,
    previous_delivered_message: input.previousDeliveredMessage,
    continuity_guidance: input.continuityGuidance,
    recent_messages: input.recentMessages ?? [],
    allow_movement_revisit: input.allowMovementRevisit ?? false,
    repair_reasons: repairReasons,
  });
}

export function evaluateWriterV2(message: string, input: WriterV2Input): WriterV2Evaluation {
  const value = message.trim();
  const hardFailures: string[] = [];
  const warnings: string[] = [];
  if (!value) hardFailures.push('empty_message');
  if (forbiddenLanguage.test(value)) hardFailures.push('forbidden_language:poco_a_poco');
  if (genericOnly.test(value)) hardFailures.push('generic_no_value');
  if (inventedPsychology.test(value)) hardFailures.push('invented_psychology');
  if (value.length > 1400) hardFailures.push('message_too_long');
  if (!input.allowMovementRevisit && input.psychologicalMove && input.recentMovements.includes(input.psychologicalMove)) hardFailures.push('repeated_psychological_movement');
  if (hasExactMessageDuplicate(value, input.recentMessages ?? [])) hardFailures.push('exact_message_duplicate');
  const situationTerms = [...words(input.situation)].filter(term => words(value).has(term));
  if (input.situation && situationTerms.length < 2) hardFailures.push('context_not_anchored');
  const canonicalTarget = input.canonicalTargetMovement ?? input.psychologicalMove;
  const movementExpression = evaluateMovementExpression(canonicalTarget, value);
  const movementValue = evaluateMovementValue(canonicalTarget, value);
  // These three checks are diagnostic signals only. Their final decision is made
  // by Semantic Fidelity Judge because Spanish paraphrases cannot be validated
  // reliably by lexical patterns alone.
  if (emptyClosing.test(value)) warnings.push('filler_closing');
  if (value.length < 28) warnings.push('very_short');
  return { approved: hardFailures.length === 0, hardFailures, deterministicHardFailures: [...hardFailures], semanticFailures: [], warnings, movementExpression, movementValue };
}

export function applySemanticFidelity(evaluation: WriterV2Evaluation, result: SemanticFidelityResult): WriterV2Evaluation {
  const semanticFailures = [
    ...(result.target_expressed ? [] : ['movement_not_expressed']),
    ...(result.adjacent_drift ? ['adjacent_movement_drift'] : []),
    ...(result.movement_value ? [] : ['no_transferable_value']),
    ...(result.novel_contribution ? [] : ['no_novel_contribution']),
    ...(result.semantic_redundancy ? ['semantic_redundancy'] : []),
  ];
  const hardFailures = [...evaluation.deterministicHardFailures, ...semanticFailures];
  return { ...evaluation, approved: hardFailures.length === 0, hardFailures, semanticFailures, semanticJudge: result };
}

export async function generateWriterV2(input: WriterV2Input, options: { model: string; maxOutputTokens?: number; repairReasons?: string[] }) {
  const result = await requestWriterV2Json({
    model: options.model,
    maxOutputTokens: options.maxOutputTokens ?? 320,
    system: 'Escribe una única intervención final para la persona. El servidor ya decidió el movimiento psicológico: exprésalo, no lo rediseñes. Esta intervención forma parte de una secuencia: trabaja únicamente el movimiento asignado hoy y no adelantes aprendizajes de etapas posteriores aunque parezcan útiles. Si existe un aprendizaje entregado inmediatamente antes, construye desde él sin afirmar que la persona lo aplicó, lo aprendió o lo logró salvo que haya evidencia confirmada. Evita reiniciar innecesariamente desde la introducción del contexto. Usa solo hechos confirmados. Respeta las instrucciones de recepción y el momento del día. Entrega contexto reconocible, una distinción o insight y algo utilizable cuando el movimiento lo necesite. No inventes psicología, no diagnostiques, no hagas coaching, no repitas movimientos anteriores, no fuerces preguntas, acciones ni cierres. No uses la expresión "poco a poco". Escribe directamente el mensaje en español natural. Devuelve únicamente JSON con la propiedad message.',
    user: writerV2Prompt(input, options.repairReasons),
  });
  const value = result.value && typeof result.value === 'object' ? result.value as { message?: unknown } : {};
  const message = typeof value.message === 'string' ? value.message.trim() : '';
  return { message, usage: result.usage, model: result.model, responseId: result.responseId };
}

export async function generateWriterV2WithRepair(input: WriterV2Input, options: { model: string; maxOutputTokens?: number; generate?: typeof generateWriterV2 }) {
  const generate = options.generate ?? generateWriterV2;
  const attempts: Array<{ message: string; evaluation: WriterV2Evaluation }> = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const previous = attempts.at(-1);
    const repairReasons = previous ? [...previous.evaluation.hardFailures, ...(previous.evaluation.movementExpression?.adjacentMovementDrift ? [`El texto adelantó ${previous.evaluation.movementExpression.dominantMovement}; conserva únicamente ${input.canonicalTargetMovement ?? input.psychologicalMove} y evita desarrollar ese movimiento vecino.`] : [])] : [];
    const result = await generate(input, { model: options.model, maxOutputTokens: options.maxOutputTokens, repairReasons });
    const evaluation = evaluateWriterV2(result.message, input);
    attempts.push({ message: result.message, evaluation });
    if (evaluation.approved) return { ...result, attempts, repaired: attempt === 1 };
  }
  return { message: attempts.at(-1)?.message ?? '', usage: undefined, model: options.model, responseId: null, attempts, repaired: true };
}
