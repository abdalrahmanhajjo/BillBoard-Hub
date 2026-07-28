import { model, models, Schema, type InferSchemaType } from 'mongoose';
import {
  CREATIVE_STATUSES,
  CREATIVE_TYPES,
  MAX_CREATIVE_VIDEO_DURATION_SECONDS,
} from '@/shared/constants/creative';
import type { CreativeRecord } from './creative.types';

const creativeSchema = new Schema<CreativeRecord>(
  {
    advertiserId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CREATIVE_TYPES),
      required: true,
      index: true,
    },
    assetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    durationSeconds: {
      type: Number,
      min: Number.EPSILON,
      validate: {
        validator: (value: number | undefined) =>
          value === undefined || value < MAX_CREATIVE_VIDEO_DURATION_SECONDS,
        message: `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
      },
    },
    status: {
      type: String,
      enum: Object.values(CREATIVE_STATUSES),
      required: true,
      default: CREATIVE_STATUSES.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'creatives',
  },
);

export type CreativeDocument = InferSchemaType<typeof creativeSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const CreativeModel = models.Creative || model('Creative', creativeSchema);
