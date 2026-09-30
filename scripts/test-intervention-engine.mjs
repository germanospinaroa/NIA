import assert from 'node:assert/strict';
import { auditCandidate, feedbackFor, learningFromFeedback } from '../lib/intervention-engine.ts';

const base = { desiredChange: 'Quiero confiar más en mis decisiones.', currentContext: 'Mi jefe cuestiona mis decisiones.', recentInterventions: [], recentConcepts: [], recentAngles: [], recentStructures: [] };
const generic = { text: 'Confía en ti.', function: 'remind', concept: 'self_trust', angle: 'generic', structure: 'specific_permission' };
assert.equal(auditCandidate(generic, base).status, 'rejected');
assert(auditCandidate(generic, base).reasons.includes('generic_or_missing_user_context'));
const duplicate = { text: 'No necesitas aprobación para decidir.', function: 'distinguish', concept: 'self_trust', angle: 'approval', structure: 'distinguish_between' };
const duplicateAudit = auditCandidate(duplicate, { ...base, recentInterventions: ['Confía en tu criterio.'] });
assert.equal(duplicateAudit.status, 'rejected');
assert(duplicateAudit.reasons.includes('semantic_duplicate'));
const contextual = { text: 'Que tu jefe cuestione una decisión no significa que tengas que volver a tomarla.', function: 'anticipate', concept: 'self_trust', angle: 'context_without_abandonment', structure: 'context_does_not_mean' };
assert.equal(auditCandidate(contextual, base).status, 'approved');
assert.equal(learningFromFeedback('context', 'context_changed').triggerRecalibration, true);
assert.equal(learningFromFeedback('specificity', 'wording_off').preserveConcept, true);
assert.equal(learningFromFeedback('angle', 'angle_change').avoidAngleForRecentWindow, true);
assert.equal(feedbackFor(contextual).dimension, 'relevance');
console.log('intervention-engine tests: PASS');
