import fs from 'node:fs/promises';
import path from 'node:path';

if (!process.argv.includes('--confirm-real')) throw new Error('prospective_buffer_real_requires_--confirm-real');
const userId = process.env.QA_PROVIDER_USER_ID || '6f97c383-4882-4b52-a362-183641ed505e';
const root = process.cwd();
const ledgerPath = path.join(root, 'artifacts', 'prospective-buffer-cost.jsonl');
await fs.mkdir(path.dirname(ledgerPath), { recursive: true });
await fs.writeFile(ledgerPath, '');

const { createAdminClient } = await import('../lib/supabase/admin.ts');
const { refillApprovedBuffer } = await import('../lib/server/refill-approved-buffer.ts');
const db = createAdminClient();
const { data: active, error: activeError } = await db.from('approved_intervention_buffer').select('id,intended_local_date,status').eq('user_id', userId).in('status', ['approved', 'buffered']).order('intended_local_date', { ascending: true });
if (activeError) throw activeError;
if ((active ?? []).length) throw new Error(`prospective_buffer_test_requires_empty_active_buffer:${(active ?? []).length}`);

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
