import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES, DIMENSION_UNITS } from '@/shared/constants/billboard';
import { BillboardRecord } from './billboard.types';

const billboardSchema = new Schema<BillboardRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(BILLBOARD_TYPES),
      required: true,
      index: true,
    },
    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true, index: true },
      country: { type: String, required: true, trim: true, index: true },
    },
    dimensions: {
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
      unit: {
        type: String,
        enum: Object.values(DIMENSION_UNITS),
        required: true,
        default: DIMENSION_UNITS.METERS,
      },
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BILLBOARD_STATUSES),
      required: true,
      default: BILLBOARD_STATUSES.AVAILABLE,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'billboards',
  },
);

export type BillboardDocument = InferSchemaType<typeof billboardSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const BillboardModel = models.Billboard || model('Billboard', billboardSchema);
