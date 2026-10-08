import type { SupabaseClient } from '@supabase/supabase-js';
import { addLocalDays, localDate, nextPsychologicalDeliveryDate, type ScheduleProfile } from './whatsapp-schedule';
import { refillApprovedBuffer, TARGET_BUFFER_DAYS } from './refill-approved-buffer';
import { recordEvent } from './operational-observability';

export type SchedulingProfile = ScheduleProfile & {
  id: string;
  onboarding_completed?: boolean | null;
  whatsapp_enabled?: boolean | null;
};

function changedSchedulingValue(previous: SchedulingProfile, next: SchedulingProfile) {
  return previous.message_time_1 !== next.message_time_1 || previous.message_time_2 !== next.message_time_2 || previous.message_frequency !== next.message_frequency || previous.timezone !== next.timezone;
}

export async function reconcileUserDeliverySchedule(admin: SupabaseClient, previous: SchedulingProfile, next: SchedulingProfile, now = new Date()) {
  if (!changedSchedulingValue(previous, next)) return { changed: false, nextEffectiveLocalDate: null, bufferPrepared: false };
  const today = localDate(next.timezone, now);
  const [{ data: todayInteraction, error: interactionError }, { data: todayDelivery, error: deliveryError }, { data: buffered, error: bufferError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', next.id).eq('interaction_type', 'daily_message').eq('local_date', today).limit(1).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id,status').eq('user_id', next.id).eq('local_date', today).eq('status', 'sent').limit(1).maybeSingle(),
    admin.from('approved_intervention_buffer').select('intended_local_date').eq('user_id', next.id).in('status', ['approved', 'buffered']),
  ]);
  if (interactionError || deliveryError || bufferError) throw new Error('schedule_state_unavailable');

  const alreadyDeliveredToday = Boolean(todayDelivery);
  const dailyInteractionToday = Boolean(todayInteraction);
  const nextEffectiveLocalDate = nextPsychologicalDeliveryDate(next, now, { alreadyDeliveredToday, dailyInteractionToday });
  const bufferDatesBefore = (buffered ?? []).map(row => String(row.intended_local_date));
  await recordEvent(admin, { userId: next.id, eventType: 'schedule_changed', entityType: 'profile', metadata: { old_message_time: previous.message_time_1, new_message_time: next.message_time_1, timezone: next.timezone, local_date: today, already_delivered_today: alreadyDeliveredToday, next_effective_local_date: nextEffectiveLocalDate, buffer_dates_before: bufferDatesBefore } });

  if (alreadyDeliveredToday) {
    await recordEvent(admin, { userId: next.id, eventType: 'same_day_delivery_preserved', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1 } });
  }
  if (nextEffectiveLocalDate !== today) {
    await recordEvent(admin, { userId: next.id, eventType: 'schedule_effective_next_day', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, new_message_time: next.message_time_1, already_delivered_today: alreadyDeliveredToday } });
  }

  const bufferStartDate = dailyInteractionToday && nextEffectiveLocalDate === today ? addLocalDays(today, 1) : nextEffectiveLocalDate;
  const requiredDateCovered = dailyInteractionToday && nextEffectiveLocalDate === today || bufferDatesBefore.includes(bufferStartDate);
  if (requiredDateCovered && bufferDatesBefore.length >= TARGET_BUFFER_DAYS) {
    await recordEvent(admin, { userId: next.id, eventType: 'schedule_reconciled', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, buffer_dates_before: bufferDatesBefore, buffer_dates_after: bufferDatesBefore, coverage_repaired: false } });
    return { changed: true, nextEffectiveLocalDate, bufferPrepared: false };
  }

  await recordEvent(admin, { userId: next.id, eventType: 'buffer_coverage_gap', entityType: 'approved_intervention_buffer', metadata: { local_date: today, required_local_date: bufferStartDate, buffer_dates_before: bufferDatesBefore } });
  const prepared = await refillApprovedBuffer(admin, next.id, { now, targetBufferDays: TARGET_BUFFER_DAYS, minBufferDays: 1, requiredLocalDate: bufferStartDate, refillStartDate: bufferStartDate, fillFromFirstIntendedDate: true, maxCostUsd: Number(process.env.REFILL_MAX_COST_USD || 0.03) });
  const bufferDatesAfter = [...bufferDatesBefore, ...prepared.created.map(item => item.intendedLocalDate)];
  await recordEvent(admin, { userId: next.id, eventType: prepared.created.some(item => item.intendedLocalDate === bufferStartDate) ? 'buffer_coverage_repaired' : 'schedule_reconciled', entityType: 'profile', metadata: { local_date: today, next_effective_local_date: nextEffectiveLocalDate, buffer_dates_before: bufferDatesBefore, buffer_dates_after: bufferDatesAfter, created: prepared.created.length, skipped: prepared.skipped.slice(0, 3) } });
  return { changed: true, nextEffectiveLocalDate, bufferPrepared: prepared.created.length > 0, created: prepared.created.length, skipped: prepared.skipped };
}
