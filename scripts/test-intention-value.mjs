import assert from 'node:assert/strict';
import { hasInterventionValue } from '../lib/intervention-quality.ts';
import { intentionLabel, invalidIntention, isValidIntention, validCustomIntention } from '../lib/intention.ts';
import { auditCandidate, generateCandidates } from '../lib/intervention-engine.ts';

assert.equal(invalidIntention('no se'), true);
assert.equal(invalidIntention('no sé'), true);
assert.equal(validCustomIntention('Quiero expresar lo que pienso'), true);
assert.equal(isValidIntention('trust_own_judgment', intentionLabel('trust_own_judgment')), true);
assert.equal(isValidIntention('intention_unclear', null), false);
assert.equal(hasInterventionValue('Puedes escuchar esta opinión sin cambiar lo que decidiste.'), false);
const brief = { desiredChange: 'Confiar más en mi criterio.', currentContext: 'cuando alguien cuestiona lo que decidí.', recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [], learningSignals: [] };
const candidates = generateCandidates(brief);
assert.equal(candidates.length, 3);
assert.equal(candidates.every(candidate => hasInterventionValue(candidate.text)), true);
assert.equal(candidates.every(candidate => auditCandidate(candidate, brief).approved), true);
console.log('intention/value contract tests: PASS');
