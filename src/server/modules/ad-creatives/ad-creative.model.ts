import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';
import { AdCreativeRecord } from './ad-creative.types';

const adCreativeSchema = new Schema<AdCreativeRecord>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    url: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    fileType: {
      type: String,
      enum: Object.values(AD_CREATIVE_TYPES),
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'ad_creatives',
  },
);

export type AdCreativeDocument = InferSchemaType<typeof adCreativeSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const AdCreativeModel = models.AdCreative || model('AdCreative', adCreativeSchema);
