import { createAdminClient } from '../lib/supabase/admin.ts';
import { planConfig } from '../lib/hotmart-checkout.ts';
import { purchaseData } from '../lib/server/hotmart.ts';

const apply = process.argv.includes('--apply');
const admin = createAdminClient();
const grants = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'];
const { data: events, error } = await admin.from('hotmart_webhook_events').select('id,event_type,payload,status,received_at').eq('status', 'processed').in('event_type', grants).order('received_at', { ascending: true });
if (error) throw new Error(`hotmart_reconciliation_events_failed:${error.message}`);
const changes = [];
for (const event of events ?? []) {
  const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};
  const data = purchaseData(payload, event.event_type);
  const config = planConfig(data.planKey);
  const sandbox = payload.test === true || payload.environment === 'sandbox' || payload.data?.test === true;
  if (sandbox || !config || !data.subscriberCode || !data.trial || !data.nextBilling || !data.purchaseDate) continue;
  const entitlement = await admin.from('hotmart_entitlements').select('user_id,provider_entitlement_id').eq('provider', 'hotmart').eq('provider_entitlement_id', data.subscriberCode).maybeSingle();
  const userId = entitlement.data?.user_id;
  if (entitlement.error || !userId) continue;
  const existing = await admin.from('subscriptions').select('id,trial,status,next_billing_at').eq('provider', 'hotmart').eq('provider_subscription_id', data.subscriberCode).maybeSingle();
  if (existing.error || !existing.data || (existing.data.trial === true && existing.data.next_billing_at && new Date(existing.data.next_billing_at).getTime() === new Date(data.nextBilling).getTime())) continue;
  const values = { status: 'trialing', trial: true, trial_started_at: data.purchaseDate, trial_ends_at: data.nextBilling, next_billing_at: data.nextBilling, current_period_end: data.nextBilling, plan_key: config.key, plan_name: config.displayName, amount: data.amount, currency: config.currency, purchase_status: data.status, purchase_transaction: data.transaction };
  changes.push({ eventId: event.id, userId, subscriptionId: existing.data.id, offer: data.offerCode, values });
  if (apply) {
    const result = await admin.from('subscriptions').update(values).eq('id', existing.data.id).eq('user_id', userId);
    if (result.error) throw new Error(`hotmart_reconciliation_update_failed:${existing.data.id}`);
  }
}
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', candidates: changes.length, changes }, null, 2));
