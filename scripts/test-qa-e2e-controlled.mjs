import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const userId = '11111111-1111-4111-8111-111111111111';
const now = new Date('2026-10-04T12:00:00.000Z');

process.env.OPENAI_API_KEY = 'controlled-test-key';
process.env.OPENAI_MODEL = 'controlled-model';
process.env.OPENAI_EMBEDDING_MODEL = 'controlled-embedding';
process.env.WHATSAPP_PROVIDER = 'evolution';
process.env.WHATSAPP_BUSINESS_NUMBER = '573001234567';
process.env.EVOLUTION_API_URL = 'https://evolution.controlled.test';
process.env.EVOLUTION_API_KEY = 'controlled-evolution-key';
process.env.EVOLUTION_INSTANCE = 'NIA';
delete process.env.SUPABASE_SECRET_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

const tables = {
  profiles: [{ id: userId, first_name: 'Ana', direction_key: '', desired_change_original: 'Confiar más en mi criterio', current_context_original: 'Cuando ya tienes una decisión y empiezas a pedir varias opiniones aunque en el fondo ya tengas una respuesta', current_context_domain: 'decisiones', desired_change_language: [], learning_profile: {}, communication_preference: 'adaptive', desired_change_concepts: [], voice_style: null }],
  interventions: [], learning_signals: [], context_history: [], execution_runs: [], generation_attempts: [], execution_provider_calls: [], provider_call_costs: [], provider_pricing: [], event_log: [], intervention_candidates: [], interactions: [], whatsapp_daily_deliveries: [], admin_audit_log: [],
};
const counts = { openai: 0, evolution: 0 };
let failNextGeneration = false;
let rejectNextGeneration = false;
let repairNextGeneration = false;
let repairGenerationCalls = 0;
let repairAlwaysFails = false;

function rowId() { return randomUUID(); }
function clone(value) { return value === undefined ? value : JSON.parse(JSON.stringify(value)); }
function selectedColumns(row, selection) {
  if (!selection || selection === '*') return clone(row);
  const keys = selection.split(',').map(value => value.trim()).filter(Boolean);
  return Object.fromEntries(keys.map(key => [key, row[key]]));
}

class Query {
  constructor(db, table, operation = 'select', payload = null) { this.db = db; this.table = table; this.operation = operation; this.payload = payload; this.filters = []; this.selection = '*'; this.singleMode = null; this.ordering = null; this.limitCount = null; this.upsertOptions = null; }
  select(selection = '*') { this.selection = selection; return this; }
  insert(payload) { this.operation = 'insert'; this.payload = payload; return this; }
  update(payload) { this.operation = 'update'; this.payload = payload; return this; }
  upsert(payload, options) { this.operation = 'upsert'; this.payload = payload; this.upsertOptions = options; return this; }
  eq(column, value) { this.filters.push(['eq', column, value]); return this; }
  neq(column, value) { this.filters.push(['neq', column, value]); return this; }
  in(column, values) { this.filters.push(['in', column, values]); return this; }
  is(column, value) { this.filters.push(['is', column, value]); return this; }
  gte(column, value) { this.filters.push(['gte', column, value]); return this; }
  lte(column, value) { this.filters.push(['lte', column, value]); return this; }
  order(column, options = {}) { this.ordering = [column, options.ascending !== false]; return this; }
  limit(value) { this.limitCount = value; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }
  async exec() {
    const rows = this.db.tables[this.table] ?? (this.db.tables[this.table] = []);
    if (this.operation === 'insert' || this.operation === 'upsert') {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload];
      const created = incoming.map(item => ({ id: item.id ?? rowId(), created_at: item.created_at ?? new Date().toISOString(), ...clone(item) }));
      if (this.operation === 'upsert' && this.upsertOptions?.onConflict) {
        const key = this.upsertOptions.onConflict.split(',')[0];
        for (const item of created) { const existing = rows.find(row => row[key] === item[key]); if (existing) Object.assign(existing, item); else rows.push(item); }
      } else rows.push(...created);
      const data = created.map(row => selectedColumns(row, this.selection));
      return this.finish(data);
    }
    const matches = rows.filter(row => this.filters.every(([kind, column, value]) => {
      if (kind === 'eq') return row[column] === value;
      if (kind === 'neq') return row[column] !== value;
      if (kind === 'in') return value.includes(row[column]);
      if (kind === 'is') return value === null ? row[column] == null : row[column] === value;
      if (kind === 'gte') return row[column] >= value;
      if (kind === 'lte') return row[column] <= value;
      return true;
    }));
    if (this.ordering) matches.sort((a, b) => { const [column, ascending] = this.ordering; return (a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0) * (ascending ? 1 : -1); });
    const limited = this.limitCount == null ? matches : matches.slice(0, this.limitCount);
    if (this.operation === 'update') { for (const row of limited) Object.assign(row, clone(this.payload)); return { data: this.singleMode ? clone(limited[0]) : clone(limited), error: null }; }
    return this.finish(limited.map(row => selectedColumns(row, this.selection)));
  }
  finish(data) {
    if (this.singleMode === 'single') return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { code: 'PGRST116', message: 'single row expected' } };
    if (this.singleMode === 'maybe') return data.length ? { data: data[0], error: data.length > 1 ? { code: 'PGRST116', message: 'multiple rows' } : null } : { data: null, error: null };
    return { data, error: null };
  }
  then(resolve, reject) { return this.exec().then(resolve, reject); }
}

