import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { planConfig, planForHotmartOffer } from '../hotmart-checkout.ts';

type Json = Record<string, unknown>;

function at(value: unknown, path: string[]) {
  let current: unknown = value;
  for (const key of path) current = current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  return current;
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}

function booleanValue(value: unknown) {
  if (value === true || value === 1) return true;
  return typeof value === 'string' && ['true', '1', 'yes'].includes(value.trim().toLowerCase());
}

export function dateValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const milliseconds = Math.abs(value) < 1e12 ? value * 1000 : value;
    const date = new Date(milliseconds);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim();
  if (/^\d+(?:\.\d+)?$/.test(normalized)) return dateValue(Number(normalized));
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function hotmartEventId(payload: Json) {
  const explicit = at(payload, ['id']) ?? at(payload, ['data', 'id']);
  if (explicit !== undefined && explicit !== null && String(explicit)) return String(explicit);
  const transaction = stringValue(at(payload, ['data', 'purchase', 'transaction']) ?? at(payload, ['purchase', 'transaction']));
  if (transaction) return `${String(payload.event ?? 'unknown')}:${transaction}`;
  return `payload:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
}

export function validHotmartToken(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type HotmartPurchaseData = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  productId: string | null;
  productName: string | null;
  planId: string | null;
  planName: string | null;
  offerCode: string | null;
  planKey: 'monthly' | 'annual' | null;
  subscriberCode: string | null;
  transaction: string | null;
  status: string;
  purchaseDate: string | null;
  cancellationDate: string | null;
  nextBilling: string | null;
  trial: boolean;
  amount: number | null;
  currency: string | null;
};

export function purchaseData(payload: Json, eventOverride?: string): HotmartPurchaseData {
  const data = (payload.data && typeof payload.data === 'object' ? payload.data : payload) as Json;
  const buyer = (data.buyer && typeof data.buyer === 'object' ? data.buyer : {}) as Json;
  const purchase = (data.purchase && typeof data.purchase === 'object' ? data.purchase : {}) as Json;
  const subscription = (data.subscription && typeof data.subscription === 'object' ? data.subscription : {}) as Json;
  const subscriptionPlan = (subscription.plan && typeof subscription.plan === 'object' ? subscription.plan : {}) as Json;
  const product = (data.product && typeof data.product === 'object' ? data.product : {}) as Json;
  const price = (purchase.price && typeof purchase.price === 'object' ? purchase.price : {}) as Json;
  const offer = (purchase.offer && typeof purchase.offer === 'object' ? purchase.offer : {}) as Json;
  const email = String(buyer.email ?? data.email ?? '').trim().toLowerCase();
  const offerCode = stringValue(offer.code ?? data.offer_code);
  const subscriberCode = stringValue(at(subscription, ['subscriber', 'code']) ?? subscription.subscriber_code ?? data.subscriber_code);
  const transaction = stringValue(purchase.transaction ?? data.transaction);
  const purchaseDate = dateValue(purchase.approved_date ?? purchase.date ?? purchase.purchase_date ?? purchase.order_date ?? data.purchase_date ?? data.order_date);
  const nextBilling = dateValue(purchase.date_next_charge ?? subscription.date_next_charge ?? subscription.next_charge_date ?? data.date_next_charge);
  const cancellationDate = dateValue(data.cancellation_date ?? purchase.cancellation_date ?? subscription.cancellation_date ?? subscription.date_cancellation);
  const status = String(purchase.status ?? subscription.status ?? payload.event ?? 'unknown').toLowerCase();
  const event = String(eventOverride ?? payload.event ?? '').toUpperCase();
  const amount = price.value != null ? Number(price.value) : null;
  const explicitTrial = [subscription.trial_period, subscription.trial, purchase.trial, data.trial, purchase.is_trial, subscription.is_trial].some(booleanValue);
  const grantEvent = event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE';
  const config = planConfig(planForHotmartOffer(offerCode));
  const inferredTrial = Boolean(config && grantEvent && config.trialDays > 0 && amount === 0 && nextBilling && new Date(nextBilling).getTime() > Date.now());
  const trial = grantEvent && amount !== null && amount > 0 ? false : Boolean(config && (explicitTrial || inferredTrial));
  return {
    email,
    firstName: stringValue(buyer.first_name ?? buyer.name?.toString().split(/\s+/)[0]),
    lastName: stringValue(buyer.last_name),
    productId: stringValue(product.id),
    productName: stringValue(product.name),
    planId: stringValue(subscriptionPlan.id ?? (data.plan && typeof data.plan === 'object' ? (data.plan as Json).id : null)),
    planName: stringValue(subscriptionPlan.name ?? (data.plan && typeof data.plan === 'object' ? (data.plan as Json).name : null)),
    offerCode,
    planKey: planForHotmartOffer(offerCode),
    subscriberCode,
    transaction,
    status,
    purchaseDate,
    cancellationDate,
    nextBilling,
    trial,
    amount: Number.isFinite(amount) ? amount : null,
    currency: stringValue(price.currency_value ?? price.currency_code),
  };
}

async function ensureUser(admin: SupabaseClient, input: HotmartPurchaseData) {
  type UserRecord = { id: string; user_metadata: Record<string, unknown> | null };
  let user: UserRecord | null = null;
  for (let page = 1; page <= 20 && !user; page += 1) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (listed.error) throw new Error('hotmart_user_lookup_failed');
    user = (listed.data.users.find(candidate => candidate.email?.toLowerCase() === input.email) as UserRecord | undefined) ?? null;
    if (listed.data.users.length < 1000) break;
  }
  if (!user) {
    const created = await admin.auth.admin.createUser({ email: input.email, password: randomBytes(32).toString('hex'), email_confirm: true, user_metadata: { first_name: input.firstName, last_name: input.lastName, must_set_password: true, account_status: 'pending_activation' } });
    if (created.error || !created.data.user) throw new Error('hotmart_user_create_failed');
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...(user.user_metadata ?? {}), first_name: input.firstName ?? user.user_metadata?.first_name, last_name: input.lastName ?? user.user_metadata?.last_name, must_set_password: true, account_status: 'pending_activation' } });
    if (updated.error) throw new Error('hotmart_user_update_failed');
  }
  const profile: Json = { id: user.id, account_status: 'pending_activation', must_set_password: true };
  if (input.firstName) profile.first_name = input.firstName;
  if (input.lastName) profile.last_name = input.lastName;
  const { error: profileError } = await admin.from('profiles').upsert(profile, { onConflict: 'id' });
  if (profileError) throw new Error('hotmart_profile_create_failed');
  return user.id;
}

async function findExistingUser(admin: SupabaseClient, input: HotmartPurchaseData) {
  if (input.subscriberCode) {
    const result = await admin.from('subscriptions').select('user_id').eq('provider', 'hotmart').eq('provider_subscription_id', input.subscriberCode).maybeSingle();
    if (result.error) throw new Error('hotmart_subscription_lookup_failed');
    if (result.data?.user_id) return result.data.user_id as string;
  }
  if (input.transaction) {
    const result = await admin.from('subscriptions').select('user_id').eq('provider', 'hotmart').eq('purchase_transaction', input.transaction).maybeSingle();
    if (result.error) throw new Error('hotmart_transaction_lookup_failed');
    if (result.data?.user_id) return result.data.user_id as string;
  }
  if (input.email) {
    const result = await admin.from('hotmart_entitlements').select('user_id').eq('provider', 'hotmart').ilike('buyer_email', input.email).not('user_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (result.error) throw new Error('hotmart_entitlement_lookup_failed');
    if (result.data?.user_id) return result.data.user_id as string;
  }
  return null;
}

async function upsertSubscription(admin: SupabaseClient, userId: string, input: HotmartPurchaseData, event: string) {
  if (!input.subscriberCode) return;
  const isGrant = event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE';
  const isCancellation = event === 'SUBSCRIPTION_CANCELLATION' || event === 'PURCHASE_CANCELED';
  const status = isGrant ? input.trial ? 'trialing' : 'active' : isCancellation ? 'canceled' : event === 'PURCHASE_DELAYED' ? 'past_due' : event === 'PURCHASE_REFUNDED' ? 'refunded' : event === 'PURCHASE_CHARGEBACK' ? 'chargeback' : 'expired';
  const config = planConfig(input.planKey);
  const values: Json = { user_id: userId, provider: 'hotmart', provider_subscription_id: input.subscriberCode, provider_product_id: input.productId, provider_product_name: input.productName, provider_plan_id: input.planId, plan_key: input.planKey, plan_name: config?.displayName ?? input.planName, status, trial: input.trial, next_billing_at: input.nextBilling, current_period_end: input.nextBilling, access_until: isCancellation ? input.nextBilling : null, canceled_at: isCancellation ? input.cancellationDate : null, cancel_requested_at: isCancellation ? input.cancellationDate : null, trial_started_at: isGrant && input.trial ? input.purchaseDate : null, trial_ends_at: isGrant && input.trial ? input.nextBilling : null, subscriber_code: input.subscriberCode, purchase_transaction: input.transaction, purchase_status: input.status, currency: config?.currency ?? input.currency, amount: input.amount };
  const existing = await admin.from('subscriptions').select('id').eq('provider', 'hotmart').eq('provider_subscription_id', input.subscriberCode).maybeSingle();
  if (existing.error) throw new Error('hotmart_subscription_lookup_failed');
  const result = existing.data?.id ? await admin.from('subscriptions').update(values).eq('id', existing.data.id) : await admin.from('subscriptions').insert(values);
  if (result.error) throw new Error('hotmart_subscription_save_failed');
}

async function updateExistingLifecycle(admin: SupabaseClient, userId: string, input: HotmartPurchaseData, event: string) {
  const status = event === 'PURCHASE_REFUNDED' ? 'refunded' : event === 'PURCHASE_CHARGEBACK' ? 'chargeback' : event === 'PURCHASE_EXPIRED' ? 'expired' : event === 'PURCHASE_DELAYED' ? 'past_due' : 'canceled';
  const entitlementId = input.subscriberCode || input.transaction;
  let entitlementQuery = admin.from('hotmart_entitlements').update({ status, metadata: { event, provider_status: input.status } }).eq('provider', 'hotmart');
  entitlementQuery = entitlementId ? entitlementQuery.eq('provider_entitlement_id', entitlementId) : entitlementQuery.eq('user_id', userId);
  const entitlementResult = await entitlementQuery;
  if (entitlementResult.error) throw new Error('hotmart_entitlement_update_failed');
  await upsertSubscription(admin, userId, input, event);
}

export async function processHotmartEvent(admin: SupabaseClient, payload: Json, origin: string) {
  void origin;
  const event = String(payload.event ?? 'unknown').toUpperCase();
  const eventId = hotmartEventId(payload);
  const inserted = await admin.from('hotmart_webhook_events').insert({ event_id: eventId, event_type: event, payload, status: 'received' }).select('id').maybeSingle();
  if (inserted.error?.code === '23505') return { duplicate: true, eventId };
  if (inserted.error || !inserted.data) throw new Error('hotmart_event_save_failed');
  const data = purchaseData(payload, event);
  const grantEvents = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
  const lifecycleEvents = new Set(['PURCHASE_CANCELED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_EXPIRED', 'PURCHASE_DELAYED', 'SUBSCRIPTION_CANCELLATION']);
  try {
    if ((grantEvents.has(event) || lifecycleEvents.has(event)) && !data.planKey) {
      await admin.from('hotmart_webhook_events').update({ status: 'ignored', processed_at: new Date().toISOString(), error: 'offer_not_allowed' }).eq('id', inserted.data.id);
      return { duplicate: false, ignored: true, eventId };
    }
    if (grantEvents.has(event)) {
      if (!data.email) throw new Error('hotmart_buyer_email_missing');
      const entitlementId = data.subscriberCode || data.transaction || eventId;
      const existing = await admin.from('hotmart_entitlements').select('status').eq('provider', 'hotmart').eq('provider_entitlement_id', entitlementId).maybeSingle();
      if (existing.error) throw new Error('hotmart_entitlement_lookup_failed');
      if (['refunded', 'chargeback'].includes(String(existing.data?.status ?? '').toLowerCase())) {
        await admin.from('hotmart_webhook_events').update({ status: 'ignored', processed_at: new Date().toISOString(), error: 'stale_access_grant' }).eq('id', inserted.data.id);
        return { duplicate: false, ignored: true, eventId };
      }
      const userId = await ensureUser(admin, data);
      const entitlementStatus = data.trial ? 'trialing' : event === 'PURCHASE_APPROVED' ? 'pending_activation' : 'active';
      const entitlement = await admin.from('hotmart_entitlements').upsert({ provider: 'hotmart', provider_entitlement_id: entitlementId, buyer_email: data.email, first_name: data.firstName, user_id: userId, plan_key: data.planKey, plan_name: data.planName, status: entitlementStatus, metadata: payload }, { onConflict: 'provider,provider_entitlement_id' });
      if (entitlement.error) throw new Error('hotmart_entitlement_save_failed');
      await upsertSubscription(admin, userId, data, event);
    } else if (lifecycleEvents.has(event)) {
      const userId = await findExistingUser(admin, data);
      if (userId) await updateExistingLifecycle(admin, userId, data, event);
    }
    const processed = await admin.from('hotmart_webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', inserted.data.id);
    if (processed.error) throw new Error('hotmart_event_update_failed');
    return { duplicate: false, eventId };
  } catch (error) {
    await admin.from('hotmart_webhook_events').update({ status: 'failed', error: error instanceof Error ? error.message : 'hotmart_processing_failed' }).eq('id', inserted.data.id);
    throw error;
  }
}

export class HotmartCancellationError extends Error {
  readonly code: 'hotmart_not_configured' | 'hotmart_auth_failed' | 'hotmart_cancel_failed';
  readonly stage: 'config' | 'token' | 'cancel';
  readonly providerStatus?: number;
  readonly providerCode?: string;
  constructor(code: 'hotmart_not_configured' | 'hotmart_auth_failed' | 'hotmart_cancel_failed', stage: 'config' | 'token' | 'cancel', providerStatus?: number, providerCode?: string) {
    super(code);
    this.code = code;
    this.stage = stage;
    this.providerStatus = providerStatus;
    this.providerCode = providerCode;
  }
}

function providerCode(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const value = (body as Record<string, unknown>).code ?? (body as Record<string, unknown>).error ?? (body as Record<string, unknown>).error_code;
  return typeof value === 'string' ? value.slice(0, 80) : null;
}

function responseHasInactiveStatus(body: unknown) {
  return Boolean(body && typeof body === 'object' && String((body as Record<string, unknown>).status || '').toUpperCase() === 'INACTIVE');
}

function responseLooksAlreadyCanceled(body: unknown) {
  const text = JSON.stringify(body || '').toLowerCase();
  return text.includes('already') && (text.includes('cancel') || text.includes('inactive'));
}

export async function cancelHotmartSubscription(subscriberCode: string, fetchImpl: typeof fetch = fetch) {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basic = process.env.HOTMART_BASIC;
  if (!clientId || !clientSecret || !basic) throw new HotmartCancellationError('hotmart_not_configured', 'config');

  const tokenUrl = new URL('https://api-sec-vlc.hotmart.com/security/oauth/token');
  tokenUrl.searchParams.set('grant_type', 'client_credentials');
  tokenUrl.searchParams.set('client_id', clientId);
  tokenUrl.searchParams.set('client_secret', clientSecret);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetchImpl(tokenUrl, { method: 'POST', headers: { authorization: `Basic ${basic}`, 'content-type': 'application/json' } });
  } catch {
    throw new HotmartCancellationError('hotmart_auth_failed', 'token');
  }
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof tokenBody?.access_token !== 'string') throw new HotmartCancellationError('hotmart_auth_failed', 'token', tokenResponse.status, providerCode(tokenBody) ?? undefined);

  const cancellationUrl = `https://developers.hotmart.com/payments/api/v1/subscriptions/${encodeURIComponent(subscriberCode)}/cancel`;
  let response: Response;
  try {
    response = await fetchImpl(cancellationUrl, { method: 'POST', headers: { authorization: `Bearer ${tokenBody.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ send_mail: false }) });
  } catch {
    throw new HotmartCancellationError('hotmart_cancel_failed', 'cancel');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (responseLooksAlreadyCanceled(body)) return { status: 'INACTIVE', alreadyCanceled: true, response: body };
    throw new HotmartCancellationError('hotmart_cancel_failed', 'cancel', response.status, providerCode(body) ?? undefined);
  }
  if (!responseHasInactiveStatus(body)) throw new HotmartCancellationError('hotmart_cancel_failed', 'cancel', response.status, providerCode(body) ?? 'unexpected_status');
  return { status: 'INACTIVE', alreadyCanceled: false, response: body };
}
