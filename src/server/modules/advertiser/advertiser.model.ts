import { model, models, Schema, type InferSchemaType } from 'mongoose';
import type { AdvertiserRecord } from './advertiser.types';

const advertiserSchema = new Schema<AdvertiserRecord>(
  {
    // Unique rather than merely indexed: an account has one company profile, and
    // the constraint is what makes a duplicate registration fail loudly.
    userId: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    collection: 'advertisers',
  },
);

export type AdvertiserDocument = InferSchemaType<typeof advertiserSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const AdvertiserModel = models.Advertiser || model('Advertiser', advertiserSchema);