const db = { tables, from(table) { return new Query(this, table); }, async rpc(name) { if (name === 'match_intervention_embeddings') return { data: [], error: null }; return { data: null, error: { message: `unsupported rpc ${name}` } }; } };

function jsonResponse(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } }); }
const audit = { context_fit: true, specificity: true, generic_motivation: false, chatbot_language: false, coaching_language: false, therapy_language: false, robotic_or_abstract_language: false, first_read_comprehension: true, editorial_novelty: true, experience_novelty: true, 'cliché': false, semantic_repetition: false, concept_repetition: false, structure_repetition: false, single_idea: true, natural_voice: true, unnecessary_advice: false, approved: true, reasons: [] };
const candidates = [0, 1, 2].map(index => ({
  topic: 'criterio propio', intervention_type: index === 0 ? 'reflection' : 'practical_guidance', depth: index === 0 ? 'medium' : 'brief', editorial_take: index === 0 ? 'La consulta repetida también tiene un momento que puedes reconocer: aparece después de que ya surgió una primera respuesta.' : `Puedes notar cuándo aparece la primera respuesta y cuándo empiezas a buscar varias opiniones ${index}.`, editorial_idea: index === 0 ? 'Observar el momento en que empiezas a consultar vuelve visible la secuencia entre tu primera respuesta y la opinión que buscas.' : `Reconocer la secuencia entre una respuesta propia y la consulta ayuda a ver el patrón ${index}.`, experience_type: index === 0 ? 'perspective_shift' : 'reflection', blocks: index === 0 ? [{ type: 'idea', text: 'Cuando ya aparece una primera respuesta, pedir varias opiniones empieza en un momento reconocible: ahí puedes observar la secuencia sin asumir que consultar está mal.' }, { type: 'tool', text: 'La próxima vez, nota qué respuesta propia apareció primero y en qué momento empiezas a pedir otra opinión.' }] : [{ type: 'idea', text: `Puedes observar cuándo aparece tu primera respuesta y cuándo empiezas a pedir varias opiniones ${index}.` }, { type: 'tool', text: 'Señala el momento en que pasas de tener una respuesta propia a buscar otra opinión.' }], function: 'distinguish', concept: 'observar la secuencia entre respuesta propia y consulta', angle: 'observar el momento en que empieza la consulta', structure: 'context_does_not_mean', editorial_type: 'distinction', signal: 'cuando ya tienes una decisión y empiezas a pedir varias opiniones', evidence_direction: 'reconocer la secuencia hace visible el momento de la consulta sin convertirlo en un defecto', movement: 'external_validation:notice_the_consulting_pattern', opening_closing: 'idea y observación', mechanism_id: 'external_validation', mechanism_confidence: 'medium', intervention_purpose: 'Ayudar a observar cuándo empiezas a buscar otra opinión antes de decidir.', psychological_move: 'observar cuándo empiezas a buscar otra opinión antes de decidir', expected_movement: 'Podrás observar cuándo empiezas a buscar otra opinión después de que ya apareció una primera respuesta.', takeaway: 'Primero puede aparecer una respuesta propia y después el impulso de pedir varias opiniones; reconocer ese momento vuelve visible la secuencia.', optional_action: 'La próxima vez, nota qué respuesta propia apareció primero y en qué momento empiezas a pedir otra opinión.', why_now: 'La situación confirmada muestra una primera respuesta seguida de varias consultas.', risk_flags: [], insight_id: null, functional_emotion: 'clarity', directiveness: 'reflective', closing_type: 'none', action_id: null, situation: 'Cuando ya tienes una decisión y empiezas a pedir varias opiniones aunque en el fondo ya tengas una respuesta', intention: 'Confiar más en mi criterio', longitudinal_evidence_refs: null, editorial_signature: { psychologicalContract: null },
}));

