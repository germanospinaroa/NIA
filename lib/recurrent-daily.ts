import { createHash } from 'node:crypto';
import { PSYCHOLOGICAL_MOVEMENT_PATHS, movementKey, type PsychologicalMovementRecord } from './psychological-progression.ts';
import { canonicalMovementPathForMechanism } from './movement-expression.ts';
import { getMovementTargetGuidance } from './movement-expression.ts';

export const INTERVENTION_MODES = ['introduce', 'deepen', 'apply', 'contrast', 'anticipate', 'reinforce', 'integrate', 'transfer', 'evidence', 'reflect_or_observe'] as const;
export type InterventionMode = typeof INTERVENTION_MODES[number];
export type InterventionDepth = 'foundational' | 'developed' | 'advanced';

export const DAILY_SELECTION_LADDER: InterventionMode[] = ['introduce', 'deepen', 'integrate', 'apply', 'anticipate', 'contrast', 'transfer', 'reinforce', 'evidence', 'reflect_or_observe'];
export const MIN_APPROVED_BUFFER_DAYS = 3;
export const MESSAGE_CONTRACT_VERSION = 'nia_daily_v3';

export type MovementExposure = {
  canonicalMovement: string;
  deliveredAt: string;
  takeaway: string;
  interventionMode: InterventionMode;
  angle: string;
  depth: InterventionDepth;
  contextUsed: string[];
  message: string;
  normalizedMessageHash: string;
  interventionSignature: string;
  newContribution?: string;
  expectedTakeaway?: string;
};

export type DailyInterventionPlan = {
  canonicalMovement: string;
  interventionMode: InterventionMode;
  angle: string;
  depth: InterventionDepth;
  contextUsed: string[];
  continuityGuidance: string[];
  noveltyGuidance: string[];
  interventionSignature: string;
  reason: string;
  eligible: true;
  eligibility: 'eligible_now' | 'eligible_conditionally';
  conditionalOnBufferItemId: string | null;
  dependsOnBufferItemId: string | null;
  projectedReceptionStage?: 'welcome' | 'tuning' | 'building' | 'established';
  newContribution: string;
  expectedTakeaway: string;
  semanticAudit?: {
    target_expressed: boolean;
    adjacent_drift: boolean;
    movement_value: boolean;
    new_contribution_expressed: boolean;
    same_actionable_teaching_as_prior: boolean;
    novel_contribution: boolean;
    semantic_redundancy: boolean;
  };
};

export type ProspectiveLearning = {
  bufferItemId: string;
  intendedLocalDate: string;
  canonicalMovement: string;
  takeaway: string;
  message: string;
  interventionSignature: string;
  newContribution?: string;
  expectedTakeaway?: string;
};

export type DailyPlannerInput = {
  goal: string;
  context: string;
  confirmedEvidence?: string[];
  mechanismId: string;
  history?: PsychologicalMovementRecord[];
  exposures?: MovementExposure[];
  recentTakeaways?: string[];
  plannedSignatures?: string[];
  prospectiveLearning?: ProspectiveLearning[];
  intendedLocalDate?: string;
  projectedReceptionStage?: 'welcome' | 'tuning' | 'building' | 'established';
  receptionStage?: 'welcome' | 'tuning' | 'building' | 'established';
  now?: string;
};

export type ApprovedBufferItem = {
  id?: string;
  intendedLocalDate: string;
  plan: DailyInterventionPlan;
  message: string;
  status: 'approved' | 'buffered' | 'consumed' | 'invalidated';
  normalizedMessageHash: string;
  interventionSignature: string;
  contextVersion: string;
  createdAt: string;
};

export type ProspectiveDependencyResult = {
  satisfied: boolean;
  dependencyId: string | null;
};

export function normalizeDailyMessage(message: string) {
  return message.normalize('NFKC').replace(/\r\n?/g, '\n').replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');
}

export function normalizedMessageHash(message: string) {
  return createHash('sha256').update(normalizeDailyMessage(message), 'utf8').digest('hex');
}

