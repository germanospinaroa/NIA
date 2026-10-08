export type MovementExpressionResult = {
  targetExpressed: boolean;
  adjacentMovementDrift: boolean;
  dominantMovement: string | null;
};

export type MovementTargetGuidance = {
  target: string;
  purpose: string;
  inScope: string[];
  outOfScope: string[];
  valueKind: MovementValueKind;
  deliveredLearning: string;
  buildsOn: string | null;
  evidenceRequirements: MovementEvidenceRequirement[];
  conditional: boolean;
};

export type MovementValueKind = 'recognition' | 'distinction' | 'clarification' | 'criterion' | 'action' | 'practice' | 'review' | 'evidence';
export type MovementEvidenceRequirement = 'base_context' | 'delivered_learning' | 'confirmed_event' | 'confirmed_behavior';

type ExpressionContract = {
  signals: RegExp[];
  adjacent: Array<{ key: string; signals: RegExp[] }>;
};

const contract = (signals: RegExp[], adjacent: ExpressionContract['adjacent'] = []): ExpressionContract => ({ signals, adjacent });

const contracts: Record<string, ExpressionContract> = {
  'external_validation:notice_the_consulting_pattern': contract([
    /primera respuesta|respuesta propia|ya tienes.*respuesta/i,
    /pedir.*(opinion|opiniones|consejo)|consultar.*(varias|otra)|preguntar.*(varias|otra)/i,
    /aun asi|aun así|despues.*(respuesta|decidir)|después.*(respuesta|decidir)/i,
  ], [
    { key: 'external_validation:information_vs_delegating_decision', signals: [/informaci[oó]n.*(falta|consulta|opini[oó]n|decidir)/i, /confirmar.*respuesta|entregar.*decisi[oó]n|opini[oó]n.*decisi[oó]n/i] },
    { key: 'external_validation:set_reconsideration_threshold', signals: [/dato.*(cambiar|reconsiderar)|tendr[ií]a que cambiar|para reconsiderar/i] },
    { key: 'external_validation:decide_with_sufficient_information', signals: [/informaci[oó]n.*suficiente|decidir.*(sin|aunque).*certeza|suficiente.*decidir/i] },
  ]),
  'external_validation:information_vs_delegating_decision': contract([
    /informaci[oó]n.*(falta|nueva|aporta|decidir)/i,
    /opini[oó]n.*decisi[oó]n|consulta.*(confirmar|decisi[oó]n)|escuchar.*(decidir|decisi[oó]n)/i,
    /no significa.*(decidir|entregar)|no equivale.*(decidir|entregar)|separar.*informaci[oó]n/i,
  ], [
    { key: 'external_validation:define_decision_criterion', signals: [/criterio|condiciones?.*(cumplir|valorar)|que.*(deber[ií]a).*cumplir/i] },
    { key: 'external_validation:set_reconsideration_threshold', signals: [/dato.*(cambiar|reconsiderar)|tendr[ií]a que cambiar/i] },
  ]),
  'external_validation:define_decision_criterion': contract([
    /criterio|condiciones?.*(cumplir|valorar)|que.*(deber[ií]a).*cumplir/i,
    /(antes de|para) consultar.*(criterio|condici[oó]n)|criterio.*(evaluar|decidir)/i,
  ], [{ key: 'external_validation:set_reconsideration_threshold', signals: [/dato.*(cambiar|reconsiderar)|tendr[ií]a que cambiar|para reconsiderar/i] }]),
  'external_validation:set_reconsideration_threshold': contract([
    /dato.*(cambiar|reconsiderar|reconsideres)|tendr[ií]a que cambiar|para que reconsideres?|para reconsiderar|condici[oó]n.*(revisar|cambiar)/i,
  ], [{ key: 'external_validation:decide_with_sufficient_information', signals: [/informaci[oó]n suficiente|decidir.*(sin|aunque).*certeza|suficiente.*decidir/i] }]),
  'external_validation:decide_with_sufficient_information': contract([
    /informaci[oó]n suficiente|decidir.*(sin|aunque).*certeza|suficiente.*decidir|ya tienes.*informaci[oó]n.*decidir/i,
  ], [{ key: 'external_validation:review_outcome_without_self_punishment', signals: [/despu[eé]s.*(decisi[oó]n|resultado)|qu[eé] ocurri[oó]|revisar.*(sin|evitando).*culpa/i] }]),
  'external_validation:review_outcome_without_self_punishment': contract([
    /despu[eé]s.*(decisi[oó]n|resultado)|qu[eé] ocurri[oó]|revisar.*(sin|evitando).*culpa|aprender.*resultado/i,
  ], [{ key: 'external_validation:build_evidence_of_own_capacity', signals: [/evidencia.*(capacidad|logro)|lo que.*(logrado|pudiste)|registrar.*(avance|capacidad)/i] }]),
  'external_validation:build_evidence_of_own_capacity': contract([/evidencia.*(capacidad|logro)|lo que.*(logrado|pudiste)|registrar.*(avance|capacidad)|prueba.*(capaz|capacidad)|decisiones.*pudiste|lograste.*resolver/i]),

  'uncertainty_clarification:name_the_concrete_question': contract([
    /pregunta concreta|qu[eé].*(necesito|falta).*saber/i,
    /dato.*(falta|concreto|necesario)|instrucciones.*(aclaran|no aclaran|necesito aclarar)|sigue sin respuesta/i,
    /para empezar.*saber|nombrar.*duda|precisar.*duda/i,
  ], [
    { key: 'uncertainty_clarification:identify_what_is_known', signals: [/qu[eé].*(ya sabes|conoces)|separar.*(sabes|conoces).*no sabes|esto.*s[ií].*sabes/i] },
    { key: 'uncertainty_clarification:act_without_total_certainty', signals: [/sin.*certeza|aunque.*(no sepas|no tengas)|actuar.*duda|avanzar.*sin/i] },
  ]),
  'uncertainty_clarification:identify_what_is_known': contract([
    /qu[eé].*(ya sabes|conoces)|separar.*(sabes|conoces).*no sabes|esto.*s[ií].*sabes|lo que.*(conoces|ya tienes)/i,
  ], [
    { key: 'uncertainty_clarification:name_the_concrete_question', signals: [/pregunta concreta|qu[eé].*(necesito|falta).*saber|dato.*falta/i] },
    { key: 'uncertainty_clarification:choose_a_sufficient_next_step', signals: [/siguiente paso|paso suficiente|qu[eé].*(puedes|hacer).*ahora/i] },
  ]),
  'uncertainty_clarification:choose_a_sufficient_next_step': contract([/siguiente paso|paso suficiente|qu[eé].*(puedes|hacer).*ahora|elige.*paso|probar.*ahora/i], [{ key: 'uncertainty_clarification:act_without_total_certainty', signals: [/sin.*certeza|aunque.*(no sepas|no tengas)|actuar.*duda|avanzar.*sin/i] }]),
  'uncertainty_clarification:act_without_total_certainty': contract([/sin.*certeza|aunque.*(no sepas|no tengas)|actuar.*duda|avanzar.*sin|hacerlo.*aunque/i]),

  'decision_criteria:name_the_decision_rule': contract([/regla.*(decisi[oó]n|usar)|criterio.*(decisi[oó]n|usar)|decidir.*(seg[uú]n)/i]),
  'decision_criteria:set_reconsideration_threshold': contract([/dato.*(cambiar|reconsiderar)|tendr[ií]a que cambiar|para reconsiderar|condici[oó]n.*(revisar|cambiar)/i]),
  'decision_criteria:decide_with_sufficient_information': contract([/informaci[oó]n suficiente|decidir.*(sin|aunque).*certeza|suficiente.*decidir/i]),
  'decision_criteria:review_outcome_without_self_punishment': contract([/despu[eé]s.*(decisi[oó]n|resultado)|qu[eé] ocurri[oó]|revisar.*(sin|evitando).*culpa/i]),
  'situational_preparation:notice_the_trigger': contract([/cuando.*ocurre|se[ñn]al|notar.*momento|disparador|f[ií]jate.*cuando/i]),
  'situational_preparation:prepare_an_alternative_response': contract([/si.*entonces|respuesta alternativa|puedes decir|prepara.*respuesta|en lugar de.*puedes/i]),
  'situational_preparation:practice_the_response_in_context': contract([/practica|ensaya|repite.*frase|probar.*respuesta/i]),
  'situational_preparation:review_what_happened': contract([/qu[eé] pas[oó]|despu[eé]s.*ocurri[oó]|revisa.*respuesta|mira.*que ocurri[oó]/i]),
  'progress_monitoring:notice_two_observations': contract([/dos observaciones|en dos ocasiones|dos veces|segunda vez/i]),
  'progress_monitoring:name_what_changed': contract([/qu[eé] cambi[oó]|diferencia.*antes.*despu[eé]s|lo que ahora/i]),
  'progress_monitoring:build_evidence_of_own_capacity': contract([/evidencia.*(capacidad|logro)|lo que.*(logrado|pudiste)|registrar.*(avance|capacidad)|prueba.*(capaz|capacidad)|lograste.*resolver/i]),
};

