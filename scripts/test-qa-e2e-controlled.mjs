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
  profiles: [{ id: userId, first_name: 'Ana', direction_key: '', desired_change_original: 'Confiar más en mi criterio', current_context_original: 'Estoy dudando de mí', current_context_domain: 'decisiones', desired_change_language: [], learning_profile: {}, communication_preference: 'adaptive', desired_change_concepts: [], voice_style: null }],
  interventions: [], learning_signals: [], context_history: [], execution_runs: [], generation_attempts: [], execution_provider_calls: [], provider_call_costs: [], provider_pricing: [], event_log: [], intervention_candidates: [], interactions: [], whatsapp_daily_deliveries: [], admin_audit_log: [],
};
const counts = { openai: 0, evolution: 0 };

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
  topic: 'criterio propio', intervention_type: index === 0 ? 'brief_insight' : 'reflection', depth: index === 0 ? 'brief' : 'medium', editorial_take: index === 0 ? 'Una duda ajena no es una prueba de que estés equivocada.' : `Puedes escuchar una opinión y seguir pensando por tu cuenta ${index}.`, editorial_idea: index === 0 ? 'Una duda ajena no demuestra que tu decisión esté mal.' : `Escuchar una opinión no obliga a entregar la decisión ${index}.`, experience_type: index === 0 ? 'perspective_shift' : 'reflection', blocks: [{ type: 'idea', text: index === 0 ? 'A veces alguien cuestiona una decisión tuya y de inmediato empiezas a pensar que quizá sí te equivocaste.' : `Puedes escuchar una opinión sin convertirla en una instrucción ${index}.` }], function: index === 0 ? 'reframe' : 'distinguish', concept: index === 0 ? 'desacuerdo no es evidencia' : `escuchar sin ceder ${index}`, angle: index === 0 ? 'separar desacuerdo de evidencia' : `opinión y decisión ${index}`, structure: index === 0 ? 'context_does_not_mean' : 'distinguish_between', editorial_type: index === 0 ? 'reframe' : 'distinction', signal: 'alguien cuestiona una decisión', evidence_direction: 'la duda ajena no aporta evidencia por sí sola', movement: 'separar desacuerdo de error', opening_closing: 'idea breve', insight_id: null, functional_emotion: 'clarity', directiveness: 'reflective', closing_type: 'none', action_id: null, situation: 'Estoy dudando de mí', intention: 'Confiar más en mi criterio', longitudinal_evidence_refs: null,
}));

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url.includes('api.openai.com')) {
    counts.openai += 1;
    const body = JSON.parse(String(init.body ?? '{}'));
    const name = body.response_format?.json_schema?.name;
    if (url.includes('/embeddings')) return jsonResponse({ data: [{ embedding: Array.from({ length: 8 }, () => 0.01) }], usage: { prompt_tokens: 3, total_tokens: 3 } });
    if (name === 'nia_intervention_candidates') return jsonResponse({ id: 'controlled-generation', model: 'controlled-model', choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ candidates }) } }], usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 } });
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
const interaction = (await db.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', content: composed, local_date: '2026-10-04', slot: `qa:${execution.executionId}` }).select('*').single()).data;
assert.ok(interaction?.id, 'interaction was persisted');
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
assert.equal(db.tables.intervention_candidates.length, 3);
assert.equal(counts.evolution, 1);
assert.ok(counts.openai >= 5, `expected generation, embeddings and audit provider calls, got ${counts.openai}`);
console.log(JSON.stringify({ status: 'PASS', execution_run: finalRun.id, planner: 'executed', candidates: db.tables.intervention_candidates.length, intervention: finalRun.intervention_id, composer: 'real', interaction: interaction.id, delivery: delivery.id, provider_message_id: delivery.provider_message_id, openai_boundary_calls: counts.openai, evolution_boundary_calls: counts.evolution }, null, 2));
