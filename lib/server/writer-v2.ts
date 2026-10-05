import type { InterventionBrief } from '../intervention-engine.ts';
import { requestWriterV2Json } from './writer-v2-provider.ts';

export type WriterV2Input = {
  situation: string;
  desiredChange: string;
  psychologicalMove: string;
  movementExplanation: string;
  confirmedFacts: string[];
  recentMovements: string[];
  communicationPreference: string | null;
  safetyConstraints: string[];
};

export type WriterV2Output = { message: string };

export type WriterV2Evaluation = {
  approved: boolean;
  hardFailures: string[];
  warnings: string[];
};

const genericOnly = /^(conf[ií]a en ti|recuerda que eres capaz|es normal dudar|date permiso para confiar)[.! ]*$/i;
const inventedPsychology = /\b(eres insegura|tienes ansiedad|tienes un trauma|te autosaboteas|tu miedo te controla|tienes baja autoestima)\b/i;
const emptyClosing = /(?:nos leemos mañana|descansa[,.]? mañana seguimos|aquí estaré|recuerda que)[.! ]*$/i;
const words = (value: string) => new Set(value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-záéíóúñü]{4,}/gi) ?? []);

export function writerV2InputFromBrief(brief: InterventionBrief): WriterV2Input {
  const blueprint = brief.interventionBlueprint;
  const progression = brief.psychologicalProgression;
  const situation = blueprint?.signal || brief.relevantSituations?.[0] || brief.currentContext || '';
  const movement = blueprint?.movement || progression?.next_recommended_movement || brief.psychologicalContract?.psychological_move || '';
  const explanation = [blueprint?.insight, blueprint?.expected_movement, blueprint?.micro_action].filter((value): value is string => Boolean(value?.trim())).join(' ');
  return {
    situation,
    desiredChange: brief.desiredChange,
    psychologicalMove: movement,
    movementExplanation: explanation || brief.psychologicalContract?.psychological_move || '',
    confirmedFacts: [brief.currentContext, ...(brief.relevantSituations ?? []), ...(blueprint?.evidence_basis ?? [])].filter((value): value is string => Boolean(value?.trim())),
    recentMovements: [...new Set([...(progression?.completed_movements ?? []), ...(progression?.recent_movements ?? [])])],
    communicationPreference: brief.communicationPreference ?? null,
    safetyConstraints: ['No inventar hechos, emociones, motivos ni diagnósticos.', 'No hacer terapia, coaching genérico ni promesas clínicas.', 'No sustituir la decisión de la persona.'],
  };
}

export function writerV2Prompt(input: WriterV2Input, repairReasons: string[] = []) {
  return JSON.stringify({
    situation: input.situation,
    desired_change: input.desiredChange,
    psychological_move: input.psychologicalMove,
    movement_explanation: input.movementExplanation,
    confirmed_facts: input.confirmedFacts,
    recent_movements_not_to_repeat: input.recentMovements,
    communication_preference: input.communicationPreference,
    safety_constraints: input.safetyConstraints,
    repair_reasons: repairReasons,
  });
}

export function evaluateWriterV2(message: string, input: WriterV2Input): WriterV2Evaluation {
  const value = message.trim();
  const hardFailures: string[] = [];
  const warnings: string[] = [];
  if (!value) hardFailures.push('empty_message');
  if (genericOnly.test(value)) hardFailures.push('generic_no_value');
  if (inventedPsychology.test(value)) hardFailures.push('invented_psychology');
  if (value.length > 1400) hardFailures.push('message_too_long');
  if (input.psychologicalMove && input.recentMovements.includes(input.psychologicalMove)) hardFailures.push('repeated_psychological_movement');
  const situationTerms = [...words(input.situation)].filter(term => words(value).has(term));
  if (input.situation && situationTerms.length < 2) hardFailures.push('context_not_anchored');
  const movementTerms = [...words(`${input.psychologicalMove} ${input.movementExplanation}`)].filter(term => words(value).has(term));
  if (input.psychologicalMove && movementTerms.length < 2) hardFailures.push('movement_not_expressed');
  if (!/[?¿]|\b(prueba|anota|escribe|distingue|define|decide|observa|revisa|revisar|elige|fíjate|pregúntate|fijar|reconsiderar|reservar|aparezca|cambiar)\b/i.test(value)) hardFailures.push('no_transferable_value');
  if (emptyClosing.test(value)) warnings.push('filler_closing');
  if (value.length < 28) warnings.push('very_short');
  return { approved: hardFailures.length === 0, hardFailures, warnings };
}

export async function generateWriterV2(input: WriterV2Input, options: { model: string; maxOutputTokens?: number; repairReasons?: string[] }) {
  const result = await requestWriterV2Json({
    model: options.model,
    maxOutputTokens: options.maxOutputTokens ?? 320,
    system: 'Escribe una única intervención final para la persona. El servidor ya decidió el movimiento psicológico: exprésalo, no lo rediseñes. Usa solo hechos confirmados. Entrega contexto reconocible, una distinción o insight y algo utilizable cuando el movimiento lo necesite. No inventes psicología, no diagnostiques, no hagas coaching, no repitas movimientos anteriores, no fuerces preguntas, acciones ni cierres. Escribe directamente el mensaje en español natural. Devuelve únicamente JSON con la propiedad message.',
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
    const result = await generate(input, { model: options.model, maxOutputTokens: options.maxOutputTokens, repairReasons: previous?.evaluation.hardFailures ?? [] });
    const evaluation = evaluateWriterV2(result.message, input);
    attempts.push({ message: result.message, evaluation });
    if (evaluation.approved) return { ...result, attempts, repaired: attempt === 1 };
  }
  return { message: attempts.at(-1)?.message ?? '', usage: undefined, model: options.model, responseId: null, attempts, repaired: true };
}
