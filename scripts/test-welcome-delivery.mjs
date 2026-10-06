import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scheduleWelcomeDelivery } from '../lib/server/welcome-delivery.ts';

class Query {
  constructor(db) { this.db = db; this.filters = []; this.pending = null; this.selected = false; }
  select() { this.selected = true; return this; }
  eq(field, value) { this.filters.push([field, value]); return this; }
  insert(value) { this.pending = value; return this; }
  async maybeSingle() { return { data: this.db.rows.find(row => this.filters.every(([field, value]) => row[field] === value)) ?? null, error: null }; }
  async single() { const row = { id: `welcome-delivery-${this.db.rows.length + 1}`, status: 'pending', attempt_count: 0, ...this.pending }; this.db.rows.push(row); return { data: row, error: null }; }
}
class FakeDb { constructor() { this.rows = []; } from() { return new Query(this); } }

const db = new FakeDb();
const dueAt = new Date('2026-10-06T13:01:00Z');
const first = await scheduleWelcomeDelivery(db, { userId: 'u1', interactionId: 'i1', dueAt });
const second = await scheduleWelcomeDelivery(db, { userId: 'u1', interactionId: 'i1', dueAt: new Date('2026-10-06T13:02:00Z') });
assert.equal(first.id, second.id);
assert.equal(db.rows.length, 1);
assert.equal(first.status, 'pending');
assert.equal(first.due_at, dueAt.toISOString());

const source = fs.readFileSync('lib/server/welcome-delivery.ts', 'utf8');
assert.match(source, /whatsapp_welcome_deliveries/);
assert.match(source, /provider_message_id/);
assert.match(source, /attempt_count/);
assert.match(source, /locked_until/);
assert.match(source, /status: 'sent'/);
assert.match(source, /status: 'failed'/);
assert.doesNotMatch(source, /whatsapp_daily_deliveries/);
console.log('welcome delivery tests: PASS');