const guidance = (valueKind: MovementValueKind, purpose: string, inScope: string[], outOfScope: string[] = []): MovementTargetGuidance => ({
  target: '', purpose, inScope, outOfScope, valueKind,
  deliveredLearning: purpose,
  buildsOn: null,
  evidenceRequirements: ['base_context'],
  conditional: false,
});

const guidanceByMovement: Record<string, MovementTargetGuidance> = {
  'external_validation:notice_the_consulting_pattern': guidance('recognition', 'Reconocer la secuencia entre tener una primera respuesta y empezar a pedir opiniones.', ['primera respuesta propia', 'momento en que empieza a consultar', 'hacer visible la secuencia'], ['information_vs_delegating_decision', 'define_decision_criterion', 'set_reconsideration_threshold', 'decide_with_sufficient_information', 'review_outcome_without_self_punishment']),
  'external_validation:information_vs_delegating_decision': guidance('distinction', 'Distinguir escuchar información de entregar el cierre de la decisión.', ['qué información aporta una opinión', 'la opinión no decide por la persona', 'separar consulta y decisión'], ['define_decision_criterion', 'set_reconsideration_threshold', 'decide_with_sufficient_information']),
  'external_validation:define_decision_criterion': guidance('criterion', 'Hacer explícitas las condiciones propias con las que se evaluará una opción.', ['criterios o condiciones propias', 'qué tendría que cumplir una opción', 'evaluar lo que se escucha con esas condiciones'], ['set_reconsideration_threshold', 'decide_with_sufficient_information', 'review_outcome_without_self_punishment']),
  'external_validation:set_reconsideration_threshold': guidance('criterion', 'Definir qué dato concreto justificaría revisar una decisión.', ['dato que cambiaría la decisión', 'condición para reconsiderar', 'separar una razón nueva de la incomodidad'], ['decide_with_sufficient_information', 'review_outcome_without_self_punishment']),
  'external_validation:decide_with_sufficient_information': guidance('criterion', 'Reconocer cuándo existe información suficiente para decidir sin exigir certeza total.', ['información disponible', 'umbral suficiente para decidir', 'incertidumbre que puede permanecer'], ['review_outcome_without_self_punishment', 'build_evidence_of_own_capacity']),
  'external_validation:review_outcome_without_self_punishment': guidance('review', 'Revisar qué ocurrió después de decidir sin convertir el resultado en una evaluación total de la persona.', ['hechos posteriores', 'qué funcionó o qué se aprendió', 'revisión sin castigo'], ['build_evidence_of_own_capacity']),
  'external_validation:build_evidence_of_own_capacity': guidance('evidence', 'Reconocer evidencia acumulada de decisiones y capacidades observables.', ['observaciones reales', 'decisiones o acciones que pudo realizar', 'evidencia concreta acumulada'], []),
  'uncertainty_clarification:name_the_concrete_question': guidance('clarification', 'Convertir una duda amplia en la pregunta o dato concreto que falta.', ['qué necesita saber', 'pregunta pendiente', 'dato concreto que falta'], ['identify_what_is_known', 'choose_a_sufficient_next_step', 'act_without_total_certainty']),
  'uncertainty_clarification:identify_what_is_known': guidance('distinction', 'Separar lo que ya está indicado o conocido de lo que todavía falta.', ['lo que ya sabe', 'lo que las instrucciones sí indican', 'lo que no está indicado'], ['name_the_concrete_question', 'choose_a_sufficient_next_step', 'act_without_total_certainty']),
  'uncertainty_clarification:choose_a_sufficient_next_step': guidance('action', 'Elegir el siguiente paso suficiente sin intentar resolver toda la incertidumbre.', ['acción siguiente concreta', 'paso pequeño y suficiente', 'qué puede probar ahora'], ['name_the_concrete_question', 'identify_what_is_known', 'act_without_total_certainty']),
  'uncertainty_clarification:act_without_total_certainty': guidance('action', 'Actuar con la información disponible aunque no exista certeza total.', ['acción pese a la incertidumbre', 'qué puede hacer sin saberlo todo', 'aceptar información incompleta'], ['name_the_concrete_question', 'identify_what_is_known', 'choose_a_sufficient_next_step']),
  'decision_criteria:name_the_decision_rule': guidance('criterion', 'Nombrar la regla o criterio que orientará una decisión.', ['regla elegida', 'criterio que se usará', 'cómo se evaluará la opción'], ['set_reconsideration_threshold', 'decide_with_sufficient_information']),
  'decision_criteria:set_reconsideration_threshold': guidance('criterion', 'Definir la condición que justificaría reconsiderar una decisión.', ['dato o condición de cambio', 'cuándo revisar', 'umbral explícito'], ['decide_with_sufficient_information', 'review_outcome_without_self_punishment']),
  'decision_criteria:decide_with_sufficient_information': guidance('criterion', 'Decidir cuando el criterio y la información disponible sean suficientes.', ['base disponible', 'suficiencia práctica', 'decidir sin certeza absoluta'], ['review_outcome_without_self_punishment']),
  'decision_criteria:review_outcome_without_self_punishment': guidance('review', 'Revisar el resultado concreto de una decisión sin castigarse.', ['qué ocurrió', 'qué se puede aprender', 'resultado sin juicio global'], []),
  'situational_preparation:notice_the_trigger': guidance('recognition', 'Reconocer la señal concreta que anuncia una situación habitual.', ['señal observable', 'momento en que aparece', 'qué ocurre justo antes'], ['prepare_an_alternative_response', 'practice_the_response_in_context']),
  'situational_preparation:prepare_an_alternative_response': guidance('practice', 'Preparar una respuesta alternativa para una situación futura conocida.', ['si ocurre X, responder Y', 'frase o conducta alternativa', 'situación futura concreta'], ['practice_the_response_in_context', 'review_what_happened']),
  'situational_preparation:practice_the_response_in_context': guidance('practice', 'Ensayar la respuesta elegida dentro de la situación concreta.', ['practicar la frase o conducta', 'ensayo situado', 'cómo responder en contexto'], ['review_what_happened']),
  'situational_preparation:review_what_happened': guidance('review', 'Revisar qué ocurrió al intentar la respuesta preparada.', ['hechos posteriores', 'qué respuesta apareció', 'qué ajustar después'], []),
  'progress_monitoring:notice_two_observations': guidance('recognition', 'Observar dos ocasiones concretas antes de extraer una conclusión.', ['dos observaciones independientes', 'ocasiones concretas', 'qué se repitió o apareció'], ['name_what_changed', 'build_evidence_of_own_capacity']),
  'progress_monitoring:name_what_changed': guidance('clarification', 'Nombrar el cambio observable entre dos momentos o situaciones.', ['antes y después', 'diferencia observable', 'qué cambió exactamente'], ['build_evidence_of_own_capacity']),
  'progress_monitoring:build_evidence_of_own_capacity': guidance('evidence', 'Reunir evidencia observable de lo que la persona pudo hacer.', ['acciones o decisiones observadas', 'evidencia acumulada', 'capacidad descrita sin extrapolar'], []),
};

