import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

type Json = Record<string, unknown>;

function at(value: unknown, path: string[]) {
  let current: unknown = value;
  for (const key of path) current = current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  return current;
}

export function hotmartEventId(payload: Json) {
  const explicit = at(payload, ['id']) || at(payload, ['data', 'id']) || at(payload, ['data', 'purchase', 'transaction']) || at(payload, ['data', 'subscription', 'subscriber_code']);
  if (typeof explicit === 'string' && explicit) return `${payload.event || 'unknown'}:${explicit}`;
  return `payload:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
}

export function validHotmartToken(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function purchaseData(payload: Json) {
  const data = (payload.data && typeof payload.data === 'object' ? payload.data : payload) as Json;
  const buyer = (data.buyer && typeof data.buyer === 'object' ? data.buyer : {}) as Json;
  const purchase = (data.purchase && typeof data.purchase === 'object' ? data.purchase : {}) as Json;
  const subscription = (data.subscription && typeof data.subscription === 'object' ? data.subscription : {}) as Json;
  const product = (data.product && typeof data.product === 'object' ? data.product : {}) as Json;
  const plan = (data.plan && typeof data.plan === 'object' ? data.plan : {}) as Json;
  const email = String(buyer.email ?? data.email ?? '').trim().toLowerCase();
  const subscriberCode = subscription.subscriber_code ?? data.subscriber_code ?? null;
  const transaction = purchase.transaction ?? data.transaction ?? null;
  return {
    email,
    firstName: typeof buyer.first_name === 'string' ? buyer.first_name : typeof buyer.name === 'string' ? buyer.name.split(/\s+/)[0] : null,
    productId: product.id ? String(product.id) : null,
    productName: product.name ? String(product.name) : null,
    planId: plan.id ? String(plan.id) : null,
    planName: plan.name ? String(plan.name) : null,
    planKey: plan.id ? String(plan.id) : product.id ? String(product.id) : null,
    subscriberCode: subscriberCode ? String(subscriberCode) : null,
    transaction: transaction ? String(transaction) : null,
    status: String(subscription.status ?? purchase.status ?? payload.event ?? 'unknown').toLowerCase(),
    nextBilling: subscription.date_next_charge ?? subscription.next_charge_date ?? null,
    trial: Boolean(subscription.trial_period || subscription.trial),
    amount: purchase.price && typeof purchase.price === 'object' && (purchase.price as Json).value != null ? Number((purchase.price as Json).value) : null,
    currency: purchase.price && typeof purchase.price === 'object' && (purchase.price as Json).currency_code ? String((purchase.price as Json).currency_code) : null,
  };
}

async function ensureUser(admin: SupabaseClient, input: ReturnType<typeof purchaseData>, origin: string) {
  void origin;
  type UserRecord = { id: string; user_metadata: Record<string, unknown> | null };
  let user: UserRecord | null = null;
  for (let page = 1; page <= 20 && !user; page += 1) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (listed.error) throw new Error('hotmart_user_lookup_failed');
    user = (listed.data.users.find(candidate => candidate.email?.toLowerCase() === input.email) as UserRecord | undefined) ?? null;
    if (listed.data.users.length < 1000) break;
  }
  if (!user) {
    const created = await admin.auth.admin.createUser({ email: input.email, password: randomBytes(32).toString('hex'), email_confirm: true, user_metadata: { first_name: input.firstName, must_set_password: true, account_status: 'pending_activation' } });
    if (created.error || !created.data.user) throw new Error('hotmart_user_create_failed');
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...(user.user_metadata ?? {}), first_name: input.firstName ?? user.user_metadata?.first_name, must_set_password: true, account_status: 'pending_activation' } });
    if (updated.error) throw new Error('hotmart_user_update_failed');
  }
  const { error: profileError } = await admin.from('profiles').upsert({ id: user.id, first_name: input.firstName || 'NIA', account_status: 'pending_activation', must_set_password: true }, { onConflict: 'id' });
  if (profileError) throw new Error('hotmart_profile_create_failed');
  return user.id;
}

export async function processHotmartEvent(admin: SupabaseClient, payload: Json, origin: string) {
  const event = String(payload.event ?? 'unknown');
  const eventId = hotmartEventId(payload);
  const inserted = await admin.from('hotmart_webhook_events').insert({ event_id: eventId, event_type: event, payload, status: 'received' }).select('id').maybeSingle();
  if (inserted.error?.code === '23505') return { duplicate: true, eventId };
  if (inserted.error || !inserted.data) throw new Error('hotmart_event_save_failed');
  const data = purchaseData(payload);
  try {
    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_CANCELED' || event === 'SUBSCRIPTION_CANCELLATION') {
      if (!data.email) throw new Error('hotmart_buyer_email_missing');
      const userId = await ensureUser(admin, data, origin);
      const entitlementId = data.subscriberCode || data.transaction || eventId;
      await admin.from('hotmart_entitlements').upsert({ provider: 'hotmart', provider_entitlement_id: entitlementId, buyer_email: data.email, first_name: data.firstName, user_id: userId, plan_key: data.planKey, plan_name: data.planName, status: event === 'PURCHASE_APPROVED' ? 'pending_activation' : 'active', metadata: payload }, { onConflict: 'provider,provider_entitlement_id' });
      const status = event === 'PURCHASE_APPROVED' ? 'active' : event === 'PURCHASE_CANCELED' || event === 'SUBSCRIPTION_CANCELLATION' ? 'canceled' : 'active';
      const subscription = { user_id: userId, provider: 'hotmart', provider_subscription_id: data.subscriberCode, provider_product_id: data.productId, provider_product_name: data.productName, provider_plan_id: data.planId, plan_key: data.planKey, plan_name: data.planName, status, trial: data.trial, next_billing_at: data.nextBilling, subscriber_code: data.subscriberCode, purchase_transaction: data.transaction, purchase_status: data.status, currency: data.currency, amount: data.amount };
      if (data.subscriberCode) {
        const existing = await admin.from('subscriptions').select('id').eq('provider', 'hotmart').eq('provider_subscription_id', data.subscriberCode).maybeSingle();
        if (existing.data?.id) await admin.from('subscriptions').update(subscription).eq('id', existing.data.id);
        else await admin.from('subscriptions').insert(subscription);
      }
    }
    await admin.from('hotmart_webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', inserted.data.id);
    return { duplicate: false, eventId };
  } catch (error) {
    await admin.from('hotmart_webhook_events').update({ status: 'failed', error: error instanceof Error ? error.message : 'hotmart_processing_failed' }).eq('id', inserted.data.id);
    throw error;
  }
}

export async function cancelHotmartSubscription(subscriberCode: string) {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('hotmart_not_configured');
  const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', { method: 'POST', headers: { authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!tokenResponse.ok) throw new Error('hotmart_token_failed');
  const token = await tokenResponse.json();
  const response = await fetch(`https://api-sec-vlc.hotmart.com/payments/api/v1/subscriptions/${encodeURIComponent(subscriberCode)}/cancel`, { method: 'POST', headers: { authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ send_mail: false }) });
  if (!response.ok) throw new Error('hotmart_cancel_failed');
  return response.json();
}
