import type { SupabaseClient } from '@supabase/supabase-js';
import { intentionLabel, validCustomIntention } from '@/lib/intention';
import { contextVersion, legacyContextVersion } from '@/lib/recurrent-daily';
import { dateForPreparedNext, localDate, nextPsychologicalDeliveryDate, type ScheduleProfile } from './whatsapp-schedule';
import { recordEvent } from './operational-observability';

export type SchedulingProfile = ScheduleProfile & {
  id: string;
  onboarding_completed?: boolean | null;
  whatsapp_enabled?: boolean | null;
  direction_key?: string | null;
  direction_text?: string | null;
  desired_change_original?: string | null;
  current_context_original?: string | null;
  current_context_summary?: string | null;
  current_context_domain?: string | null;
  communication_preference?: string | null;
  voice_style?: string | null;
  desired_change_concepts?: string[] | null;
};

function profileContentVersion(profile: SchedulingProfile) {
  const storedGoal = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const goal = validCustomIntention(storedGoal) ? storedGoal : intentionLabel(profile.direction_key ?? '') ?? '';
  const context = (profile.current_context_original || profile.current_context_summary || '').trim();
  return {
    current: contextVersion(context, goal, { communicationPreference: profile.communication_preference, voiceStyle: profile.voice_style, contextDomain: profile.current_context_domain, concepts: profile.desired_change_concepts }),
    legacy: legacyContextVersion(context, goal),
  };
}

function changedSchedulingValue(previous: SchedulingProfile, next: SchedulingProfile) {
  return previous.message_time_1 !== next.message_time_1 || previous.message_time_2 !== next.message_time_2 || previous.message_frequency !== next.message_frequency || previous.timezone !== next.timezone;
}

export async function inspectUserDeliverySchedule(admin: SupabaseClient, previous: SchedulingProfile, next: SchedulingProfile, now = new Date()) {
  if (!changedSchedulingValue(previous, next)) return { changed: false, nextEffectiveLocalDate: null, status: 'unchanged' as const };
  const today = localDate(next.timezone, now);
  const [{ data: todayInteraction, error: interactionError }, { data: todayDeliveries, error: deliveryError }, { data: activeNext, error: nextError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', next.id).eq('interaction_type', 'daily_message').eq('local_date', today).limit(1).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id,status').eq('user_id', next.id).eq('local_date', today),
    admin.from('approved_intervention_buffer').select('id,intended_local_date,status,context_version,created_at').eq('user_id', next.id).in('status', ['approved', 'buffered']).order('intended_local_date', { ascending: true }).order('created_at', { ascending: true }),
  ]);
  if (interactionError || deliveryError || nextError) throw new Error('schedule_state_unavailable');

  const alreadyDeliveredToday = (todayDeliveries ?? []).some(row => row.status === 'sent');
  const dailyInteractionToday = Boolean(todayInteraction);
  const preparationDate = nextPsychologicalDeliveryDate(next, now, { alreadyDeliveredToday, dailyInteractionToday });
  const versions = profileContentVersion(next);
  const compatibleVersions = new Set([versions.current, ...(next.communication_preference === 'adaptive' && !next.voice_style ? [versions.legacy] : [])]);
  const reusableNext = (activeNext ?? []).find(row => compatibleVersions.has(row.context_version));
  const nextEffectiveLocalDate = reusableNext && !dailyInteractionToday
    ? dateForPreparedNext(next, now, alreadyDeliveredToday)
    : preparationDate;
  let rescheduled = false;
  if (reusableNext && !dailyInteractionToday && reusableNext.intended_local_date !== nextEffectiveLocalDate) {
    const { error: rescheduleError } = await admin.from('approved_intervention_buffer').update({ intended_local_date: nextEffectiveLocalDate }).eq('id', reusableNext.id).in('status', ['approved', 'buffered']);
    if (rescheduleError) throw new Error('schedule_reschedule_failed');
    rescheduled = true;
    await recordEvent(admin, { userId: next.id, eventType: 'next_intervention_rescheduled', entityType: 'approved_intervention_buffer', entityId: reusableNext.id, metadata: { from_local_date: reusableNext.intended_local_date, to_local_date: nextEffectiveLocalDate, old_message_time: previous.message_time_1, new_message_time: next.message_time_1, content_version: versions.current, reused: true, reason: 'schedule_only_change' } });
  }
  await recordEvent(admin, { userId: next.id, eventType: 'schedule_changed', entityType: 'profile', metadata: { old_message_time: previous.message_time_1, new_message_time: next.message_time_1, timezone: next.timezone, local_date: today, already_delivered_today: alreadyDeliveredToday, next_effective_local_date: nextEffectiveLocalDate } });

  if (alreadyDeliveredToday) {
    await recordEvent(admin, { userId: next.id, eventType: 'same_day_delivery_preserved', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1 } });
  }
  if (nextEffectiveLocalDate !== today) {
    await recordEvent(admin, { userId: next.id, eventType: 'schedule_effective_next_day', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1, already_delivered_today: alreadyDeliveredToday } });
  }

  await recordEvent(admin, { userId: next.id, eventType: 'schedule_reconciliation_pending', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, already_delivered_today: alreadyDeliveredToday, daily_interaction_today: dailyInteractionToday, next_reused: Boolean(reusableNext), next_rescheduled: rescheduled } });
  return { changed: true, nextEffectiveLocalDate, status: rescheduled ? 'reused_next_rescheduled' as const : 'pending_buffer_reconciliation' as const };
}
