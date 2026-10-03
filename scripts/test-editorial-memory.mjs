import assert from 'node:assert/strict';
import { buildEditorialMemory, buildEditorialRhythm } from '../lib/server/editorial-memory.ts';

const now = new Date('2026-10-03T12:00:00Z');
const row = (i, topic, angle, type = 'reflection', depth = 'medium') => ({ id: String(i), created_at: new Date(now.getTime() - i * 86400000).toISOString(), topic, concept: `${topic}-${i}`, angle, intervention_type: type, depth });
const memory = buildEditorialMemory([row(1, 'criterio propio', 'desacuerdo'), row(2, 'criterio propio', 'desacuerdo'), row(3, 'criterio propio', 'evidencia'), row(4, 'criterio propio', 'aprobacion'), row(5, 'limites', 'decir no', 'tool', 'brief'), row(6, 'limites', 'decir no', 'step_by_step', 'deep')], 30, now);
assert.equal(memory.topics[0].topic, 'criterio propio');
assert.equal(memory.topics[0].state, 'saturated');
assert.equal(memory.formats.reflection, 4);
assert.equal(memory.depths.brief, 1);
assert.equal(buildEditorialMemory([row(1, 'criterio propio', 'nuevo')], 30, now).topics[0].state, 'normal');
const rhythm = buildEditorialRhythm(Array.from({ length: 5 }, (_, i) => ({ ...row(i, 'criterio', 'desacuerdo'), experience_type: 'reflection', editorial_take: `take-${i}` })), now);
assert.equal(rhythm.last3.length, 3);
assert.equal(rhythm.experienceCounts.reflection, 5);
assert.equal(rhythm.dominantExperience, 'reflection');
assert.equal(rhythm.experienceConcentration, 1);
console.log('editorial memory tests: PASS');