for (const [target, value] of Object.entries(guidanceByMovement)) value.target = target;

// These fields are part of the same canonical movement contract. Defaults are
// derived from the canonical path so they cannot silently diverge from it;
// exceptional movements below declare stricter evidence explicitly.
export const CANONICAL_MOVEMENT_PATHS: Record<string, string[]> = {
  external_validation: ['external_validation:notice_the_consulting_pattern', 'external_validation:information_vs_delegating_decision', 'external_validation:define_decision_criterion', 'external_validation:set_reconsideration_threshold', 'external_validation:decide_with_sufficient_information', 'external_validation:review_outcome_without_self_punishment', 'external_validation:build_evidence_of_own_capacity'],
  uncertainty_clarification: ['uncertainty_clarification:name_the_concrete_question', 'uncertainty_clarification:identify_what_is_known', 'uncertainty_clarification:choose_a_sufficient_next_step', 'uncertainty_clarification:act_without_total_certainty'],
  decision_criteria: ['decision_criteria:name_the_decision_rule', 'decision_criteria:set_reconsideration_threshold', 'decision_criteria:decide_with_sufficient_information', 'decision_criteria:review_outcome_without_self_punishment'],
  situational_preparation: ['situational_preparation:notice_the_trigger', 'situational_preparation:prepare_an_alternative_response', 'situational_preparation:practice_the_response_in_context', 'situational_preparation:review_what_happened'],
  progress_monitoring: ['progress_monitoring:notice_two_observations', 'progress_monitoring:name_what_changed', 'progress_monitoring:build_evidence_of_own_capacity'],
};
for (const path of Object.values(CANONICAL_MOVEMENT_PATHS)) {
  path.forEach((target, index) => {
    const value = guidanceByMovement[target];
    if (!value) return;
    value.buildsOn = index > 0 ? path[index - 1] : null;
    value.deliveredLearning = value.purpose;
  });
}
for (const target of [
  'external_validation:review_outcome_without_self_punishment',
  'decision_criteria:review_outcome_without_self_punishment',
  'situational_preparation:review_what_happened',
]) {
  guidanceByMovement[target].conditional = true;
  guidanceByMovement[target].evidenceRequirements = ['base_context', 'confirmed_event', 'confirmed_behavior'];
}
for (const target of ['progress_monitoring:name_what_changed']) {
  guidanceByMovement[target].conditional = true;
  guidanceByMovement[target].evidenceRequirements = ['base_context', 'confirmed_event'];
}
for (const target of ['progress_monitoring:build_evidence_of_own_capacity']) {
  guidanceByMovement[target].conditional = true;
  guidanceByMovement[target].evidenceRequirements = ['base_context', 'confirmed_behavior'];
}
// This movement can use confirmed evidence already present in the base
// context; it does not require the optional review-after-outcome movement.
guidanceByMovement['external_validation:build_evidence_of_own_capacity'].buildsOn = 'external_validation:decide_with_sufficient_information';

