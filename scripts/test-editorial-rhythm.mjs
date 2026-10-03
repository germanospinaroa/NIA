import assert from 'node:assert/strict';
import { buildEditorialRhythm } from '../lib/server/editorial-memory.ts';
import { planEditorial } from '../lib/server/editorial-planner.ts';

const now = new Date('2026-10-03T12:00:00Z');
const row = (i, experience, take = `take-${i}`) => ({ id: String(i), created_at: new Date(now.getTime() - i * 86400000).toISOString(), topic: 'criterio', concept: `idea-${i}`, angle: `angle-${i}`, intervention_type: experience === 'practical_tool' ? 'tool' : 'reflection', depth: 'medium', experience_type: experience, editorial_take: take });
const reflective = Array.from({ length: 3 }, (_, i) => row(i, 'reflection'));
const memory = { windowDays: 30, recent: reflective, topics: [], formats: { brief_insight: 0, reflection: 3, practical_guidance: 0, tool: 0, step_by_step: 0, example: 0, deep_dive: 0 }, depths: { brief: 0, medium: 3, deep: 0 }, totalWithTopic: 3, rhythm: buildEditorialRhythm(reflective, now) };
const plan = planEditorial({ desiredChange: 'Confiar más en mi criterio', currentContext: 'Cuando cuestionan una decisión', communicationPreference: 'adaptive', memory, relevantTopics: ['criterio'] });
assert.notEqual(plan.recommended_experience_type, 'reflection');
const varied = buildEditorialRhythm([row(0, 'reflection'), row(1, 'practical_tool'), row(2, 'encouragement')], now);
assert.equal(varied.experienceConcentration < 0.6, true);
const sameTopicNewTake = buildEditorialRhythm([row(0, 'reflection', 'take-a'), row(1, 'practical_tool', 'take-b')], now);
assert.equal(sameTopicNewTake.repeatedTake, null);
console.log('editorial rhythm tests: PASS');
