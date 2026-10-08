import type { SupabaseClient } from '@supabase/supabase-js';
import { localDate, nextPsychologicalDeliveryDate, type ScheduleProfile } from './whatsapp-schedule';
import { recordEvent } from './operational-observability';

export type SchedulingProfile = ScheduleProfile & {
  id: string;
  onboarding_completed?: boolean | null;
  whatsapp_enabled?: boolean | null;
};

function changedSchedulingValue(previous: SchedulingProfile, next: SchedulingProfile) {
  return previous.message_time_1 !== next.message_time_1 || previous.message_time_2 !== next.message_time_2 || previous.message_frequency !== next.message_frequency || previous.timezone !== next.timezone;
}

export async function inspectUserDeliverySchedule(admin: SupabaseClient, previous: SchedulingProfile, next: SchedulingProfile, now = new Date()) {
  if (!changedSchedulingValue(previous, next)) return { changed: false, nextEffectiveLocalDate: null, status: 'unchanged' as const };
  const today = localDate(next.timezone, now);
  const [{ data: todayInteraction, error: interactionError }, { data: todayDelivery, error: deliveryError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', next.id).eq('interaction_type', 'daily_message').eq('local_date', today).limit(1).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id,status').eq('user_id', next.id).eq('local_date', today).eq('status', 'sent').limit(1).maybeSingle(),
  ]);
  if (interactionError || deliveryError) throw new Error('schedule_state_unavailable');

  const alreadyDeliveredToday = Boolean(todayDelivery);
  const dailyInteractionToday = Boolean(todayInteraction);
  const nextEffectiveLocalDate = nextPsychologicalDeliveryDate(next, now, { alreadyDeliveredToday, dailyInteractionToday });
  await recordEvent(admin, { userId: next.id, eventType: 'schedule_changed', entityType: 'profile', metadata: { old_message_time: previous.message_time_1, new_message_time: next.message_time_1, timezone: next.timezone, local_date: today, already_delivered_today: alreadyDeliveredToday, next_effective_local_date: nextEffectiveLocalDate } });

  if (alreadyDeliveredToday) {
    await recordEvent(admin, { userId: next.id, eventType: 'same_day_delivery_preserved', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1 } });
  }
  if (nextEffectiveLocalDate !== today) {
    await recordEvent(admin, { userId: next.id, eventType: 'schedule_effective_next_day', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1, already_delivered_today: alreadyDeliveredToday } });
  }

  await recordEvent(admin, { userId: next.id, eventType: 'schedule_reconciliation_pending', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, already_delivered_today: alreadyDeliveredToday, daily_interaction_today: dailyInteractionToday } });
  return { changed: true, nextEffectiveLocalDate, status: 'pending_buffer_reconciliation' as const };
}
