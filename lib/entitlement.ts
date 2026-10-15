export type EntitlementSnapshot = {
  status?: string | null;
  trial?: boolean | null;
  access_until?: string | null;
  trial_ends_at?: string | null;
};

const terminalStatuses = new Set(['canceled', 'cancelled', 'refunded', 'chargeback', 'expired']);

/** Returns only an explicitly supported entitlement date, never a billing date. */
export function confirmedEntitlementAccessUntil(subscription: EntitlementSnapshot | null | undefined) {
  const status = String(subscription?.status ?? '').toLowerCase();
  if (!subscription || terminalStatuses.has(status)) return null;
  if (status === 'trialing' && subscription.trial && subscription.trial_ends_at) return subscription.trial_ends_at;
  if (status === 'active' && subscription.access_until) return subscription.access_until;
  return null;
}
