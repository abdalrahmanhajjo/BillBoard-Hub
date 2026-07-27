import { connectToDatabase } from '@/server/db/mongoose';
import { ScheduleModel, type ScheduleDocument } from '@/server/modules/schedules/schedule.model';
import type { ScheduleRecord } from '@/server/modules/schedules/schedule.types';
import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';
import type { UpdateScheduleSchemaOutput } from '@/shared/contracts/schedule/schedule.schema';

export const scheduleRepository = {
  async create(data: ScheduleRecord): Promise<ScheduleDocument> {
    await connectToDatabase();
    const created = await ScheduleModel.create({
      ...data,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
    });
    return created.toObject() as ScheduleDocument;
  },

  async findById(scheduleId: string): Promise<ScheduleDocument | null> {
    await connectToDatabase();
    return ScheduleModel.findById(scheduleId).lean<ScheduleDocument>().exec();
  },

  async findMany(filter: { billboardId?: string } = {}): Promise<ScheduleDocument[]> {
    await connectToDatabase();
    const query = filter.billboardId ? { billboardId: filter.billboardId } : {};
    return ScheduleModel.find(query).sort({ startAt: 1 }).lean<ScheduleDocument[]>().exec();
  },

  /**
   * Returns active (non-cancelled) schedules on the same screen whose window
   * overlaps [startAt, endAt). Two half-open intervals overlap when each starts
   * before the other ends. `excludeId` skips the schedule being updated.
   */
  async findOverlapping(
    billboardId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<ScheduleDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      billboardId,
      status: SCHEDULE_STATUSES.SCHEDULED,
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return ScheduleModel.find(query).lean<ScheduleDocument[]>().exec();
  },

  /**
   * Active (non-cancelled) schedules whose window contains `at`, earliest
   * start first. With overlap prevention there is at most one, but the query
   * stays defensive.
   */
  async findActiveAt(billboardId: string, at: Date): Promise<ScheduleDocument[]> {
    await connectToDatabase();
    return ScheduleModel.find({
      billboardId,
      status: SCHEDULE_STATUSES.SCHEDULED,
      startAt: { $lte: at },
      endAt: { $gt: at },
    })
      .sort({ startAt: 1 })
      .lean<ScheduleDocument[]>()
      .exec();
  },

  async updateById(
    scheduleId: string,
    data: UpdateScheduleSchemaOutput,
  ): Promise<ScheduleDocument | null> {
    await connectToDatabase();
    const update: Record<string, unknown> = { ...data };
    if (data.startAt !== undefined) {
      update.startAt = new Date(data.startAt);
    }
    if (data.endAt !== undefined) {
      update.endAt = new Date(data.endAt);
    }
    return ScheduleModel.findByIdAndUpdate(scheduleId, update, { new: true })
      .lean<ScheduleDocument>()
      .exec();
  },

  async deleteById(scheduleId: string): Promise<ScheduleDocument | null> {
    await connectToDatabase();
    return ScheduleModel.findByIdAndDelete(scheduleId).lean<ScheduleDocument>().exec();
  },
};
