import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';
import type { Schedule, ScheduleState } from '@/shared/types/schedule';

/**
 * Derives the display state of a schedule from the current time. Cancelled
 * schedules short-circuit; otherwise the window decides upcoming / live / ended.
 */
export function getScheduleState(schedule: Schedule, now: number = Date.now()): ScheduleState {
  if (schedule.status === SCHEDULE_STATUSES.CANCELLED) {
    return 'cancelled';
  }
  const start = Date.parse(schedule.startAt);
  const end = Date.parse(schedule.endAt);
  if (now < start) {
    return 'upcoming';
  }
  if (now >= end) {
    return 'ended';
  }
  return 'live';
}

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

/** Formats a UTC ISO timestamp in the viewer's local timezone for display. */
export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, DATE_TIME_FORMAT);
}