// The controlled success fixture must exercise the same concrete signal as the blueprint.
candidates[0].blocks[0].text = 'Cuando ya tienes una decisión y empiezas a pedir varias opiniones, puedes observar que primero apareció una respuesta propia y después empezó la consulta.';

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url.includes('api.openai.com')) {
    counts.openai += 1;
    const body = JSON.parse(String(init.body ?? '{}'));
    const name = body.response_format?.json_schema?.name;
    if (url.includes('/embeddings')) return jsonResponse({ data: [{ embedding: Array.from({ length: 8 }, () => 0.01) }], usage: { prompt_tokens: 3, total_tokens: 3 } });
    if (name === 'nia_intervention_candidates') {
      if (failNextGeneration) {
        const timeout = new Error('aborted');
        timeout.name = 'AbortError';
        throw timeout;
      }
      const invalidCandidates = candidates.map(candidate => ({ ...candidate, intervention_type: 'practical_guidance', text: 'Confía en ti y recuerda que eres capaz.', blocks: [{ type: 'idea', text: 'Confía en ti y recuerda que eres capaz.' }], takeaway: 'Una frase bonita para sentirte mejor.', optional_action: null, optionalAction: null }));
      const responseCandidates = rejectNextGeneration || repairAlwaysFails || (repairNextGeneration && repairGenerationCalls++ === 0) ? invalidCandidates : candidates;
      rejectNextGeneration = false;
      if (repairNextGeneration && repairGenerationCalls > 1) repairNextGeneration = false;
      return jsonResponse({ id: 'controlled-generation', model: 'controlled-model', choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ candidates: responseCandidates }) } }], usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 } });
    }
    if (name === 'nia_intervention_audit') return jsonResponse({ id: 'controlled-audit', model: 'controlled-model', choices: [{ message: { content: JSON.stringify(audit) } }], usage: { prompt_tokens: 50, completion_tokens: 50, total_tokens: 100 } });
    throw new Error(`unexpected controlled OpenAI schema: ${name}`);
  }
  if (url.includes('evolution.controlled.test')) { counts.evolution += 1; return jsonResponse({ key: { id: 'controlled-provider-message' } }, 201); }
  throw new Error(`unexpected network request: ${url}`);
};

const { startExecutionRun, updateExecutionRun } = await import('../lib/server/operational-observability.ts');
const { resolveIntervention } = await import('../lib/server/intervention.ts');
const { composeNiaMessage } = await import('../lib/server/message-composer.ts');
const { claimDelivery, sendClaimedDelivery } = await import('../lib/server/whatsapp-daily.ts');

