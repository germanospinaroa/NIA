export function localDate(timezone: string | null | undefined, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function localClock(timezone: string | null | undefined, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  return { hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0), minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0), date: localDate(timezone, now) };
}

export type ScheduleProfile = { timezone: string | null; message_frequency: number | null; message_time_1: string | null; message_time_2: string | null };

export function dueSlots(profile: ScheduleProfile, now = new Date()) {
  const clock = localClock(profile.timezone, now);
  const configured = [profile.message_time_1, profile.message_frequency === 2 ? profile.message_time_2 : null].filter((value): value is string => Boolean(value));
  return configured.filter(value => {
    const [hour, minute] = value.split(':').map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;
    const currentMinutes = clock.hour * 60 + clock.minute;
    const scheduledMinutes = hour * 60 + minute;
    return currentMinutes >= scheduledMinutes && currentMinutes < scheduledMinutes + 15;
  }).map(value => ({ slot: value, localDate: clock.date }));
}
