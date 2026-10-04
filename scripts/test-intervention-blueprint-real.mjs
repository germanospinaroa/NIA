import { randomUUID } from 'node:crypto';

if (!process.argv.includes('--confirm-real')) throw new Error('real_blueprint_acceptance_requires_--confirm-real');

const userId = process.env.QA_PROVIDER_USER_ID || '6f97c383-4882-4b52-a362-183641ed505e';
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
const { createAdminClient } = await import('../lib/supabase/admin.ts');
const { buildBrief, resolveIntervention } = await import('../lib/server/intervention.ts');
const { startQaExecutionRun, updateExecutionRun } = await import('../lib/server/operational-observability.ts');

const db = createAdminClient();
const idempotencyKey = `blueprint_acceptance:${randomUUID()}`;
const run = await startQaExecutionRun(db, { userId, requestId: randomUUID(), idempotencyKey, concurrencyKey: `blueprint_acceptance_active:${userId}` });
if (!run.created) throw new Error('real_blueprint_execution_not_created');
const execution = run.context;

try {
  const { brief } = await buildBrief(db, userId, 'intention', `qa:${execution.executionId}`, localDate);
  if (!brief.interventionBlueprint?.sema || !brief.interventionBlueprint.micro_action) throw new Error('real_blueprint_missing_transfer');
  const result = await resolveIntervention(db, userId, 'intention', 'web', idempotencyKey, execution, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${execution.executionId}`, localDate });
  const { data: candidates, error } = await db.from('intervention_candidates').select('candidate_text,editorial_signature,audit_results,selected_candidate').eq('user_id', userId).like('editorial_signature->>executionRunId', execution.executionId).order('created_at', { ascending: true });
  if (error) throw error;
  console.log(JSON.stringify({
    status: 'PASS',
    execution_id: execution.executionId,
    intervention_id: result.interventionId,
    blueprint: brief.interventionBlueprint,
    sema: brief.sema,
    candidates: (candidates ?? []).map(candidate => ({ text: candidate.candidate_text, selected: candidate.selected_candidate, movement: candidate.editorial_signature?.psychologicalMovementKey, audit: candidate.audit_results })),
    selected_message: result.intervention.text,
  }, null, 2));
} catch (error) {
  const { data: candidates } = await db.from('intervention_candidates').select('candidate_text,editorial_signature,audit_results,selected_candidate').like('editorial_signature->>executionRunId', execution.executionId).order('created_at', { ascending: true });
  await updateExecutionRun(db, execution, { status: 'failed', failure: error });
  console.error(JSON.stringify({ status: 'FAIL', execution_id: execution.executionId, error: error instanceof Error ? error.message : String(error), candidates: candidates ?? [] }));
  process.exitCode = 1;
}
