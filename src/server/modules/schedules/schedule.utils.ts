import type { ScheduleDocument } from '@/server/modules/schedules/schedule.model';
import type { Schedule, ScheduleStatus } from '@/shared/types/schedule';

export function toSchedule(schedule: ScheduleDocument): Schedule {
  return {
    id: String(schedule._id),
    billboardId: schedule.billboardId,
    playlistId: schedule.playlistId,
    status: schedule.status as ScheduleStatus,
    startAt: new Date(schedule.startAt).toISOString(),
    endAt: new Date(schedule.endAt).toISOString(),
    createdAt: schedule.createdAt ? new Date(schedule.createdAt).toISOString() : undefined,
    updatedAt: schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : undefined,
  };
}
