import type { SupabaseClient } from '@supabase/supabase-js';
import { contextVersion } from '@/lib/recurrent-daily';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { localDate, nextPsychologicalDeliveryDate, configuredTimeMinutes } from '@/lib/server/whatsapp-schedule';
import { preferredAddressName } from '@/lib/profile-name';

export type NextMessageHealthStatus = 'ok' | 'fail';
export type NextMessageHealth = {
  status: NextMessageHealthStatus;
  code: string;
  userId: string;
  expectedLocalDate: string | null;
  scheduledLocalTime: string | null;
  timezone: string | null;
  activeNextCount: number;
  bufferId: string | null;
  bufferStatus: string | null;
  intendedLocalDate: string | null;
  contentVersionCurrent: boolean | null;
  deliveryTodayStatus: string | null;
  latestRefillStatus: string | null;
  latestFailureCode: string | null;
};

type ProfileRow = {
  id: string;
  account_status: string | null;
  whatsapp_enabled: boolean | null;
  timezone: string | null;
  message_time_1: string | null;
  preferred_name?: string | null;
  first_name?: string | null;
  current_context_original?: string | null;
  desired_change_original?: string | null;
  communication_preference?: string | null;
  voice_style?: string | null;
  current_context_domain?: string | null;
  desired_change_concepts?: unknown;
};

type BufferRow = { id: string; user_id: string; intended_local_date: string; status: string; context_version: string; message: string; created_at: string; plan?: Record<string, unknown> };

const eligibleStatuses = new Set(['active', 'trialing']);

function effectiveSubscription(rows: Array<{ user_id: string; status: string; created_at?: string; updated_at?: string }>, userId: string) {
  return rows.filter(row => row.user_id === userId).sort((a, b) => String(b.updated_at ?? b.created_at ?? '').localeCompare(String(a.updated_at ?? a.created_at ?? '')))[0] ?? null;
}

function currentContentVersion(profile: ProfileRow) {
  return contextVersion(profile.current_context_original ?? '', profile.desired_change_original ?? '', {
    communicationPreference: profile.communication_preference,
    voiceStyle: profile.voice_style,
    contextDomain: profile.current_context_domain,
    concepts: Array.isArray(profile.desired_change_concepts) ? profile.desired_change_concepts.filter((value): value is string => typeof value === 'string') : [],
  });
}

function baseHealth(userId: string, profile: ProfileRow | null): NextMessageHealth {
  return { status: 'fail', code: profile ? 'next_not_ready' : 'profile_missing', userId, expectedLocalDate: null, scheduledLocalTime: profile?.message_time_1 ?? null, timezone: profile?.timezone ?? null, activeNextCount: 0, bufferId: null, bufferStatus: null, intendedLocalDate: null, contentVersionCurrent: null, deliveryTodayStatus: null, latestRefillStatus: null, latestFailureCode: null };
}

