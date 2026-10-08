import { addLocalDays, nextPsychologicalDeliveryDate, type ScheduleProfile } from '@/lib/server/whatsapp-schedule';

export type NextBufferStatus = 'approved' | 'buffered';

export type NextBufferCandidate = {
  id: string;
  intendedLocalDate: string;
  contextVersion: string;
  status: NextBufferStatus;
  createdAt: string;
};

export type DailyDeliveryLifecycle = 'none' | 'pending' | 'failed' | 'locked' | 'sent';

export type NextInterventionDecision = {
  action: 'preserve' | 'reschedule' | 'invalidate_and_prepare' | 'prepare' | 'wait_for_delivery';
  targetLocalDate: string | null;
  keepId: string | null;
  invalidateIds: string[];
  reason: string;
};

export function chooseNextIntervention(input: {
  today: string;
  schedule: Pick<ScheduleProfile, 'timezone' | 'message_time_1'>;
  now: Date;
  alreadyDeliveredToday: boolean;
  dailyInteractionToday: boolean;
  dailyDelivery: DailyDeliveryLifecycle;
  currentContentVersion: string;
  activeRows: NextBufferCandidate[];
  preparationDate?: string;
}) : NextInterventionDecision {
  const ordered = [...input.activeRows].sort((left, right) => left.intendedLocalDate.localeCompare(right.intendedLocalDate) || left.createdAt.localeCompare(right.createdAt));
  const currentRows = ordered.filter(row => row.contextVersion === input.currentContentVersion);
  const todayRow = currentRows.find(row => row.intendedLocalDate === input.today);
  const keep = todayRow ?? currentRows[0] ?? null;
  const invalidateIds = ordered.filter(row => row.id !== keep?.id).map(row => row.id);

  // A materialized interaction is still the current intervention until its
  // delivery is sent. Never create a successor for pending/locked/failed.
  if (input.dailyInteractionToday && input.dailyDelivery !== 'sent') {
    return { action: 'wait_for_delivery', targetLocalDate: null, keepId: keep?.id ?? null, invalidateIds: [], reason: 'daily_delivery_not_sent' };
  }

  // Once a NEXT exists for today, the preparation clock no longer has any
  // authority over it. It is reserved for this day's delivery.
  if (todayRow && !input.alreadyDeliveredToday) {
    return { action: 'preserve', targetLocalDate: input.today, keepId: todayRow.id, invalidateIds, reason: 'prepared_today_reserved' };
  }

  const targetLocalDate = input.preparationDate ?? nextPsychologicalDeliveryDate(input.schedule, input.now, {
    alreadyDeliveredToday: input.alreadyDeliveredToday,
    dailyInteractionToday: input.dailyInteractionToday,
  });

  if (keep && keep.contextVersion === input.currentContentVersion) {
    if (keep.intendedLocalDate === targetLocalDate) return { action: 'preserve', targetLocalDate, keepId: keep.id, invalidateIds, reason: 'next_content_current' };
    return { action: 'reschedule', targetLocalDate, keepId: keep.id, invalidateIds, reason: 'schedule_only_change' };
  }

  if (input.dailyInteractionToday) {
    return { action: 'wait_for_delivery', targetLocalDate: null, keepId: null, invalidateIds, reason: 'daily_interaction_present' };
  }

  const nextTarget = input.alreadyDeliveredToday ? addLocalDays(input.today, 1) : targetLocalDate;
  return { action: ordered.length ? 'invalidate_and_prepare' : 'prepare', targetLocalDate: nextTarget, keepId: null, invalidateIds: ordered.map(row => row.id), reason: ordered.length ? 'next_content_stale' : 'next_missing' };
}