export function hasExactMessageDuplicate(message: string, historicalMessages: (string | { normalizedMessageHash?: string | null; message?: string | null })[]) {
  const hash = normalizedMessageHash(message);
  return historicalMessages.some(item => typeof item === 'string' ? normalizedMessageHash(item) === hash : item.normalizedMessageHash === hash || (item.message ? normalizedMessageHash(item.message) === hash : false));
}

export function dailyIdempotencyKey(userId: string, localDate: string) {
  return `daily:${userId}:${localDate}:daily_intervention`;
}

export function projectedReceptionStage(deliveredCount: number, scheduledPredecessors = 0): 'welcome' | 'tuning' | 'building' | 'established' {
  // Refill plans psychological interventions after the deterministic welcome.
  // The item being planned is the next intervention, so D1 is tuning rather
  // than welcome; scheduled predecessors count toward its projected ordinal.
  const projectedPsychologicalNumber = deliveredCount + scheduledPredecessors + 1;
  if (projectedPsychologicalNumber <= 2) return 'tuning';
  if (projectedPsychologicalNumber <= 5) return 'building';
  return 'established';
}

export function prospectiveDependencyStatus(item: Pick<ApprovedBufferItem, 'plan'>, deliveredBufferItemIds: Set<string>): ProspectiveDependencyResult {
  const dependencyId = item.plan.dependsOnBufferItemId ?? null;
  return { satisfied: !dependencyId || deliveredBufferItemIds.has(dependencyId), dependencyId };
}

export function invalidateDependentBufferItems<T extends { id?: string; status: ApprovedBufferItem['status']; plan: DailyInterventionPlan }>(items: T[], failedBufferItemId: string) {
  const invalidated = new Set([failedBufferItemId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      if (item.id && item.status !== 'invalidated' && item.plan.dependsOnBufferItemId && invalidated.has(item.plan.dependsOnBufferItemId)) {
        if (!invalidated.has(item.id)) {
          invalidated.add(item.id);
          changed = true;
        }
      }
    }
  }
  return items.map(item => item.id && invalidated.has(item.id) ? { ...item, status: 'invalidated' as const } : item);
}

export function contextVersion(context: string, goal: string, editorial: {
  communicationPreference?: string | null;
  voiceStyle?: string | null;
  contextDomain?: string | null;
  concepts?: string[] | null;
} = {}) {
  // This column is the content version of NEXT. Delivery-only settings such
  // as time, timezone and WhatsApp state intentionally stay out of it.
  return normalizedMessageHash(JSON.stringify({
    messageContractVersion: MESSAGE_CONTRACT_VERSION,
    goal: goal.trim(),
    context: context.trim(),
    communicationPreference: editorial.communicationPreference ?? null,
    voiceStyle: editorial.voiceStyle ?? null,
    contextDomain: editorial.contextDomain ?? null,
    concepts: [...(editorial.concepts ?? [])].map(value => value.trim()).filter(Boolean).sort(),
  }));
}

/** Version used by rows created before editorial fields joined the contract. */
export function legacyContextVersion(context: string, goal: string) {
  return normalizedMessageHash(`${MESSAGE_CONTRACT_VERSION}\n${goal}\n${context}`);
}

export function interventionSignature(input: Pick<DailyInterventionPlan, 'canonicalMovement' | 'interventionMode' | 'angle' | 'depth' | 'contextUsed'>) {
  return [input.canonicalMovement, input.interventionMode, input.angle, input.depth, ...input.contextUsed].join('|');
}

const contributionStopWords = new Set('a al algo aunque antes así como con de del desde después el en es esta esto la las lo los más mi no para por que se si su sus también tener un una y ya reconocer reconoce reconoces señal señales concreta concreto patrón localizar poder distinguir puede puedo'.split(' '));

