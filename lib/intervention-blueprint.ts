import type { InterventionBrief, InterventionCandidate } from './intervention-engine.ts';

export const canonicalBlueprintTypes = [
  'espejo_contextual', 'reencuadre', 'distincion', 'pregunta_precision',
  'preparacion_situacional', 'microaccion', 'interrupcion_breve',
  'recuperacion_posterior', 'evidencia_longitudinal', 'recalibracion',
] as const;
export type CanonicalBlueprintType = typeof canonicalBlueprintTypes[number];
export type BlueprintTiming = 'anticipatorio' | 'en_momento' | 'posterior' | 'sin_evento';

export type SemaContract = {
  signal: string;
  direction_link: string;
  movement: string;
  opening_type: string;
};

export type InterventionBlueprint = {
  intervention_type: CanonicalBlueprintType;
  intervention_reason: string;
  signal: string;
  direction_link: string;
  psychological_mechanism: string;
  movement: string;
  insight: string;
  functional_emotion: string;
  directiveness: string;
  opening_type: string;
  closing_type: string;
  action_id: string | null;
  question: string | null;
  micro_action: string | null;
  expected_movement: string;
  prohibited_moves: string[];
  evidence_basis: string[];
  timing: BlueprintTiming;
  repetition_signature: string;
  sema: SemaContract;
  requires_transfer: boolean;
};

function firstSignal(brief: InterventionBrief) {
  return brief.relevantSituations?.find(Boolean) || brief.currentContext;
}

function targetMovement(brief: InterventionBrief) {
  return brief.psychologicalProgression?.next_recommended_movement
    || brief.editorialPlan?.target_movement
    || brief.psychologicalContract?.psychological_move
    || 'observar la situación con un criterio más útil';
}

export function buildInterventionBlueprint(brief: InterventionBrief): InterventionBlueprint | null {
  const contract = brief.psychologicalContract;
  if (!contract?.sufficient || !contract.situation || !contract.user_direction) return null;
  const signal = firstSignal(brief);
  const movement = targetMovement(brief);
  const mechanism = contract.mechanism_id;
  const isDecisionCriterion = movement.includes('define_decision_criterion') || /criterio.*decidir|condici[oó]n.*decidir|criterio propio/i.test(movement);
  const isThreshold = movement.includes('set_reconsideration_threshold') || /umbral|reconsiderar|cambiar.*decisi[oó]n/i.test(movement);
  const type: CanonicalBlueprintType = isDecisionCriterion ? 'distincion' : isThreshold ? 'microaccion' : 'espejo_contextual';
  const insight = isDecisionCriterion
    ? 'Escuchar opiniones no sustituye tener un criterio: una decisión puede evaluarse con dos o tres condiciones propias antes de sumar más voces.'
    : isThreshold
      ? 'Reconsiderar no significa obedecer cada duda: conviene definir qué dato concreto tendría que cambiar para revisar la decisión.'
      : `La situación observada merece una respuesta concreta conectada con ${brief.desiredChange}.`;
  const microAction = isDecisionCriterion
    ? 'Antes de consultar, escribe dos o tres condiciones que la opción tendría que cumplir y usa esas condiciones para valorar lo que escuches.'
    : isThreshold
      ? 'Escribe qué dato concreto tendría que aparecer para que reconsideres la decisión.'
      : null;
  const expected = isDecisionCriterion
    ? 'Podrá escuchar opiniones sin convertir su cantidad en sustituto de su propio criterio.'
    : isThreshold
      ? 'Podrá distinguir una razón nueva para revisar de la incomodidad de decidir.'
      : contract.expected_movement;
  const sema: SemaContract = {
    signal,
    direction_link: `Esta situación se conecta con la dirección: ${brief.desiredChange}.`,
    movement,
    opening_type: 'contextual_situation',
  };
  return {
    intervention_type: type,
    intervention_reason: `La situación confirmada muestra una oportunidad para ${movement} sin repetir el movimiento anterior.`,
    signal,
    direction_link: sema.direction_link,
    psychological_mechanism: mechanism,
    movement,
    insight,
    functional_emotion: isDecisionCriterion ? 'claridad' : 'seguridad',
    directiveness: isDecisionCriterion ? 'suggestive' : 'reflective',
    opening_type: sema.opening_type,
    closing_type: microAction ? 'micro_action' : 'none',
    action_id: microAction ? 'define_personal_criteria' : null,
    question: isDecisionCriterion ? '¿Qué tendría que cumplir una opción para que la elijas?' : null,
    micro_action: microAction,
    expected_movement: expected,
    prohibited_moves: ['no pedir que deje de consultar', 'no diagnosticar inseguridad', 'no sustituir su decisión', 'no añadir otra técnica'],
    evidence_basis: ['current_context', ...(brief.relevantSituations?.length ? ['relevant_situations'] : [])],
    timing: 'anticipatorio',
    repetition_signature: `${mechanism}:${movement}:${type}:define_personal_criteria`,
    sema,
    requires_transfer: Boolean(microAction),
  };
}

export type BlueprintAudit = {
  sema: boolean;
  fidelity: boolean;
  reasons: string[];
};

export function auditBlueprintFidelity(candidate: Pick<InterventionCandidate, 'text' | 'blocks' | 'optionalAction' | 'psychologicalMove' | 'takeaway'>, blueprint: InterventionBlueprint | null): BlueprintAudit {
  if (!blueprint) return { sema: false, fidelity: false, reasons: ['sema_missing', 'intervention_blueprint_missing'] };
  const text = candidate.text.toLowerCase();
  const hasToolBlock = (candidate.blocks ?? []).some(block => ['tool', 'step', 'action'].includes(block.type));
  const hasActionVerb = /anota|escribe|elige|define|nombra|identifica|comprueba|revisa|distingue|separa/.test(text);
  const hasTransfer = hasActionVerb || hasToolBlock || Boolean(candidate.optionalAction?.trim());
  const sema = Boolean(blueprint.sema.signal && blueprint.sema.direction_link && blueprint.sema.movement && blueprint.sema.opening_type);
  const reasons: string[] = [];
  if (!sema) reasons.push('sema_incomplete');
  if (blueprint.requires_transfer && !hasTransfer) reasons.push('blueprint_transfer_missing');
  if (blueprint.intervention_type === 'distincion' && !(/disting|separ|no sustitu|no equivale|criterio|condici[oó]n|antes de/.test(text))) reasons.push('blueprint_distinction_missing');
  if (blueprint.prohibited_moves.some(move => /deje de consultar|diagnosticar|sustituir su decisión/.test(move) && text.includes(move))) reasons.push('blueprint_prohibited_move');
  return { sema, fidelity: sema && reasons.length === 0, reasons };
}
