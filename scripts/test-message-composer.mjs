import assert from 'node:assert/strict';
import { closingFor, composeNiaMessage, evaluateFinalNiaMessage, greetingFor, timeOfDay, timeOfDayForLocalTime } from '../lib/server/message-composer.ts';

const bogota = 'America/Bogota';
const utc = (value) => new Date(value);
assert.equal(timeOfDay(utc('2026-10-03T13:00:00.000Z'), bogota), 'morning');
assert.equal(timeOfDay(utc('2026-10-03T18:00:00.000Z'), bogota), 'afternoon');
assert.equal(timeOfDay(utc('2026-10-04T01:00:00.000Z'), bogota), 'night');
assert.equal(timeOfDay(utc('2026-10-03T08:00:00.000Z'), 'Europe/Madrid'), 'morning');
assert.equal(greetingFor('Adriana', utc('2026-10-03T13:00:00.000Z'), bogota), 'Buenos días, Adriana.');
assert.equal(greetingFor('Adriana', utc('2026-10-03T18:00:00.000Z'), bogota), 'Buenas tardes, Adriana.');
assert.equal(greetingFor('Adriana', utc('2026-10-04T01:00:00.000Z'), bogota), 'Buenas noches, Adriana.');
assert.equal(greetingFor(null, utc('2026-10-03T13:00:00.000Z'), bogota).includes('Laura'), false);
assert.equal(greetingFor(null, utc('2026-10-03T13:00:00.000Z'), bogota), 'Buenos días.');
const content = 'Cuando alguien cuestiona una decisión tuya, prueba esta pausa y anota qué cambió realmente.';
const first = composeNiaMessage({ content, firstName: 'Adriana', timezone: bogota, userKey: 'user-a', now: utc('2026-10-03T13:00:00.000Z') });
assert.match(first, /^Buenos días, Adriana\./);
assert.match(first, /Cuando alguien cuestiona/);
assert.ok(first.split('\n\n').length === 2);
assert.equal(first.includes('Nos leemos mañana'), false);
const explicitClosing = composeNiaMessage({ content, firstName: 'Adriana', timezone: bogota, userKey: 'user-a', now: utc('2026-10-03T13:00:00.000Z'), closing: 'Revisa qué dato cambió.' });
assert.match(explicitClosing, /Revisa qué dato cambió/);
const closing = closingFor(content, utc('2026-10-03T13:00:00.000Z'), bogota, 'user-a');
const nextClosing = closingFor(content, utc('2026-10-04T13:00:00.000Z'), bogota, 'user-a', [closing]);
assert.notEqual(nextClosing, closing);
assert.equal(first.includes('Laura'), false);
assert.equal(first.split(/\s+/).length < 220, true);
assert.equal(evaluateFinalNiaMessage(first, { firstName: 'Adriana' }).approved, true);
for (const doubleGreeting of ['Hola, Adriana. Buenos días.', 'Hola, Adriana. Buenas tardes.', 'Hola, Adriana. Buenas noches.']) {
  const evaluation = evaluateFinalNiaMessage(`${doubleGreeting}\n\n${content}`, { firstName: 'Adriana' });
  assert.equal(evaluation.approved, false);
  assert.ok(evaluation.hardFailures.includes('double_greeting'));
}
assert.equal(timeOfDayForLocalTime('08:00'), 'morning');
assert.equal(timeOfDayForLocalTime('20:00'), 'night');
console.log('message composer tests: PASS');