function contributionTokens(value: string) {
  return new Set(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').match(/[a-z0-9]{4,}/g)?.filter(token => !contributionStopWords.has(token)) ?? []);
}

export function contributionSimilarity(left: string, right: string) {
  const a = contributionTokens(left);
  const b = contributionTokens(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter(token => b.has(token)).length;
  return overlap / Math.min(a.size, b.size);
}

export type ContributionRecord = { canonicalMovement?: string | null; newContribution?: string | null; expectedTakeaway?: string | null; takeaway?: string | null };

/** Conservative prefilter only: semantic equivalence still belongs to the Judge. */
export function materialContributionIsNovel(candidate: Pick<DailyInterventionPlan, 'canonicalMovement' | 'newContribution' | 'expectedTakeaway'>, previous: ContributionRecord[]) {
  const candidateValues = [candidate.newContribution, candidate.expectedTakeaway].map(normalizeDailyMessage).filter(Boolean);
  for (const record of previous) {
    const previousValues = [record.newContribution, record.expectedTakeaway, record.takeaway].filter((value): value is string => Boolean(value?.trim())).map(normalizeDailyMessage);
    const sameMovement = !record.canonicalMovement || !('canonicalMovement' in candidate) || !candidate.canonicalMovement || record.canonicalMovement === candidate.canonicalMovement;
    const threshold = sameMovement ? 0.72 : 0.9;
    if (candidateValues.some(value => previousValues.some(previousValue => value === previousValue || contributionSimilarity(value, previousValue) >= threshold))) return false;
  }
  return true;
}

function modeForExposure(count: number): InterventionMode {
  if (count === 0) return 'introduce';
  if (count === 1) return 'deepen';
  if (count === 2) return 'contrast';
  if (count === 3) return 'anticipate';
  if (count === 4) return 'integrate';
  if (count === 5) return 'transfer';
  if (count === 6) return 'reinforce';
  if (count === 7) return 'evidence';
  return 'reflect_or_observe';
}

function depthForExposure(count: number): InterventionDepth {
  return count < 2 ? 'foundational' : count < 5 ? 'developed' : 'advanced';
}

function angleFor(guidance: ReturnType<typeof getMovementTargetGuidance>, mode: InterventionMode, count: number) {
  const scope = guidance?.inScope?.length ? guidance.inScope : ['aplicación concreta del movimiento'];
  return `${mode}:${scope[count % scope.length]}:round_${Math.floor(count / scope.length) + 1}`;
}

function contributionFor(guidance: ReturnType<typeof getMovementTargetGuidance>, mode: InterventionMode, count: number) {
  const scopes = guidance?.inScope ?? [];
  const scope = scopes[count % (scopes.length || 1)] ?? 'la señal concreta del movimiento';
  const contributionByMode: Record<InterventionMode, string> = {
    introduce: `Reconocer ${scope} como una señal concreta del patrón.`,
    deepen: `Localizar qué ocurre alrededor de ${scope} para poder distinguirlo.`,
    apply: `Probar ${scope} en una situación concreta sin convertirlo en una regla general.`,
    contrast: `Distinguir ${scope} de una respuesta vecina que puede parecer igual.`,
    anticipate: `Anticipar ${scope} antes de que la situación vuelva a repetirse.`,
    reinforce: `Comprobar ${scope} con una observación concreta y no solo con una impresión.`,
    integrate: `Conectar ${scope} con un criterio o aprendizaje ya nombrado.`,
    transfer: `Trasladar ${scope} a otro contexto del mismo patrón.`,
    evidence: `Registrar evidencia observable relacionada con ${scope}.`,
    reflect_or_observe: `Revisar qué cambió en ${scope} sin inferir un resultado.`,
  };
  return contributionByMode[mode];
}

function expectedTakeawayFor(guidance: ReturnType<typeof getMovementTargetGuidance>, mode: InterventionMode, count: number) {
  const scopes = guidance?.inScope ?? [];
  const scope = scopes[count % (scopes.length || 1)] ?? 'la señal concreta';
  const takeawayByMode: Record<InterventionMode, string> = {
    introduce: `Puedo reconocer ${scope}.`,
    deepen: `Puedo localizar qué ocurre alrededor de ${scope}.`,
    apply: `Puedo probar ${scope} en una situación concreta.`,
    contrast: `Puedo distinguir ${scope} de una respuesta vecina.`,
    anticipate: `Puedo anticipar ${scope} antes de que se repita.`,
    reinforce: `Puedo comprobar ${scope} con una observación.`,
    integrate: `Puedo conectar ${scope} con un criterio propio.`,
    transfer: `Puedo trasladar ${scope} a otro contexto.`,
    evidence: `Puedo registrar evidencia sobre ${scope}.`,
    reflect_or_observe: `Puedo revisar qué cambió en ${scope}.`,
  };
  return takeawayByMode[mode];
}

function relatedHistory(input: DailyPlannerInput) {
  return [...(input.history ?? [])].filter(row => movementKey(row) !== null);
}

function prospectiveEligibility(key: string, history: PsychologicalMovementRecord[], evidence: string[], prospective: ProspectiveLearning[]) {
  const guidance = getMovementTargetGuidance(key);
  if (!guidance) return { eligibility: 'eligible_now' as const, conditionalOnBufferItemId: null, reason: null as string | null };
  const completed = history.map(movementKey).filter((value): value is string => Boolean(value));
  const requirements = guidance.evidenceRequirements;
  if (requirements.includes('base_context') && evidence.filter(Boolean).length === 0) return { eligibility: 'not_eligible' as const, conditionalOnBufferItemId: null, reason: 'missing_base_context' };
  if (requirements.includes('confirmed_event') && !evidence.some(value => /\b(tom[eé]|tom[oó]|decid[ií]|decid[ií]a|decidieron|resultado|sali[oó]|ocurri[oó]|pas[oó]|despu[eé]s|desde entonces|esperaba|termin[oó])\b/i.test(value))) return { eligibility: 'not_eligible' as const, conditionalOnBufferItemId: null, reason: 'missing_confirmed_event' };
  if (requirements.includes('confirmed_behavior') && !evidence.some(value => /(suele|hace|hizo|tom[eé]|decid[ií]|pudo|pude|logr[oó]|actu[oó]|complet[oó]|avanz[oó]|primera respuesta|ya tiene|ya tienes|ya tenga|tenga)/i.test(value))) return { eligibility: 'not_eligible' as const, conditionalOnBufferItemId: null, reason: 'missing_confirmed_behavior' };
  if (guidance.buildsOn && !completed.includes(guidance.buildsOn)) {
    const predecessor = prospective.find(item => item.canonicalMovement === guidance.buildsOn);
    if (!predecessor) return { eligibility: 'not_eligible' as const, conditionalOnBufferItemId: null, reason: `requires:${guidance.buildsOn}` };
    return { eligibility: 'eligible_conditionally' as const, conditionalOnBufferItemId: predecessor.bufferItemId, reason: `scheduled_learning:${predecessor.bufferItemId}` };
  }
  if (requirements.includes('delivered_learning') && !guidance.buildsOn) return { eligibility: 'not_eligible' as const, conditionalOnBufferItemId: null, reason: 'missing_delivered_learning' };
  return { eligibility: 'eligible_now' as const, conditionalOnBufferItemId: null, reason: null };
}

function candidatePlans(input: DailyPlannerInput): DailyInterventionPlan[] {
  const path = canonicalMovementPathForMechanism(input.mechanismId) ?? PSYCHOLOGICAL_MOVEMENT_PATHS[input.mechanismId];
  if (!path?.length) throw new Error('unsupported_mechanism_movement_contract');
  const evidence = [...(input.confirmedEvidence ?? []), input.context].filter(Boolean);
  const history = relatedHistory(input);
  const exposures = input.exposures ?? [];
  const exposureByMovement = new Map<string, MovementExposure[]>();
  for (const exposure of exposures) exposureByMovement.set(exposure.canonicalMovement, [...(exposureByMovement.get(exposure.canonicalMovement) ?? []), exposure]);
  const prior = exposures.at(-1);
  const prospective = [...(input.prospectiveLearning ?? [])].sort((a, b) => a.intendedLocalDate.localeCompare(b.intendedLocalDate));
  const plans: DailyInterventionPlan[] = [];
  for (const key of path) {
    const guidance = getMovementTargetGuidance(key);
    const eligibility = guidance ? prospectiveEligibility(key, history, evidence, prospective) : { eligibility: Boolean(input.context.trim()) ? 'eligible_now' as const : 'not_eligible' as const, conditionalOnBufferItemId: null, reason: null };
    if (eligibility.eligibility === 'not_eligible') continue;
    const count = (exposureByMovement.get(key)?.length ?? 0) + prospective.filter(item => item.canonicalMovement === key).length;
    const mode = modeForExposure(count);
    const depth = depthForExposure(count);
    const angle = angleFor(guidance, mode, count);
    const contextUsed = [input.context, ...(input.confirmedEvidence ?? [])].filter(Boolean).slice(0, 4);
    const newContribution = contributionFor(guidance, mode, count);
    const expectedTakeaway = expectedTakeawayFor(guidance, mode, count);
    const previousContributions: ContributionRecord[] = [...exposures, ...prospective];
    if (!materialContributionIsNovel({ canonicalMovement: key, newContribution, expectedTakeaway }, previousContributions)) continue;
    const plan: DailyInterventionPlan = {
      canonicalMovement: key,
      interventionMode: mode,
      angle,
      depth,
      contextUsed,
      continuityGuidance: prior ? [`Construye desde el aprendizaje entregado sobre ${prior.canonicalMovement}.`, 'No afirmes que la persona aplicó o logró ese aprendizaje sin evidencia confirmada.'] : prospective.at(-1) ? [`Construye condicionalmente desde el aprendizaje programado sobre ${prospective.at(-1)!.canonicalMovement}.`, 'El contenido programado todavía no demuestra que la persona lo recibió o aplicó.'] : [],
      noveltyGuidance: [
        'Añade una contribución nueva; cambiar sinónimos no es suficiente.',
        ...(exposureByMovement.has(key) ? [`No repitas los takeaways ya entregados para ${key}.`] : []),
      ],
      interventionSignature: '',
      reason: count === 0 ? 'eligible movement without prior exposure' : `revisit ${key} with ${mode} and new angle`,
      eligible: true,
      eligibility: eligibility.eligibility,
      conditionalOnBufferItemId: eligibility.conditionalOnBufferItemId,
      dependsOnBufferItemId: eligibility.conditionalOnBufferItemId,
      projectedReceptionStage: input.projectedReceptionStage,
      newContribution,
      expectedTakeaway,
    };
    plan.interventionSignature = interventionSignature(plan);
    if (!exposures.some(exposure => exposure.interventionSignature === plan.interventionSignature) && !(input.plannedSignatures ?? []).includes(plan.interventionSignature)) plans.push(plan);
  }
  const modeRank = new Map(INTERVENTION_MODES.map((mode, index) => [mode, index]));
  const pathRank = new Map(path.map((key, index) => [key, index]));
  if (plans.length > 0 && plans.length < 3) {
    const primary = plans[0];
    const fallbackModes: InterventionMode[] = ['reflect_or_observe', 'anticipate', 'contrast'];
    for (let fallbackIndex = 0; fallbackIndex < fallbackModes.length; fallbackIndex += 1) {
      const fallbackMode = fallbackModes[fallbackIndex];
      if (plans.length >= 3 || fallbackMode === primary.interventionMode) continue;
      const fallback = { ...primary, interventionMode: fallbackMode, angle: `${fallbackMode}:${primary.angle}:fallback_${fallbackIndex + 1}`, interventionSignature: '' };
      fallback.interventionSignature = interventionSignature(fallback);
      if (!exposures.some(exposure => exposure.interventionSignature === fallback.interventionSignature) && !(input.plannedSignatures ?? []).includes(fallback.interventionSignature) && !plans.some(plan => plan.interventionSignature === fallback.interventionSignature)) plans.push(fallback);
    }
  }
  const priorMovements = new Set([...exposures.map(exposure => exposure.canonicalMovement), ...prospective.map(item => item.canonicalMovement)]);
  return plans.sort((a, b) => (Number(priorMovements.has(a.canonicalMovement)) - Number(priorMovements.has(b.canonicalMovement))) || (modeRank.get(a.interventionMode)! - modeRank.get(b.interventionMode)!) || (pathRank.get(a.canonicalMovement)! - pathRank.get(b.canonicalMovement)!)).slice(0, 3);
}

export function planDailyIntervention(input: DailyPlannerInput) {
  const plans = candidatePlans(input);
  if (!plans.length) {
    // A recurrent planner has no user-level terminal state. The caller must
    // surface this as an operational planning failure, never as a reason to
    // silently skip the user's daily delivery.
    throw new Error('daily_planner_no_valid_plan');
  }
  return { selected: plans[0], candidates: plans };
}

export function semanticNoveltySignal(input: { message: string; historicalTakeaways: string[]; currentTakeaway?: string | null; interventionSignature?: string | null }) {
  const normalized = normalizeDailyMessage(input.message);
  const tokens = (value: string) => new Set(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]{5,}/g) ?? []);
  const currentTokens = input.currentTakeaway ? tokens(normalizeDailyMessage(input.currentTakeaway)) : new Set<string>();
  const sameTakeaway = Boolean(input.currentTakeaway && input.historicalTakeaways.some(value => {
    const historicalTokens = tokens(normalizeDailyMessage(value));
    const overlap = [...currentTokens].filter(token => historicalTokens.has(token)).length;
    return normalizeDailyMessage(value) === normalizeDailyMessage(input.currentTakeaway!) || (currentTokens.size > 0 && overlap / Math.min(currentTokens.size, historicalTokens.size || 1) >= 0.6);
  }));
  const generic = /^(conf[ií]a en ti|recuerda que eres capaz|todo saldrá bien)[.! ]*$/i.test(normalized);
  return { novelContribution: !generic && !sameTakeaway, semanticRedundancy: sameTakeaway, exactMessageDuplicate: false };
}