const execution = await startExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'controlled_e2e', idempotencyKey: `qa:${randomUUID()}`, executionContext: 'qa', concurrencyKey: `qa_active:${userId}` });
const result = await resolveIntervention(db, userId, 'intention', 'whatsapp', execution.idempotencyKey, execution, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${execution.executionId}`, localDate: '2026-10-04' });
const composed = composeNiaMessage({ content: result.intervention.text, firstName: 'Ana', timezone: 'America/Bogota', userKey: userId, now });
const interaction = (await db.from('interactions').insert({ user_id: userId, interaction_type: 'qa_daily_message', daily_unique_enforced: false, content: composed, local_date: '2026-10-04', slot: `qa:${execution.executionId}` }).select('*').single()).data;
assert.ok(interaction?.id, 'interaction was persisted');
assert.equal(interaction.interaction_type, 'qa_daily_message');
assert.equal(interaction.daily_unique_enforced, false);
const claim = await claimDelivery(db, { userId, interactionId: interaction.id, localDate: '2026-10-04', slot: `qa:${execution.executionId}` });
assert.ok(claim, 'delivery was claimed');
const sent = await sendClaimedDelivery(db, { ...claim, userId, interactionId: interaction.id, localDate: '2026-10-04', slot: `qa:${execution.executionId}` }, '573001234567', composed);
assert.equal(sent.ok, true, 'controlled Evolution accepted the message');
const delivery = db.tables.whatsapp_daily_deliveries.find(row => row.id === claim.id);
assert.equal(delivery.status, 'sent');
assert.equal(delivery.provider_message_id, 'controlled-provider-message');
const finalRun = db.tables.execution_runs.find(row => row.id === execution.executionId);
assert.equal(finalRun.status, 'approved');
assert.ok(finalRun.intervention_id);
assert.equal(db.tables.interventions.length, 1);
assert.equal(db.tables.interventions.find(row => row.id === finalRun.intervention_id).editorial_signature.psychologicalContract.mechanism_id, 'external_validation');
const plannedMovement = 'external_validation:notice_the_consulting_pattern';
const selectedCandidate = db.tables.intervention_candidates.find(row => row.selected_candidate === true);
const selectedIntervention = db.tables.interventions.find(row => row.id === finalRun.intervention_id);
assert.equal(selectedCandidate?.editorial_signature?.psychologicalMovementKey, plannedMovement);
assert.equal(selectedCandidate?.editorial_signature?.interventionBlueprint?.movement, plannedMovement);
assert.equal(selectedIntervention?.editorial_signature?.psychologicalMovementKey, plannedMovement);
assert.equal(selectedIntervention?.editorial_signature?.interventionBlueprint?.movement, plannedMovement);
assert.match(selectedIntervention?.editorial_signature?.psychologicalContract?.psychological_move ?? '', /observar cuándo empiezas/);
assert.equal(db.tables.intervention_candidates.length, 3);
assert.equal(db.tables.intervention_candidates.filter(row => row.selected_candidate === true).length, 1, 'exactly one candidate must be marked selected');
assert.equal(db.tables.intervention_candidates.find(row => row.selected_candidate === true).intervention_id, finalRun.intervention_id);
assert.equal(counts.evolution, 1);
assert.ok(counts.openai >= 4, `expected generation, embedding and audit provider calls, got ${counts.openai}`);

// Execution B proves that a provider timeout cannot inherit A's downstream state.
failNextGeneration = true;
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = ((callback, delay, ...args) => delay === 45_000 ? (callback(...args), 0) : realSetTimeout(callback, delay, ...args));
const timeoutExecution = await startExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'controlled_timeout', idempotencyKey: `qa-timeout:${randomUUID()}`, executionContext: 'qa', concurrencyKey: `qa_timeout:${userId}` });
await assert.rejects(
  resolveIntervention(db, userId, 'intention', 'whatsapp', timeoutExecution.idempotencyKey, timeoutExecution, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${timeoutExecution.executionId}`, localDate: '2026-10-04' }),
  /llm_timeout/,
);
globalThis.setTimeout = realSetTimeout;
failNextGeneration = false;
await updateExecutionRun(db, timeoutExecution, { status: 'failed', failure: new Error('llm_timeout') });
const timeoutRun = db.tables.execution_runs.find(row => row.id === timeoutExecution.executionId);
assert.equal(timeoutRun.status, 'failed');
assert.equal(timeoutRun.failure_code, 'llm_timeout');
assert.equal(timeoutRun.candidate_count ?? 0, 0);
assert.equal(timeoutRun.intervention_id ?? null, null);
assert.equal(db.tables.intervention_candidates.filter(row => row.execution_run_id === timeoutExecution.executionId).length, 0);
assert.equal(db.tables.interactions.filter(row => row.slot === `qa:${timeoutExecution.executionId}`).length, 0);
assert.equal(db.tables.whatsapp_daily_deliveries.filter(row => row.slot === `qa:${timeoutExecution.executionId}`).length, 0);
assert.equal(counts.evolution, 1, 'timeout execution must not call Evolution');
assert.notEqual(timeoutRun.intervention_id, finalRun.intervention_id);