// Every mechanism in the psychological contract must enter one of these
// already-supported movement families. This is the single mechanism →
// movement contract used by progression and recurrent planning.
export const CANONICAL_MECHANISM_FAMILIES: Record<string, keyof typeof CANONICAL_MOVEMENT_PATHS> = {
  external_validation: 'external_validation',
  uncertainty_clarification: 'uncertainty_clarification',
  decision_criteria: 'decision_criteria',
  implementation_intention: 'situational_preparation',
  progress_monitoring: 'progress_monitoring',
  avoidance_preparation: 'situational_preparation',
  intention_retrieval: 'situational_preparation',
  rumination_interrupt: 'uncertainty_clarification',
  post_event_reappraisal: 'decision_criteria',
  self_criticism_reframe: 'external_validation',
  attention_reorientation: 'uncertainty_clarification',
  emotional_differentiation: 'uncertainty_clarification',
  cognitive_reappraisal: 'decision_criteria',
  perspective_shift: 'decision_criteria',
  context_clarification: 'uncertainty_clarification',
};

export function canonicalMovementPathForMechanism(mechanismId: string | null | undefined) {
  const family = mechanismId ? CANONICAL_MECHANISM_FAMILIES[mechanismId] : undefined;
  return family ? CANONICAL_MOVEMENT_PATHS[family] ?? null : null;
}

