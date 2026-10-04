export type MechanismEvidenceLevel = 'evidence-informed' | 'product-heuristic';

export type PsychologicalMechanism = {
  id: string;
  name: string;
  description: string;
  observable_cues: string[];
  compatible_contexts: string[];
  when_to_use: string;
  when_not_to_use: string;
  compatible_intervention_types: string[];
  risk_flags: string[];
  evidence_level: MechanismEvidenceLevel;
  evidence_notes: string;
  preferred_language: string[];
  prohibited_inferences: string[];
};

export type PsychologicalInterventionContract = {
  situation: string;
  observable_pattern: string;
  user_direction: string;
  friction: string;
  mechanism_id: string;
  mechanism_confidence: 'high' | 'medium' | 'low';
  intervention_purpose: string;
  psychological_move: string;
  expected_movement: string;
  takeaway: string;
  optional_action: string | null;
  why_now: string;
  risk_flags: string[];
  sufficient: boolean;
};

// This is a small product library, not a clinical taxonomy. Only implementation
// intentions and the intention/behaviour gap cite the evidence already documented
// in docs/EVIDENCE-NIA.md; the remaining entries are explicit product heuristics.
export const psychologicalMechanisms: PsychologicalMechanism[] = [
  { id: 'uncertainty_clarification', name: 'Aclarar incertidumbre', description: 'Convertir una duda amplia en el punto concreto que falta decidir o comprobar.', observable_cues: ['duda', 'no tengo claro', 'incertidumbre'], compatible_contexts: ['decision', 'uncertainty'], when_to_use: 'Cuando la usuaria expresa una duda pero puede señalar la situación concreta.', when_not_to_use: 'Cuando solo hay una emoción general sin situación observable.', compatible_intervention_types: ['distinction', 'precision_question', 'reframe'], risk_flags: ['no convertir la duda en diagnóstico'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de formulación de producto; no es una afirmación de eficacia clínica.', preferred_language: ['qué punto falta', 'qué dato cambió'], prohibited_inferences: ['ansiedad', 'inseguridad como rasgo', 'miedo no expresado'] },
  { id: 'external_validation', name: 'Separar opinión de decisión', description: 'Distinguir escuchar información de entregar la decisión a otra persona.', observable_cues: ['otra opinión', 'alguien cuestiona', 'pedir consejo', 'desacuerdo'], compatible_contexts: ['decision', 'external_input'], when_to_use: 'Cuando el contexto confirma que una opinión aparece alrededor de una decisión.', when_not_to_use: 'Cuando no hay una opinión o decisión concreta.', compatible_intervention_types: ['distinction', 'reframe', 'situational_preparation'], risk_flags: ['no asumir que la opinión fue dañina'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto sobre autonomía; no demuestra un efecto psicológico.', preferred_language: ['escuchar', 'dato', 'decidir'], prohibited_inferences: ['búsqueda de aprobación como rasgo', 'dependencia'] },
  { id: 'rumination_interrupt', name: 'Interrumpir vueltas repetidas', description: 'Pasar de repetir la misma pregunta a observar el siguiente dato o movimiento concreto.', observable_cues: ['dar vueltas', 'sigo pensando', 'no dejo de pensar'], compatible_contexts: ['repeated_thought'], when_to_use: 'Cuando la repetición del pensamiento está expresada por la usuaria.', when_not_to_use: 'Cuando solo se menciona cansancio o duda sin repetición.', compatible_intervention_types: ['brief_interrupt', 'micro_action', 'precision_question'], risk_flags: ['no llamar rumiación a una sola duda'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto; no es diagnóstico.', preferred_language: ['qué pregunta sigue abierta', 'qué dato falta'], prohibited_inferences: ['trastorno', 'obsesión clínica'] },
  { id: 'post_event_reappraisal', name: 'Revisar lo ocurrido con precisión', description: 'Separar lo que ocurrió de la conclusión global que se sacó después.', observable_cues: ['después de', 'salió mal', 'me quedé pensando'], compatible_contexts: ['past_event', 'error'], when_to_use: 'Cuando existe un hecho posterior concreto que la usuaria quiere entender.', when_not_to_use: 'Cuando no hay un evento descrito.', compatible_intervention_types: ['reframe', 'distinction', 'recovery'], risk_flags: ['no reinterpretar resultados desconocidos'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto; no equivale a terapia cognitiva.', preferred_language: ['qué pasó', 'qué conclusión sacaste'], prohibited_inferences: ['trauma', 'herida', 'causa clínica'] },
  { id: 'avoidance_preparation', name: 'Preparar una situación', description: 'Convertir una intención confirmada en una respuesta posible para una situación concreta.', observable_cues: ['evito', 'no digo', 'termino haciendo', 'cuando llega el momento'], compatible_contexts: ['situational_behavior'], when_to_use: 'Cuando la usuaria describe una conducta que aparece en una situación reconocible.', when_not_to_use: 'Cuando no hay conducta o situación confirmada.', compatible_intervention_types: ['situational_preparation', 'micro_action'], risk_flags: ['no llamar evitación a no haber actuado'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto; no atribuye una causa psicológica.', preferred_language: ['la próxima vez que ocurra', 'puedes decir'], prohibited_inferences: ['miedo', 'pereza', 'autosabotaje'] },
  { id: 'self_criticism_reframe', name: 'Responder a un error sin generalizar', description: 'Diferenciar un resultado o conducta concreta de una evaluación total de la persona.', observable_cues: ['me equivoqué', 'fallé', 'salió mal', 'me culpo'], compatible_contexts: ['error', 'self_evaluation'], when_to_use: 'Cuando la autocrítica está expresada y anclada a un hecho.', when_not_to_use: 'Cuando no hay error o autoevaluación descrita.', compatible_intervention_types: ['reframe', 'recovery', 'distinction'], risk_flags: ['no negar el error real'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto; no hace claims sobre autoestima.', preferred_language: ['esa decisión', 'ese resultado'], prohibited_inferences: ['baja autoestima', 'perfeccionismo como diagnóstico'] },
  { id: 'attention_reorientation', name: 'Volver al dato relevante', description: 'Dirigir la atención hacia la información concreta que la situación permite observar.', observable_cues: ['me distraigo', 'pierdo de vista', 'no sé en qué fijarme'], compatible_contexts: ['attention', 'decision'], when_to_use: 'Cuando la usuaria expresa qué información pierde o no logra mirar.', when_not_to_use: 'Cuando no hay un dato o situación concreta.', compatible_intervention_types: ['precision_question', 'distinction', 'micro_action'], risk_flags: ['no inventar el dato relevante'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto.', preferred_language: ['qué dato', 'qué cambió'], prohibited_inferences: ['déficit de atención clínico'] },
  { id: 'emotional_differentiation', name: 'Distinguir experiencias cercanas', description: 'Separar sensaciones o respuestas que la usuaria está mezclando en una situación concreta.', observable_cues: ['no sé si', 'se siente igual', 'me confundo entre'], compatible_contexts: ['mixed_experience'], when_to_use: 'Cuando la usuaria nombra dos posibilidades que está confundiendo.', when_not_to_use: 'Cuando no hay experiencias descritas para diferenciar.', compatible_intervention_types: ['distinction', 'precision_question'], risk_flags: ['no nombrar emociones no expresadas'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto.', preferred_language: ['una cosa', 'otra cosa'], prohibited_inferences: ['estado emocional oculto'] },
  { id: 'cognitive_reappraisal', name: 'Cambiar una interpretación', description: 'Ofrecer una lectura alternativa de un hecho confirmado sin negar el hecho.', observable_cues: ['eso significa que', 'entonces soy', 'si pasó esto'], compatible_contexts: ['interpretation', 'decision'], when_to_use: 'Cuando la usuaria expresa la conclusión que está sacando de una situación.', when_not_to_use: 'Cuando no hay una interpretación expresada.', compatible_intervention_types: ['reframe', 'perspective_shift'], risk_flags: ['no sustituir la interpretación por una certeza nueva'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto; no se presenta como terapia.', preferred_language: ['también puede significar', 'eso no demuestra'], prohibited_inferences: ['causa profunda', 'diagnóstico'] },
  { id: 'perspective_shift', name: 'Cambiar el punto de comparación', description: 'Mirar la misma situación desde una pregunta o criterio distinto.', observable_cues: ['solo estoy mirando', 'lo veo como', 'no encuentro otra forma'], compatible_contexts: ['interpretation', 'decision'], when_to_use: 'Cuando el contexto permite nombrar el encuadre actual.', when_not_to_use: 'Cuando solo hay intención general.', compatible_intervention_types: ['perspective_shift', 'reframe', 'distinction'], risk_flags: ['no minimizar la situación'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto.', preferred_language: ['mira qué parte', 'otra pregunta'], prohibited_inferences: ['lo que realmente te pasa'] },
  { id: 'implementation_intention', name: 'Preparar un si-entonces', description: 'Vincular una situación señalada con una respuesta elegida de antemano.', observable_cues: ['cuando ocurra', 'la próxima vez', 'si me dicen', 'antes de'], compatible_contexts: ['situational_behavior', 'intention'], when_to_use: 'Cuando hay una situación futura suficientemente concreta y una respuesta que la usuaria quiere practicar.', when_not_to_use: 'Cuando la situación o la respuesta no están disponibles.', compatible_intervention_types: ['situational_preparation', 'micro_action'], risk_flags: ['no presentarlo como garantía'], evidence_level: 'evidence-informed', evidence_notes: 'Relacionado con implementation intentions; docs/EVIDENCE-NIA.md aclara que no valida NIA ni garantiza conducta.', preferred_language: ['si ocurre X, probaré Y'], prohibited_inferences: ['garantiza que actuarás'] },
  { id: 'intention_retrieval', name: 'Volver a una intención elegida', description: 'Recordar la dirección que la usuaria ya expresó cuando aparece la situación que la pone a prueba.', observable_cues: ['quiero', 'decidí', 'mi intención', 'cuando llega el momento'], compatible_contexts: ['intention', 'situational_behavior'], when_to_use: 'Cuando la intención y la situación están ambas confirmadas.', when_not_to_use: 'Cuando la intención es vaga o la situación no aparece.', compatible_intervention_types: ['recovery', 'situational_preparation', 'recognition'], risk_flags: ['no convertir intención en obligación'], evidence_level: 'evidence-informed', evidence_notes: 'Relacionado con la brecha intención-conducta descrita en docs/EVIDENCE-NIA.md; no demuestra eficacia de NIA.', preferred_language: ['habías elegido', 'vuelve a mirar'], prohibited_inferences: ['falta de compromiso'] },
  { id: 'decision_criteria', name: 'Hacer explícito un criterio', description: 'Nombrar qué información o condición haría cambiar una decisión.', observable_cues: ['no sé qué necesito', 'qué tendría que pasar', 'qué dato cambiaría'], compatible_contexts: ['decision', 'uncertainty'], when_to_use: 'Cuando existe una decisión concreta y la usuaria quiere revisar su criterio.', when_not_to_use: 'Cuando no hay decisión ni dato que comparar.', compatible_intervention_types: ['precision_question', 'distinction', 'micro_action'], risk_flags: ['no inventar la condición'], evidence_level: 'product-heuristic', evidence_notes: 'Heurística de producto.', preferred_language: ['qué dato cambiaría', 'qué necesitas saber'], prohibited_inferences: ['incapacidad para decidir'] },
  { id: 'progress_monitoring', name: 'Reconocer evidencia de avance', description: 'Usar dos o más observaciones reales para mirar un cambio sin convertirlo en evaluación personal.', observable_cues: ['esta semana', 'dos veces', 'volví a', 'logré'], compatible_contexts: ['longitudinal'], when_to_use: 'Solo con al menos dos observaciones independientes.', when_not_to_use: 'Con una sola señal o una impresión general.', compatible_intervention_types: ['longitudinal_evidence', 'recognition', 'recalibration'], risk_flags: ['no extrapolar cambio estable'], evidence_level: 'product-heuristic', evidence_notes: 'La regla de dos observaciones es de integridad de producto, no una validación clínica.', preferred_language: ['en dos ocasiones', 'esta semana apareció'], prohibited_inferences: ['has cambiado como persona'] },
];

function normalized(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
}

function hasObservableCue(value: string) {
  return /\b(cuando|cada vez|antes de|despues de|termino|busco|pido|evito|respondo|cambio|me quedo|digo que|hago|cuestiona|decidi|anote|aparece)\b/i.test(value) || /\b(otra opinion|otra persona|dar vueltas|salio mal|no tengo claro|no se que necesito|dos veces|esta semana)\b/i.test(value);
}

function chooseMechanism(context: string, direction: string) {
  const text = normalized(`${context} ${direction}`);
  const match = (ids: string[]) => ids.map(id => psychologicalMechanisms.find(mechanism => mechanism.id === id)).find(Boolean) ?? null;
  if (/opinion|consejo|cuestiona|desacuerdo/.test(text)) return match(['external_validation', 'perspective_shift']);
  if (/dar vueltas|no dejo de pensar/.test(text)) return match(['rumination_interrupt']);
  if (/evito|termino|no digo|cuando llega/.test(text)) return match(['implementation_intention', 'avoidance_preparation']);
  if (/error|fall(e|o)|salio mal|me culpo/.test(text)) return match(['post_event_reappraisal', 'self_criticism_reframe']);
  if (/que dato|que tendria que pasar|que necesito/.test(text)) return match(['decision_criteria']);
  if (/dos veces|esta semana|anote|logre/.test(text)) return match(['progress_monitoring']);
  if (/dud|incertidumbre|no tengo claro/.test(text)) return match(['uncertainty_clarification']);
  if (/intencion|decidi|quiero/.test(text)) return match(['intention_retrieval']);
  return null;
}

function movementDescription(mechanismId: string, preferredMovement?: string | null) {
  const key = preferredMovement?.trim() ?? '';
  const labels: Record<string, string> = {
    'external_validation:notice_the_consulting_pattern': 'observar cuándo empiezas a buscar otra opinión antes de decidir',
    'external_validation:information_vs_delegating_decision': 'distinguir la información que aporta una opinión de entregar la decisión',
    'external_validation:define_decision_criterion': 'definir qué condiciones tendría que cumplir una opción para que la elijas',
    'external_validation:set_reconsideration_threshold': 'definir qué tendría que cambiar para que reconsideres una decisión',
    'external_validation:decide_with_sufficient_information': 'decidir cuando ya tienes información suficiente, sin seguir acumulando opiniones',
    'external_validation:review_outcome_without_self_punishment': 'revisar el resultado de una decisión sin convertirlo en un juicio sobre ti',
    'external_validation:build_evidence_of_own_capacity': 'reconocer evidencia concreta de decisiones que pudiste tomar por tu cuenta',
    'uncertainty_clarification:name_the_concrete_question': 'convertir la duda en una pregunta concreta que puedas responder',
    'uncertainty_clarification:identify_what_is_known': 'separar lo que ya sabes de lo que todavía falta comprobar',
    'uncertainty_clarification:choose_a_sufficient_next_step': 'elegir el siguiente paso que aporte el dato que falta',
    'uncertainty_clarification:act_without_total_certainty': 'decidir qué puedes hacer aunque todavía no tengas certeza total',
    'decision_criteria:name_the_decision_rule': 'hacer explícita la regla que usarás para decidir',
    'decision_criteria:set_reconsideration_threshold': 'definir qué tendría que cambiar para reconsiderar la decisión',
    'decision_criteria:decide_with_sufficient_information': 'decidir cuando ya tienes información suficiente',
    'decision_criteria:review_outcome_without_self_punishment': 'revisar el resultado sin convertirlo en un juicio sobre ti',
    'situational_preparation:notice_the_trigger': 'reconocer la señal concreta que suele aparecer antes de responder',
    'situational_preparation:prepare_an_alternative_response': 'preparar una respuesta alternativa para esa situación concreta',
    'situational_preparation:practice_the_response_in_context': 'practicar esa respuesta en la situación donde quieres usarla',
    'situational_preparation:review_what_happened': 'revisar qué ocurrió cuando apareció esa situación',
    'progress_monitoring:notice_two_observations': 'registrar dos observaciones concretas antes de sacar una conclusión sobre tu avance',
    'progress_monitoring:name_what_changed': 'nombrar qué cambió entre una situación y otra',
    'progress_monitoring:build_evidence_of_own_capacity': 'reconocer evidencia concreta de lo que ya pudiste hacer por tu cuenta',
  };
  if (key.startsWith(`${mechanismId}:`) && labels[key]) return labels[key];
  if (mechanismId === 'external_validation') return 'distinguir información de entregar la decisión';
  if (mechanismId === 'implementation_intention') return 'preparar una respuesta para una situación concreta';
  if (mechanismId === 'decision_criteria') return 'hacer explícito qué dato justificaría revisar';
  if (mechanismId === 'uncertainty_clarification') return 'convertir una duda amplia en un punto concreto';
  return 'mirar la situación desde un criterio más útil';
}

export function formulatePsychologicalIntervention(input: { currentContext: string; desiredChange: string; relevantSituations?: string[]; recurringPatterns?: string[]; learningSignals?: Array<{ value?: unknown }>; preferredMovement?: string | null }): PsychologicalInterventionContract {
  const currentContext = input.currentContext.trim();
  const contextualSituation = hasObservableCue(currentContext) ? currentContext : (input.relevantSituations ?? []).find(value => typeof value === 'string' && hasObservableCue(value))?.trim() ?? currentContext;
  const situation = contextualSituation || (input.relevantSituations ?? []).find(Boolean)?.trim() || '';
  const observable = hasObservableCue(situation) ? situation : '';
  const mechanism = chooseMechanism(situation, input.desiredChange);
  const sufficient = Boolean(situation && observable && mechanism);
  const mechanismId = mechanism?.id ?? 'context_clarification';
  const movement = sufficient ? movementDescription(mechanismId, input.preferredMovement) : 'precisar la situación antes de intervenir';
  return {
    situation,
    observable_pattern: observable,
    user_direction: input.desiredChange.trim(),
    friction: sufficient ? `La situación muestra ${observable.toLowerCase()}, pero todavía puede confundirse el siguiente paso.` : 'No hay un patrón observable suficiente para justificar una intervención concreta.',
    mechanism_id: mechanismId,
    mechanism_confidence: sufficient ? (mechanism?.id === 'context_clarification' ? 'low' : 'medium') : 'low',
    intervention_purpose: sufficient ? `Ayudar a ${movement}.` : 'Obtener el dato concreto que falta antes de intervenir.',
    psychological_move: sufficient ? movement : 'precisar la situación antes de intervenir',
    expected_movement: sufficient ? `Después de leerlo, la persona podrá ${movement}.` : 'La persona podrá describir la situación concreta que quiere trabajar.',
    takeaway: sufficient ? `La persona se lleva un criterio para ${movement}.` : 'No enviar una idea universal como sustituto de contexto.',
    optional_action: null,
    why_now: sufficient ? `La situación confirmada (${situation}) aparece junto a la dirección elegida (${input.desiredChange}).` : 'La dirección existe, pero la situación no permite elegir una intervención responsable.',
    risk_flags: sufficient ? (mechanism?.risk_flags ?? []) : ['insufficient_observable_pattern'],
    sufficient,
  };
}

export type PsychologicalCandidateInput = {
  text: string;
  situation?: string | null;
  mechanismId?: string | null;
  mechanismConfidence?: string | null;
  interventionPurpose?: string | null;
  psychologicalMove?: string | null;
  expectedMovement?: string | null;
  takeaway?: string | null;
  optionalAction?: string | null;
  closing?: string | null;
  whyNow?: string | null;
  riskFlags?: string[] | null;
  editorialIdea?: string | null;
};

function contextTokens(value: string) {
  return new Set(normalized(value).split(/\s+/).filter(token => token.length > 3 && !['cuando', 'esta', 'para', 'esto', 'tiene', 'como', 'porque'].includes(token)));
}

type MovementFamily = 'external_input_vs_decision' | 'decision_criteria' | 'uncertainty_clarification' | 'situational_preparation' | 'other';

function hasMultipleMoves(value: string) {
  const text = normalized(value);
  const moveTerms = ['reencuadr', 'distinguir', 'diferenc', 'separar', 'prepar', 'pregunt', 'observar', 'reconocer', 'decidir', 'practicar', 'interrumpir', 'cambiar'];
  const found = moveTerms.filter(term => text.includes(term));
  return found.length > 1 || /\b(y|ademas|tambien)\b/.test(text) && found.length > 0;
}

function movementFamily(value: string | null | undefined, mechanismId: string) : MovementFamily | null {
  if (!value?.trim() || hasMultipleMoves(value)) return null;
  const text = normalized(value);
  if (mechanismId === 'external_validation' &&
      /(opinion|informacion|consejo|escuchar|escuch|cuestion|voz|desacuerdo|consult|preguntar|aporte|separar)/.test(text) &&
      /(decision|decidir|criterio|entregar|ceder|cambiar|sustit|votacion|eleccion|elegir|consenso|dato|pregunta)/.test(text)) return 'external_input_vs_decision';
  if (mechanismId === 'external_validation' && /(criterio|regla|condicion|resultado|prioridad|pesa|suficiente|umbral|reconsider|cumplir|cambiar)/.test(text) && /(definir|expresar|nombrar|elegir|prioridad|pesa|resultado|condicion|criterio|cumplir|cambiar)/.test(text)) return 'decision_criteria';
  if (mechanismId === 'uncertainty_clarification' && /(duda|incertidumbre|claro|concreto|punto|pregunta)/.test(text)) return 'uncertainty_clarification';
  if (mechanismId === 'decision_criteria' && /(dato|criterio|revisar|cambiar|decision|decidir)/.test(text)) return 'decision_criteria';
  if ((mechanismId === 'implementation_intention' || mechanismId === 'avoidance_preparation') && /(prepar|respuesta|situacion|ocurra|cuando)/.test(text)) return 'situational_preparation';
  return null;
}

function hasTransferSignal(candidate: PsychologicalCandidateInput, candidateText: string) {
  return Boolean(candidate.optionalAction?.trim()) || /\b(antes de|la proxima vez|cuando vuelva|si vuelve|anota|escribe|fijate|mira que|distingue|separa|puedes notar|podras notar|que dato|que cambiaria|revisa|comprueba|elige|decide|prepara)\b/i.test(candidateText);
}

function hasExternalValidationTransfer(candidateText: string, contextAnchorSpecificity: boolean) {
  if (!contextAnchorSpecificity) return false;
  const hasInformationCriterion = /(?:aporta|falta|nuevo|cambia|ocupa el lugar|informacion que faltaba|dato concreto)/i.test(candidateText);
  const appliesToDecision = /(?:opinion|opiniones|escuch|consult|pregunt|decision|criterio)/i.test(candidateText);
  return hasInformationCriterion && appliesToDecision;
}

function hasFillerClosing(candidate: PsychologicalCandidateInput, candidateText: string) {
  const closing = normalized(candidate.closing ?? '');
  const filler = /^(descansa|nos leemos|manana seguimos|aqui estare|pruebalo cuando tengas oportunidad|recuerda que)[.! ]/;
  return Boolean((closing && filler.test(closing)) || /(?:descansa\.?\s*manana seguimos|nos leemos manana|aqui estare|pruebalo cuando tengas oportunidad)\s*[.!]*$/i.test(candidateText));
}

function hasExternalSituationAnchor(candidateText: string, contractText: string) {
  const candidate = normalized(candidateText);
  const contract = normalized(contractText);
  const questioningInContext = /cuestion|desacuerdo/.test(contract);
  const questioningInMessage = /cuestion|desacuerdo/.test(candidate);
  if (questioningInContext && questioningInMessage) return true;
  const consultation = /opinion|consejo|consult|pregunt/.test(candidate);
  const priorCriterion = /ya (tien|tom|decid)|criterio|respuesta propia|despues de (tomar|decidir)|antes de (volver a )?pregunt/.test(candidate);
  const multipleVoices = /varias|opiniones|mas opiniones|otra opinion|otras personas|los demas|que haria/.test(candidate);
  const sequenceAfterDecision = /despues de (tomar|decidir)|luego de (tomar|decidir)|despues de decidir/.test(candidate);
  const persistenceAfterCriterion = /aunque|aun asi|aun cuando|ya (tien|tom|decid|reconoc)[^.!?]{0,120}(opinion|consult|pregunt)|ya [^.!?]{0,100}(criterio|respuesta|decision)[^.!?]{0,160}(opinion|consult|pregunt)/.test(candidate);
  return consultation && priorCriterion && (sequenceAfterDecision || (multipleVoices && persistenceAfterCriterion));
}

export function evaluatePsychologicalValue(candidate: PsychologicalCandidateInput, contract: PsychologicalInterventionContract) {
  const mechanism = psychologicalMechanisms.find(item => item.id === candidate.mechanismId);
  const candidateText = normalized(candidate.text);
  const context = contextTokens(`${contract.situation} ${contract.observable_pattern}`);
  const sharedContext = [...context].filter(token => candidateText.includes(token)).length;
  const situationMatches = Boolean(candidate.situation?.trim() && normalized(candidate.situation) === normalized(contract.situation));
  const mechanismLanguageAnchor = Boolean(mechanism?.preferred_language.some(term => candidateText.includes(normalized(term))));
  const contextualAnchor = sharedContext >= 2 || (situationMatches && mechanismLanguageAnchor);
  const situationAnchors = [...context].filter(token => token.length >= 5 && !['alguien', 'cuando', 'tienes', 'tomaste', 'otra', 'persona'].includes(token));
  const situationAnchorHits = situationAnchors.filter(token => candidateText.includes(token)).length;
  const transferSignal = hasTransferSignal(candidate, candidateText);
  const contractFamily = movementFamily(contract.psychological_move, contract.mechanism_id);
  const contextAnchorSpecificity = contract.mechanism_id === 'external_validation'
    ? (
        hasExternalSituationAnchor(candidate.text, `${contract.situation} ${contract.observable_pattern}`)
        || (
          contractFamily === 'decision_criteria'
          && situationMatches
          && /(?:decision|decidir|criterio|opcion|elegir|condicion|limite|prioridad)/i.test(candidateText)
        )
      )
    : situationAnchors.length < 3 || situationAnchorHits >= 3 || (situationMatches && situationAnchorHits >= 2 && transferSignal);
  const takeaway = candidate.takeaway?.trim() ?? '';
  const genericTakeaways = /^(confia en ti|recuerda que eres capaz|escucha lo que necesitas|date permiso para confiar|la duda no significa que estes equivocada|una duda no define quien eres)[.! ]*$/i.test(takeaway) || /frase bonita|frase general|sentirte mejor|seguir adelante|todo estara bien/i.test(takeaway);
  const movement = candidate.psychologicalMove?.trim() ?? '';
  const reasons: string[] = [];
  const checks = {
    contextual_relevance: contract.sufficient && Boolean(contract.situation && contract.observable_pattern),
    mechanism_validity: Boolean(mechanism && contract.sufficient),
    intervention_purpose: Boolean(candidate.interventionPurpose?.trim() && contract.intervention_purpose.trim()),
    psychological_movement: Boolean(movement && movement.length >= 8 && !/\b(y|ademas)\b.{0,30}\b(y|ademas)\b/i.test(movement)),
    learning_value: takeaway.length >= 20 && !genericTakeaways,
    usefulness: Boolean(candidate.optionalAction?.trim()) || (takeaway.length >= 20 && !genericTakeaways) || /\b(separa|distingue|mira|anota|escribe|elige|prepara|comprueba|pregunta|revisa|observa|diferencia|confundir|equivale|significa)\b/i.test(candidate.text),
    autonomy: !/\b(debes|tienes que sentir|yo se que tu|hazlo porque yo digo)\b(?!\s+(?:elegir|decidir|hacer)\b)/i.test(candidateText),
    non_genericity: contextualAnchor,
    psychological_transfer: (transferSignal || hasExternalValidationTransfer(candidateText, contextAnchorSpecificity)) && !genericTakeaways && (Boolean(candidate.optionalAction?.trim()) || takeaway.length >= 20),
    context_anchor_specificity: contextAnchorSpecificity,
    filler_closing: !hasFillerClosing(candidate, candidateText),
    no_invented_psychology: !(candidate.riskFlags ?? []).some(flag => /diagnos|invent|clin|miedo|pereza|autosabotaje/i.test(flag)),
    one_move: Boolean((() => {
      const candidateFamily = movementFamily(movement, contract.mechanism_id);
      const contractFamily = movementFamily(contract.psychological_move, contract.mechanism_id);
      if (!candidateFamily || !contractFamily) return false;
      // A later, single movement in the same mechanism can be a legitimate
      // phase change. Progression, not literal contract wording, decides
      // whether that phase is timely.
      return candidateFamily === contractFamily || (contract.mechanism_id === 'external_validation' && candidateFamily === 'decision_criteria');
    })()),
  };
  for (const [key, passed] of Object.entries(checks)) if (!passed) reasons.push(`psychological_value_${key}`);
  const whyThisMessage = checks.contextual_relevance && checks.mechanism_validity && checks.intervention_purpose && checks.psychological_movement ? `Porque la situación confirmada (${contract.situation}) y la dirección (${contract.user_direction}) justifican usar ${mechanism?.name ?? contract.mechanism_id} para ${contract.intervention_purpose.toLowerCase()}` : '';
  const counterfactual_passed = contextualAnchor;
  if (!counterfactual_passed) reasons.push('counterfactual_too_generic');
  return { approved: reasons.length === 0, reasons, checks, whyThisMessage, counterfactual_passed, mechanism: mechanism?.id ?? null };
}
