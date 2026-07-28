import { scheduleRepository } from '@/server/modules/schedules/schedule.repository';
import { toSchedule } from '@/server/modules/schedules/schedule.utils';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { playlistRepository } from '@/server/modules/playlists/playlist.repository';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';
import type {
  CreateScheduleSchemaOutput,
  UpdateScheduleSchemaOutput,
} from '@/shared/contracts/schedule/schedule.schema';
import type { Schedule } from '@/shared/types/schedule';
import type { User } from '@/shared/types/user';

async function assertDigitalBillboard(billboardId: string): Promise<void> {
  const billboard = await billboardRepository.findById(billboardId);
  if (!billboard) {
    throw new NotFoundError('We could not find this billboard. It may have been removed.');
  }
  if (billboard.type !== BILLBOARD_TYPES.DIGITAL) {
    throw new BadRequestError('Schedules can only be created for digital billboards.');
  }
}

async function assertPlaylistForBillboard(playlistId: string, billboardId: string): Promise<void> {
  const playlist = await playlistRepository.findById(playlistId);
  if (!playlist) {
    throw new NotFoundError('We could not find this playlist. It may have been removed.');
  }
  if (playlist.billboardId !== billboardId) {
    throw new BadRequestError('The selected playlist belongs to a different screen.');
  }
}

async function assertNoOverlap(
  billboardId: string,
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): Promise<void> {
  const overlapping = await scheduleRepository.findOverlapping(
    billboardId,
    startAt,
    endAt,
    excludeId,
  );
  if (overlapping.length > 0) {
    throw new ConflictError('This time window overlaps an existing schedule for this screen.');
  }
}

export const scheduleService = {
  async create(input: CreateScheduleSchemaOutput, actor: User): Promise<Schedule> {
    authorizationPolicy.schedule.assertCanCreate(actor);
    await assertDigitalBillboard(input.billboardId);
    await assertPlaylistForBillboard(input.playlistId, input.billboardId);

    if (input.status !== SCHEDULE_STATUSES.CANCELLED) {
      await assertNoOverlap(input.billboardId, new Date(input.startAt), new Date(input.endAt));
    }

    const created = await scheduleRepository.create(input);
    return toSchedule(created);
  },

  async list(actor: User, billboardId?: string): Promise<Schedule[]> {
    authorizationPolicy.schedule.assertCanRead(actor);
    const schedules = await scheduleRepository.findMany(billboardId ? { billboardId } : {});
    return schedules.map(toSchedule);
  },

  async getById(actor: User, scheduleId: string): Promise<Schedule> {
    authorizationPolicy.schedule.assertCanRead(actor);
    const schedule = await scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('We could not find this schedule. It may have been removed.');
    }
    return toSchedule(schedule);
  },

  async update(
    actor: User,
    scheduleId: string,
    input: UpdateScheduleSchemaOutput,
  ): Promise<Schedule> {
    authorizationPolicy.schedule.assertCanUpdate(actor);

    const existing = await scheduleRepository.findById(scheduleId);
    if (!existing) {
      throw new NotFoundError('We could not find this schedule. It may have been removed.');
    }

    const nextStartAt = input.startAt ? new Date(input.startAt) : new Date(existing.startAt);
    const nextEndAt = input.endAt ? new Date(input.endAt) : new Date(existing.endAt);
    if (nextEndAt.getTime() <= nextStartAt.getTime()) {
      throw new BadRequestError('The end time must be after the start time.');
    }

    if (input.playlistId) {
      await assertPlaylistForBillboard(input.playlistId, existing.billboardId);
    }

    const nextStatus = input.status ?? existing.status;
    if (nextStatus !== SCHEDULE_STATUSES.CANCELLED) {
      await assertNoOverlap(existing.billboardId, nextStartAt, nextEndAt, scheduleId);
    }

    const updated = await scheduleRepository.updateById(scheduleId, input);
    if (!updated) {
      throw new NotFoundError('We could not find this schedule. It may have been removed.');
    }
    return toSchedule(updated);
  },

  async delete(actor: User, scheduleId: string): Promise<void> {
    authorizationPolicy.schedule.assertCanDelete(actor);
    const deleted = await scheduleRepository.deleteById(scheduleId);
    if (!deleted) {
      throw new NotFoundError('We could not find this schedule. It may have been removed.');
    }
  },
};
