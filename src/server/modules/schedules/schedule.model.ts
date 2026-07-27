import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';

const scheduleSchema = new Schema(
  {
    billboardId: {
      type: String,
      required: true,
      index: true,
    },
    playlistId: {
      type: String,
      required: true,
      index: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SCHEDULE_STATUSES),
      required: true,
      default: SCHEDULE_STATUSES.SCHEDULED,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'schedules',
  },
);

// Speeds up per-screen conflict-detection and now-playing lookups.
scheduleSchema.index({ billboardId: 1, startAt: 1, endAt: 1 });

export type ScheduleDocument = InferSchemaType<typeof scheduleSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const ScheduleModel = models.Schedule || model('Schedule', scheduleSchema);
