import type { Schema } from 'mongoose';

export type AdvertiserRecord = {
  userId: Schema.Types.ObjectId;
  companyName: string;
  phone: string;
  address: string;
};