// Execution C proves that a successful generation with no approved candidate
// stops at Gates and cannot create downstream records.
rejectNextGeneration = true;
const rejectionExecution = await startExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'controlled_rejection', idempotencyKey: `qa-rejection:${randomUUID()}`, executionContext: 'qa', concurrencyKey: `qa_rejection:${userId}` });
await assert.rejects(
  resolveIntervention(db, userId, 'intention', 'whatsapp', rejectionExecution.idempotencyKey, rejectionExecution, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${rejectionExecution.executionId}`, localDate: '2026-10-04' }),
  /no_approved_intervention/,
);
const rejectionRun = db.tables.execution_runs.find(row => row.id === rejectionExecution.executionId);
assert.equal(rejectionRun.status, 'no_approved_intervention');
assert.equal(rejectionRun.failure_code, 'no_approved_intervention');
assert.equal(rejectionRun.candidate_count, 3);
assert.equal(rejectionRun.intervention_id ?? null, null);
assert.equal(db.tables.intervention_candidates.filter(row => row.editorial_signature?.executionRunId === rejectionExecution.executionId).length, 3);
assert.equal(db.tables.interactions.filter(row => row.slot === `qa:${rejectionExecution.executionId}`).length, 0);
assert.equal(db.tables.whatsapp_daily_deliveries.filter(row => row.slot === `qa:${rejectionExecution.executionId}`).length, 0);
assert.equal(counts.evolution, 1, 'rejected editorial run must not call Evolution');

// Execution D proves one bounded repair can use the first round's rejection
// reasons, preserve the same movement, and continue when the repair passes.
repairNextGeneration = true;
const repairExecution = await startExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'controlled_repair', idempotencyKey: `qa-repair:${randomUUID()}`, executionContext: 'qa', concurrencyKey: `qa_repair:${userId}` });
const repaired = await resolveIntervention(db, userId, 'intention', 'whatsapp', repairExecution.idempotencyKey, repairExecution, { maxGenerationAttempts: 2, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${repairExecution.executionId}`, localDate: '2026-10-04' });
assert.ok(repaired.interventionId, 'repair should continue to intervention');
const repairRun = db.tables.execution_runs.find(row => row.id === repairExecution.executionId);
assert.equal(repairRun.status, 'approved');
assert.equal(repairRun.candidate_count, 6);
assert.equal(db.tables.generation_attempts.filter(row => row.execution_run_id === repairExecution.executionId).length, 2);
const repairCandidates = db.tables.intervention_candidates.filter(row => row.editorial_signature?.executionRunId === repairExecution.executionId);
assert.equal(repairCandidates.length, 6);
assert.equal(repairCandidates.filter(row => row.selected_candidate === true).length, 1);
assert.equal(repairCandidates.find(row => row.selected_candidate === true).intervention_id, repaired.interventionId);
assert.ok(repairCandidates.slice(0, 3).every(row => row.selected_candidate === false));
assert.equal(repairCandidates.find(row => row.selected_candidate === true).editorial_signature?.psychologicalMovementKey, repairCandidates[0].editorial_signature?.psychologicalMovementKey, 'repair must preserve the first round movement');

// Execution E proves that a failed repair has an explicit terminal code and
// never proceeds to intervention or delivery.
repairAlwaysFails = true;
const failedRepairExecution = await startExecutionRun(db, { userId, channel: 'whatsapp', triggerSource: 'controlled_repair_failure', idempotencyKey: `qa-repair-failure:${randomUUID()}`, executionContext: 'qa', concurrencyKey: `qa_repair_failure:${userId}` });
await assert.rejects(
  resolveIntervention(db, userId, 'intention', 'whatsapp', failedRepairExecution.idempotencyKey, failedRepairExecution, { maxGenerationAttempts: 2, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${failedRepairExecution.executionId}`, localDate: '2026-10-04' }),
  /no_approved_intervention_after_repair/,
);
const failedRepairRun = db.tables.execution_runs.find(row => row.id === failedRepairExecution.executionId);
assert.equal(failedRepairRun.status, 'no_approved_intervention');
assert.equal(failedRepairRun.failure_code, 'no_approved_intervention_after_repair');
assert.equal(failedRepairRun.intervention_id ?? null, null);
assert.equal(db.tables.intervention_candidates.filter(row => row.editorial_signature?.executionRunId === failedRepairExecution.executionId).length, 6);
assert.equal(counts.evolution, 1, 'failed repair must not call Evolution');

console.log(JSON.stringify({ status: 'PASS', execution_run: finalRun.id, planner: 'executed', candidates: db.tables.intervention_candidates.length, intervention: finalRun.intervention_id, composer: 'real', interaction: interaction.id, delivery: delivery.id, provider_message_id: delivery.provider_message_id, openai_boundary_calls: counts.openai, evolution_boundary_calls: counts.evolution }, null, 2));
