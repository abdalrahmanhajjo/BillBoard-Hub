import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { AdvertiserRecord } from './advertiser.types';

const advertiserSchema = new Schema<AdvertiserRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