export async function buildNextMessageHealthSummary(admin: SupabaseClient, userIds: string[], now = new Date()) {
  const ids = [...new Set(userIds)].filter(Boolean);
  const [profilesResult, subscriptionsResult, connectionsResult, buffersResult, deliveriesResult, runsResult, eventsResult] = await Promise.all([
    ids.length ? admin.from('profiles').select('id,account_status,whatsapp_enabled,timezone,message_time_1,preferred_name,first_name,current_context_original,desired_change_original,communication_preference,voice_style,current_context_domain,desired_change_concepts').in('id', ids) : { data: [], error: null },
    ids.length ? admin.from('subscriptions').select('user_id,status,created_at,updated_at').in('user_id', ids) : { data: [], error: null },
    ids.length ? admin.from('whatsapp_connections').select('user_id,status,wa_id').in('user_id', ids) : { data: [], error: null },
    ids.length ? admin.from('approved_intervention_buffer').select('id,user_id,intended_local_date,status,context_version,message,created_at,plan').in('user_id', ids).in('status', ['approved', 'buffered']) : { data: [], error: null },
    ids.length ? admin.from('whatsapp_daily_deliveries').select('user_id,local_date,status,last_error,updated_at').in('user_id', ids).order('updated_at', { ascending: false }) : { data: [], error: null },
    ids.length ? admin.from('execution_runs').select('user_id,status,failure_code,started_at,execution_context').in('user_id', ids).eq('execution_context', 'production').order('started_at', { ascending: false }) : { data: [], error: null },
    ids.length ? admin.from('event_log').select('user_id,event_type,metadata,occurred_at').in('user_id', ids).in('event_type', ['refill_failed', 'next_message_not_ready', 'next_intervention_prepared', 'next_intervention_valid']).order('occurred_at', { ascending: false }) : { data: [], error: null },
  ]);
  if ([profilesResult, subscriptionsResult, connectionsResult, buffersResult, deliveriesResult, runsResult, eventsResult].some(result => result.error)) throw new Error('next_message_health_unavailable');
  const profiles = new Map((profilesResult.data ?? []).map(row => [row.id, row as ProfileRow]));
  const subscriptions = subscriptionsResult.data ?? [];
  const connections = new Map((connectionsResult.data ?? []).map(row => [row.user_id, row]));
  const buffers = buffersResult.data as BufferRow[];
  const deliveries = deliveriesResult.data ?? [];
  const runs = runsResult.data ?? [];
  const events = eventsResult.data ?? [];
  const result = new Map<string, NextMessageHealth>();
  for (const userId of ids) {
    const profile = profiles.get(userId) ?? null;
    const health = baseHealth(userId, profile);
    const subscription = effectiveSubscription(subscriptions, userId);
    const connection = connections.get(userId);
    const active = buffers.filter(row => row.user_id === userId).sort((a, b) => a.intended_local_date.localeCompare(b.intended_local_date) || a.created_at.localeCompare(b.created_at));
    const today = profile ? localDate(profile.timezone, now) : null;
    const todayDelivery = deliveries.find(row => row.user_id === userId && row.local_date === today);
    const latestRun = runs.find(row => row.user_id === userId);
    const latestEvent = events.find(row => row.user_id === userId && row.event_type === 'refill_failed');
    health.activeNextCount = active.length;
    health.deliveryTodayStatus = todayDelivery?.status ?? null;
    health.latestRefillStatus = latestRun?.status ?? null;
    health.latestFailureCode = latestRun?.failure_code ?? (todayDelivery?.last_error ?? null) ?? (latestEvent ? String((latestEvent.metadata as Record<string, unknown> | null)?.reason ?? latestEvent.event_type) : null);
    const eligible = Boolean(profile && profile.account_status === 'active' && subscription && eligibleStatuses.has(subscription.status) && configuredTimeMinutes(profile.message_time_1) && profile.whatsapp_enabled && connection?.status === 'connected' && connection.wa_id);
    if (!profile || profile.account_status !== 'active' || !subscription || !eligibleStatuses.has(subscription.status)) health.code = 'subscription_not_eligible';
    else if (!configuredTimeMinutes(profile.message_time_1)) health.code = 'invalid_schedule';
    else if (!profile.whatsapp_enabled || connection?.status !== 'connected' || !connection.wa_id) health.code = 'whatsapp_disconnected';
    else if (active.length > 1) health.code = 'multiple_active_next';
    else if (!active.length) health.code = 'missing_next';
    const next = active[0];
    if (next) {
      health.bufferId = next.id;
      health.bufferStatus = next.status;
      health.intendedLocalDate = next.intended_local_date;
      health.expectedLocalDate = next.intended_local_date;
      health.contentVersionCurrent = next.context_version === currentContentVersion(profile!);
      if (eligible && active.length === 1) {
        if (!health.contentVersionCurrent) health.code = 'stale_context_version';
        if (todayDelivery?.status === 'failed') health.code = 'delivery_failed';
        if (todayDelivery?.status && ['pending', 'locked', 'claimed'].includes(todayDelivery.status) && todayDelivery.local_date === today) health.code = 'dependency_not_delivered';
      }
    } else if (profile) {
      health.expectedLocalDate = nextPsychologicalDeliveryDate(profile, now, { alreadyDeliveredToday: todayDelivery?.status === 'sent', dailyInteractionToday: Boolean(todayDelivery) });
    }
    if (eligible && health.code === 'next_not_ready' && next && health.contentVersionCurrent && active.length === 1 && todayDelivery?.status !== 'failed' && !['pending', 'locked', 'claimed'].includes(todayDelivery?.status ?? '')) {
      health.code = 'next_ready';
      health.status = 'ok';
    }
    result.set(userId, health);
  }
  return result;
}

function scheduledInstant(localDateValue: string, localTime: string | null, timezone: string | null) {
  const [year, month, day] = localDateValue.split('-').map(Number);
  const [hour, minute] = String(localTime ?? '00:00').split(':').map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour || 0, minute || 0));
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(guess);
  const actual = Date.UTC(Number(parts.find(part => part.type === 'year')?.value), Number(parts.find(part => part.type === 'month')?.value) - 1, Number(parts.find(part => part.type === 'day')?.value), Number(parts.find(part => part.type === 'hour')?.value), Number(parts.find(part => part.type === 'minute')?.value));
  return new Date(guess.getTime() + (guess.getTime() - actual));
}

export async function getNextMessageHealthDetail(admin: SupabaseClient, userId: string, now = new Date()) {
  const summary = (await buildNextMessageHealthSummary(admin, [userId], now)).get(userId) ?? baseHealth(userId, null);
  const [{ data: profile }, { data: buffer }, { data: events }, { data: execution }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
    summary.bufferId ? admin.from('approved_intervention_buffer').select('*').eq('id', summary.bufferId).maybeSingle() : { data: null },
    admin.from('event_log').select('event_type,metadata,occurred_at,execution_run_id').eq('user_id', userId).order('occurred_at', { ascending: false }).limit(3),
    admin.from('execution_runs').select('id,status,failure_code,started_at,completed_at').eq('user_id', userId).eq('execution_context', 'production').order('started_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  let preview: string | null = null;
  if (summary.status === 'ok' && buffer && profile) {
    preview = composeNiaMessage({ content: buffer.message, firstName: preferredAddressName(profile), timezone: profile.timezone, userKey: userId, now: scheduledInstant(buffer.intended_local_date, profile.message_time_1, profile.timezone) });
  }
  return { health: summary, preview, diagnostics: { expectedDelivery: summary.expectedLocalDate && profile ? `${summary.expectedLocalDate} ${profile.message_time_1 ?? ''} ${profile.timezone ?? 'UTC'}` : null, latestEvents: events ?? [], latestExecution: execution ?? null, buffer: buffer ? { id: buffer.id, status: buffer.status, intended_local_date: buffer.intended_local_date, created_at: buffer.created_at, plan: buffer.plan } : null } };
}
