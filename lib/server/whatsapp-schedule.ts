export function localDate(timezone: string | null | undefined, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function localClock(timezone: string | null | undefined, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  return { hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0), minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0), date: localDate(timezone, now) };
}

export type ScheduleProfile = { timezone: string | null; message_frequency: number | null; message_time_1: string | null; message_time_2: string | null };

export type DailyDeliveryState = { alreadyDeliveredToday: boolean; dailyInteractionToday: boolean };

export const SCHEDULE_PREPARATION_MINUTES = 15;
export const REFILL_CRON_INTERVAL_MINUTES = 15;

function nextRefillOpportunityMinutes(currentMinutes: number) {
  return (Math.floor(currentMinutes / REFILL_CRON_INTERVAL_MINUTES) + 1) * REFILL_CRON_INTERVAL_MINUTES;
}

export function addLocalDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function nextPsychologicalDeliveryDate(profile: Pick<ScheduleProfile, 'timezone' | 'message_time_1'>, now = new Date(), state: DailyDeliveryState = { alreadyDeliveredToday: false, dailyInteractionToday: false }, preparationMinutes = SCHEDULE_PREPARATION_MINUTES) {
  const clock = localClock(profile.timezone, now);
  if (state.alreadyDeliveredToday) return addLocalDays(clock.date, 1);
  const [hour, minute] = String(profile.message_time_1 || '').split(':').map(Number);
  const selectedMinutes = hour * 60 + minute;
  const currentMinutes = clock.hour * 60 + clock.minute;
  const nextRefillMinutes = nextRefillOpportunityMinutes(currentMinutes);
  const minimumPreparationMinutes = Math.max(currentMinutes + preparationMinutes, nextRefillMinutes + preparationMinutes);
  if (Number.isInteger(hour) && Number.isInteger(minute) && selectedMinutes >= minimumPreparationMinutes) return clock.date;
  if (state.dailyInteractionToday && Number.isInteger(hour) && Number.isInteger(minute) && selectedMinutes > currentMinutes) return clock.date;
  return addLocalDays(clock.date, 1);
}

export function dueSlots(profile: ScheduleProfile, now = new Date()) {
  const clock = localClock(profile.timezone, now);
  const configured = [profile.message_time_1, profile.message_frequency === 2 ? profile.message_time_2 : null].filter((value): value is string => Boolean(value));
  return configured.map((value, index) => ({ value, slot: String(index + 1) })).filter(({ value }) => {
    const [hour, minute] = value.split(':').map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;
    const currentMinutes = clock.hour * 60 + clock.minute;
    const scheduledMinutes = hour * 60 + minute;
    return currentMinutes >= scheduledMinutes && currentMinutes < scheduledMinutes + 15;
  }).map(({ slot }) => ({ slot, localDate: clock.date }));
}

export function firstPsychologicalLocalDate(timezone: string | null | undefined, selectedTime: string | null | undefined, now = new Date(), preparationMinutes = 15) {
  const clock = localClock(timezone, now);
  const [hour, minute] = String(selectedTime || '').split(':').map(Number);
  const selectedMinutes = hour * 60 + minute;
  const currentMinutes = clock.hour * 60 + clock.minute;
  if (Number.isInteger(hour) && Number.isInteger(minute) && selectedMinutes >= currentMinutes + preparationMinutes) return clock.date;
  return localDate(timezone, new Date(now.getTime() + 86_400_000));
}