function matchesAny(text: string, signals: RegExp[]) {
  return signals.some(signal => signal.test(text));
}

export type MovementValueResult = {
  approved: boolean;
  valueKind: MovementValueKind | null;
};

function recognitionValue(text: string) {
  const hasRecognitionCue = /observa|nota|f[ií]jate|identifica|reconocer|secuencia|momento|paso entre/i.test(text);
  const hasConcreteSequence = /(primera respuesta|respuesta propia|despu[eé]s.*(opini[oó]n|consult)|antes de.*(opini[oó]n|consult)|primero.*despu[eé]s|entre .* y |pasas de .* a empezar|pensar .* preguntar)/i.test(text);
  return hasRecognitionCue && hasConcreteSequence;
}

function valueForKind(kind: MovementValueKind, text: string) {
  if (kind === 'recognition') return recognitionValue(text);
  if (kind === 'distinction') return /distinguir|separar|no significa|no equivale|la diferencia entre|entre .+ y .+/i.test(text);
  if (kind === 'clarification') return /pregunta concreta|dato concreto|necesito saber|aclarar|nombrar.*duda|qué.*falta/i.test(text);
  if (kind === 'criterion') return /criterio|condici[oó]n|regla|dato.*(cambiar|reconsiderar)|informaci[oó]n suficiente/i.test(text);
  if (kind === 'action') return /puedes|elige|prueba|haz|empieza|siguiente paso|avanza|decide/i.test(text) && text.split(/\s+/).length >= 8;
  if (kind === 'practice') return /practica|ensaya|prepara|respuesta alternativa|si .* entonces/i.test(text);
  if (kind === 'review') return /despu[eé]s|revisa|qu[eé] ocurri[oó]|aprend/i.test(text);
  if (kind === 'evidence') return /evidencia|registr|observa|dos veces|ocasiones|logr|pudiste/i.test(text);
  return false;
}

