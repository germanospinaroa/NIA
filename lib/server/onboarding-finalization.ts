import { localDate } from './whatsapp-schedule';

export function normalizeOnboardingSchedule<T extends { message_frequency?: number | null; message_time_2?: string | null }>(profile: T) {
  return { ...profile, message_frequency: 1, message_time_2: null };
}

export function chooseFirstIntendedLocalDate(input: { candidate: string; timezone: string; now: Date; occupied: boolean }) {
  if (!input.occupied) return input.candidate;
  return localDate(input.timezone, new Date(input.now.getTime() + 86_400_000));
}
