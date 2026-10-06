import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureActivationWelcome } from '../lib/server/reception-welcome.ts';

class Query {
  constructor(db) { this.db = db; this.filters = []; this.pending = null; }
  select() { return this; }
  eq(field, value) { this.filters.push([field, value]); return this; }
  order() { return this; }
  limit() { return this; }
  insert(value) { this.pending = value; return this; }
  async maybeSingle() {
    const row = this.db.rows.find(candidate => this.filters.every(([field, value]) => candidate[field] === value)) ?? null;
    return { data: row, error: null };
  }
  async single() {
    const row = { id: `welcome-${this.db.rows.length + 1}`, created_at: new Date().toISOString(), ...this.pending };
    this.db.rows.push(row);
    return { data: row, error: null };
  }
}

class FakeDb {
  constructor() { this.rows = []; }
  from() { return new Query(this); }
}

const db = new FakeDb();
const first = await ensureActivationWelcome(db, { userId: 'u1', firstName: 'Adriana', timezone: 'America/Bogota', now: new Date('2026-10-05T15:00:00Z') });
const second = await ensureActivationWelcome(db, { userId: 'u1', firstName: 'Adriana', timezone: 'America/Bogota', now: new Date('2026-10-05T15:01:00Z') });
assert.equal(first.created, true);
assert.equal(second.created, false);
assert.equal(first.interaction.id, second.interaction.id);
assert.equal(db.rows.length, 1);
assert.match(String(first.interaction.content), /Soy NIA/);

const activation = fs.readFileSync(new URL('../app/api/activation/complete/route.ts', import.meta.url), 'utf8');
const activatePage = fs.readFileSync(new URL('../app/activate/page.tsx', import.meta.url), 'utf8');
const interactions = fs.readFileSync(new URL('../app/api/interactions/route.ts', import.meta.url), 'utf8');
const inbound = fs.readFileSync(new URL('../lib/server/whatsapp-inbound.ts', import.meta.url), 'utf8');
const welcome = fs.readFileSync(new URL('../lib/server/reception-welcome.ts', import.meta.url), 'utf8');
const reception = fs.readFileSync(new URL('../lib/server/reception-progression.ts', import.meta.url), 'utf8');
const home = fs.readFileSync(new URL('../app/app/page.tsx', import.meta.url), 'utf8');

assert.doesNotMatch(activation, /ensureActivationWelcome/);
assert.doesNotMatch(activation, /welcome/);
assert.doesNotMatch(activatePage, /setWelcome|payload\.welcome/);
assert.match(activatePage, /router\.push\('\/onboarding'\)/);
assert.match(fs.readFileSync(new URL('../app/api/onboarding/complete/route.ts', import.meta.url), 'utf8'), /ensureActivationWelcome/);
assert.match(fs.readFileSync(new URL('../lib/server/welcome-delivery.ts', import.meta.url), 'utf8'), /scheduleWelcomeDelivery/);
assert.doesNotMatch(welcome, /whatsapp_connections|claimDelivery|sendClaimedDelivery|whatsapp_daily_deliveries|Evolution/);
assert.doesNotMatch(interactions, /ensureWelcome|ensureActivationWelcome/);
assert.doesNotMatch(inbound, /ensureWelcome|ensureActivationWelcome|welcome_delivery_failed/);
assert.match(reception, /const welcomeDelivered = Boolean\(welcome\)/);
assert.match(home, /interaction_type/);
assert.match(home, /daily_message/);
assert.match(home, /nia_point/);
assert.match(home, /isPsychologicalInteraction/);

console.log('activation welcome tests: PASS (activation-owned, idempotent, in-app only)');