export function refillApprovedBuffer(existing: ApprovedBufferItem[], future: ApprovedBufferItem[], minimumDays = MIN_APPROVED_BUFFER_DAYS) {
  const usedHashes = new Set(existing.filter(item => item.status !== 'invalidated').map(item => item.normalizedMessageHash));
  const usedSignatures = new Set(existing.filter(item => item.status !== 'invalidated').map(item => item.interventionSignature));
  const result = [...existing];
  for (const item of future) {
    if (result.filter(row => row.status === 'approved' || row.status === 'buffered').length >= minimumDays) break;
    if (usedHashes.has(item.normalizedMessageHash) || usedSignatures.has(item.interventionSignature)) continue;
    result.push({ ...item, status: 'buffered' });
    usedHashes.add(item.normalizedMessageHash);
    usedSignatures.add(item.interventionSignature);
  }
  return result;
}

export function consumeApprovedBuffer(buffer: ApprovedBufferItem[], localDate: string) {
  const item = buffer.find(row => row.intendedLocalDate === localDate && (row.status === 'approved' || row.status === 'buffered'));
  if (!item) return { item: null, buffer };
  const consumed = { ...item, status: 'consumed' as const };
  return { item: consumed, buffer: buffer.map(row => row === item ? consumed : row) };
}

export function invalidateBufferForContext(buffer: ApprovedBufferItem[], version: string) {
  return buffer.map(item => item.status === 'consumed' || item.contextVersion === version ? item : { ...item, status: 'invalidated' as const });
}
