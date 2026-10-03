export type MessageSchedule = {
  message_frequency: number | null | undefined;
  message_time_1: string | null | undefined;
  message_time_2?: string | null | undefined;
  timezone: string | null | undefined;
};

export type NextMessageSlot = {
  time: string;
  isTomorrow: boolean;
};

function parseTime(value: string | null | undefined) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { value, minutes: hour * 60 + minute };
}

function localMinutes(timezone: string | null | undefined, now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  return Number(parts.find(part => part.type === 'hour')?.value ?? 0) * 60 + Number(parts.find(part => part.type === 'minute')?.value ?? 0);
}

export function formatMessageTime(value: string) {
  const [rawHour, rawMinute] = value.split(':').map(Number);
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`;
}

export function getNextMessageSlot(schedule: MessageSchedule, now = new Date()): NextMessageSlot | null {
  const slots = [parseTime(schedule.message_time_1), schedule.message_frequency === 2 ? parseTime(schedule.message_time_2) : null]
    .filter((slot): slot is { value: string; minutes: number } => Boolean(slot))
    .sort((left, right) => left.minutes - right.minutes);
  if (!slots.length) return null;
  const current = localMinutes(schedule.timezone, now);
  // At the exact minute the scheduler may already have claimed the slot;
  // without delivery state, prefer the next unambiguously future slot.
  const nextToday = slots.find(slot => slot.minutes > current);
  const next = nextToday ?? slots[0];
  return { time: formatMessageTime(next.value), isTomorrow: !nextToday };
}

export function formatNextMessageSlot(slot: NextMessageSlot | null) {
  if (!slot) return null;
  return slot.isTomorrow ? `mañana · ${slot.time}` : slot.time;
}
