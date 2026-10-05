import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

if (!process.argv.includes('--confirm-real')) {
  throw new Error('provider_acceptance_requires_--confirm-real');
}

const userId = process.env.QA_PROVIDER_USER_ID || '6f97c383-4882-4b52-a362-183641ed505e';
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
const { createAdminClient } = await import('../lib/supabase/admin.ts');
const { buildBrief, resolveIntervention } = await import('../lib/server/intervention.ts');
const { startQaExecutionRun, recordExecutionStage, updateExecutionRun } = await import('../lib/server/operational-observability.ts');
const { composeNiaMessage } = await import('../lib/server/message-composer.ts');
const { claimDelivery, sendClaimedDelivery } = await import('../lib/server/whatsapp-daily.ts');

const db = createAdminClient();
const { data: profile, error: profileError } = await db.from('profiles').select('id,first_name,timezone,direction_key,whatsapp_enabled').eq('id', userId).single();
if (profileError || !profile) throw new Error('provider_acceptance_profile_unavailable');
const { data: connection, error: connectionError } = await db.from('whatsapp_connections').select('user_id,wa_id,status,provider').eq('user_id', userId).eq('status', 'connected').maybeSingle();
if (connectionError || !connection?.wa_id || connection.provider !== 'evolution') throw new Error('provider_acceptance_evolution_not_connected');

const qaRunId = randomUUID();
const idempotencyKey = `admin_acceptance:${qaRunId}`;
const concurrencyKey = `admin_acceptance_active:${userId}`;
const run = await startQaExecutionRun(db, { userId, requestId: randomUUID(), idempotencyKey, concurrencyKey });
if (!run.created) throw new Error('provider_acceptance_execution_not_created');
const execution = run.context;

try {
  const { brief, history } = await buildBrief(db, userId, 'intention', `qa:${execution.executionId}`, localDate);
  assert.equal(brief.psychologicalContract?.sufficient, true, 'psychological contract must be sufficient');
  await recordExecutionStage(db, execution, 'brief', { status: 'completed' });
  await recordExecutionStage(db, execution, 'editorial_memory', { status: 'completed', recent_count: history.length });
  await recordExecutionStage(db, execution, 'planner', { status: 'completed', strategy: brief.editorialPlan?.strategy ?? null, topic: brief.editorialPlan?.recommended_topic ?? null });
  await recordExecutionStage(db, execution, 'psychological_contract', { status: 'completed', sufficient: true, mechanism_id: brief.psychologicalContract?.mechanism_id, psychological_move: brief.psychologicalContract?.psychological_move, expected_movement: brief.psychologicalContract?.expected_movement });

  const result = await resolveIntervention(db, userId, 'intention', 'whatsapp', idempotencyKey, execution, { maxGenerationAttempts: 2, disableTechnicalGenerationRetry: true, executionContext: 'qa', slot: `qa:${execution.executionId}`, localDate });
  assert.ok(result.interventionId, 'intervention must be persisted');
  await recordExecutionStage(db, execution, 'intervention', { status: 'completed', intervention_id: result.interventionId });

  const recent = await db.from('interactions').select('content,slot').eq('user_id', userId).order('created_at', { ascending: false }).limit(16);
  const recentContents = (recent.data ?? []).filter(row => typeof row.slot !== 'string' || !row.slot.startsWith('qa:')).slice(0, 8).map(row => row.content).filter(value => typeof value === 'string');
  const content = composeNiaMessage({ content: result.intervention.text, firstName: profile.first_name, timezone: profile.timezone, userKey: userId, now: new Date(), recentContents });
  await recordExecutionStage(db, execution, 'composer', { status: 'completed', shared_composer: true, content_length: content.length });
  const { data: interaction, error: interactionError } = await db.from('interactions').insert({ user_id: userId, interaction_type: 'daily_message', direction_key: profile.direction_key, content, local_date: localDate, slot: `qa:${execution.executionId}` }).select('id').single();
  if (interactionError || !interaction) throw new Error('provider_acceptance_interaction_save_failed');
  await recordExecutionStage(db, execution, 'interaction', { status: 'completed', interaction_id: interaction.id });

  const claim = await claimDelivery(db, { userId, interactionId: interaction.id, localDate, slot: `qa:${execution.executionId}` });
  if (!claim) throw new Error('provider_acceptance_delivery_claim_failed');
  await recordExecutionStage(db, execution, 'delivery_claim', { status: 'completed', delivery_id: claim.id });
  const sent = await sendClaimedDelivery(db, { ...claim, userId, interactionId: interaction.id, localDate, slot: `qa:${execution.executionId}` }, connection.wa_id, content);
  if (!sent.ok || !sent.providerMessageId) throw new Error('provider_acceptance_evolution_failed');
  await recordExecutionStage(db, execution, 'sender', { status: 'completed', provider: 'evolution', provider_message_id_present: true });
  await recordExecutionStage(db, execution, 'evolution', { status: 'completed', http_status: sent.status ?? null, provider_message_id_present: true });

  const { data: candidates } = await db.from('intervention_candidates').select('id,intervention_id,audit_results,rejection_reason,editorial_signature').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
  const executionCandidates = (candidates ?? []).filter(row => row.editorial_signature?.executionRunId === execution.executionId);
  const { data: delivery } = await db.from('whatsapp_daily_deliveries').select('id,status,provider_message_id,interaction_id,slot').eq('user_id', userId).eq('slot', `qa:${execution.executionId}`).single();
  const { data: finalRun } = await db.from('execution_runs').select('id,status,candidate_count,intervention_id,completed_at,stage_results').eq('id', execution.executionId).single();
  assert.equal(finalRun?.status, 'approved');
  assert.equal(delivery?.status, 'sent');
  assert.equal(delivery?.provider_message_id, sent.providerMessageId);
  assert.equal(delivery?.interaction_id, interaction.id);
  assert.ok(executionCandidates.length >= 1);
  console.log(JSON.stringify({ status: 'PASS', execution_id: execution.executionId, intervention_id: result.interventionId, interaction_id: interaction.id, delivery_id: delivery?.id, provider_message_id: sent.providerMessageId, candidates: executionCandidates.length, candidate_count: finalRun?.candidate_count ?? null, openai_calls_expected: '1 generation plus configured editorial provider audits/embeddings', evolution_status: sent.status ?? null, final_execution_status: finalRun?.status }, null, 2));
} catch (error) {
  await updateExecutionRun(db, execution, { status: 'failed', failure: error });
  console.error(JSON.stringify({ status: 'FAIL', execution_id: execution.executionId, error: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
}
