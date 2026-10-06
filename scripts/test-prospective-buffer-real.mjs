import fs from 'node:fs/promises';
import path from 'node:path';

if (!process.argv.includes('--confirm-real')) throw new Error('prospective_buffer_real_requires_--confirm-real');
const userId = process.env.QA_CLEAN_CONTENT_USER_ID;
if (!userId) throw new Error('clean_content_fixture_required');
const root = process.cwd();
const ledgerPath = path.join(root, 'artifacts', 'prospective-buffer-cost.jsonl');

const { createAdminClient } = await import('../lib/supabase/admin.ts');
const { buildBrief } = await import('../lib/server/intervention.ts');
const { refillApprovedBuffer } = await import('../lib/server/refill-approved-buffer.ts');
const db = createAdminClient();
const { data: active, error: activeError } = await db.from('approved_intervention_buffer').select('id,intended_local_date,status').eq('user_id', userId).in('status', ['approved', 'buffered']).order('intended_local_date', { ascending: true });
if (activeError) throw activeError;
const { data: interventions, error: interventionError } = await db.from('interventions').select('status,delivered_at,execution_context').eq('user_id', userId);
if (interventionError) throw interventionError;
const deliveredInterventions = (interventions ?? []).filter(row => row.status === 'delivered' || Boolean(row.delivered_at));
const nonQaDelivered = deliveredInterventions.filter(row => row.execution_context !== 'qa');
const { brief } = await buildBrief(db, userId, 'intention');
const deliveredExposures = brief.movementExposures ?? [];
if ((active ?? []).length || deliveredExposures.length || deliveredInterventions.length || nonQaDelivered.length) {
  throw new Error(`clean_content_fixture_required:active=${(active ?? []).length}:delivered=${deliveredInterventions.length}:movement_exposures=${deliveredExposures.length}:non_qa_delivered=${nonQaDelivered.length}`);
}

await fs.mkdir(path.dirname(ledgerPath), { recursive: true });
await fs.writeFile(ledgerPath, '');

const result = await refillApprovedBuffer(db, userId, {
  minBufferDays: 3,
  targetBufferDays: 5,
  maxCostUsd: 0.05,
  onUsage: async record => { await fs.appendFile(ledgerPath, `${JSON.stringify({ ...record, recordedAt: new Date().toISOString() })}\n`); },
});
const { data: rows, error: rowsError } = await db.from('approved_intervention_buffer').select('id,intended_local_date,plan,message,status,normalized_message_hash,intervention_signature').eq('user_id', userId).in('status', ['approved', 'buffered']).order('intended_local_date', { ascending: true });
if (rowsError) throw rowsError;
const output = { status: result.created.length === 5 ? 'PASS' : 'FAIL', userId, result, activeRows: rows ?? [], costLedger: ledgerPath, whatsappSent: 0 };
console.log(JSON.stringify(output, null, 2));
if (output.status !== 'PASS') process.exitCode = 1;
