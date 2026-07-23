import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { SCREEN_STATUSES } from '@/shared/constants/billboard';
import { DigitalSpecRecord } from './digital-spec.types';

const digitalSpecSchema = new Schema<DigitalSpecRecord>(
  {
    billboardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resolution: {
      width: { type: Number, required: true, min: 1 },
      height: { type: Number, required: true, min: 1 },
    },
    brightness: {
      type: Number,
      required: true,
      min: 0,
    },
    slotDurationSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    rotatingAdsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    screenStatus: {
      type: String,
      enum: Object.values(SCREEN_STATUSES),
      required: true,
      default: SCREEN_STATUSES.OFF,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'digital_billboard_specs',
  },
);

export type DigitalSpecDocument = InferSchemaType<typeof digitalSpecSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const DigitalSpecModel =
  models.DigitalBillboardSpec || model('DigitalBillboardSpec', digitalSpecSchema);