export function evaluateMovementExpression(canonicalTargetMovement: string | null | undefined, message: string): MovementExpressionResult {
  const target = canonicalTargetMovement?.trim() ?? '';
  const expression = contracts[target];
  if (!expression) return { targetExpressed: true, adjacentMovementDrift: false, dominantMovement: target || null };
  const targetExpressed = matchesAny(message, expression.signals);
  const adjacent = expression.adjacent.find(candidate => matchesAny(message, candidate.signals));
  return { targetExpressed, adjacentMovementDrift: Boolean(adjacent), dominantMovement: adjacent?.key ?? (targetExpressed ? target : null) };
}

export function evaluateMovementValue(canonicalTargetMovement: string | null | undefined, message: string): MovementValueResult {
  const guidance = getMovementTargetGuidance(canonicalTargetMovement);
  if (!guidance) return { approved: false, valueKind: null };
  return { approved: valueForKind(guidance.valueKind, message), valueKind: guidance.valueKind };
}

export function canonicalMovementExpressionKeys() {
  return Object.keys(contracts);
}

export function getMovementTargetGuidance(canonicalTargetMovement: string | null | undefined): MovementTargetGuidance | null {
  const target = canonicalTargetMovement?.trim();
  if (!target) return null;
  return guidanceByMovement[target] ?? null;
}

export function allMovementTargetGuidance() {
  return Object.values(guidanceByMovement);
}

export function validateCanonicalMovementContract(mechanismIds: string[] = Object.keys(CANONICAL_MECHANISM_FAMILIES)) {
  const errors: string[] = [];
  for (const mechanismId of mechanismIds) {
    const family = CANONICAL_MECHANISM_FAMILIES[mechanismId];
    if (!family) {
      errors.push(`${mechanismId}:missing_family_mapping`);
      continue;
    }
    const path = CANONICAL_MOVEMENT_PATHS[family];
    if (!path?.length) {
      errors.push(`${mechanismId}:missing_movement_path`);
      continue;
    }
    for (const movement of path) if (!getMovementTargetGuidance(movement)) errors.push(`${mechanismId}:${movement}:missing_guidance`);
  }
  return errors;
}
