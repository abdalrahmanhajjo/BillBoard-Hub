import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';

export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[keyof typeof SCHEDULE_STATUSES];

/**
 * Time-derived display state for a schedule. Unlike {@link ScheduleStatus}
 * (which is persisted), this is computed from the current time versus the
 * scheduled window so the UI can show upcoming / live / ended at a glance.
 */
export type ScheduleState = 'upcoming' | 'live' | 'ended' | 'cancelled';

export type Schedule = {
  id: string;
  billboardId: string;
  playlistId: string;
  status: ScheduleStatus;
  /** UTC ISO timestamp when the playlist starts playing on the screen. */
  startAt: string;
  /** UTC ISO timestamp when the playlist stops playing on the screen. */
  endAt: string;
  createdAt?: string;
  updatedAt?: string;
};
