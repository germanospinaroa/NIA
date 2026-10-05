import { createAdminClient } from '../lib/supabase/admin.ts';
import { persistProviderCallCost } from '../lib/server/cost-ledger.ts';

if (process.env.CONFIRM_COST_BACKFILL !== '1') {
  console.log('Backfill not run. Set CONFIRM_COST_BACKFILL=1 explicitly to execute it.');
  process.exit(0);
}

const admin = createAdminClient();
let offset = 0;
const pageSize = 200;
let processed = 0;
while (true) {
  const { data, error } = await admin.from('execution_provider_calls').select('id,execution_run_id,provider,model,operation,input_tokens,output_tokens,total_tokens,created_at').range(offset, offset + pageSize - 1);
  if (error) throw new Error(`backfill_read_failed: ${error.message}`);
  if (!data?.length) break;
  for (const call of data) { await persistProviderCallCost(admin, call); processed += 1; }
  offset += data.length;
  if (data.length < pageSize) break;
}
console.log(`Backfill completed for ${processed} provider calls.`);
