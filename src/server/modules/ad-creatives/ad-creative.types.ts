import { Schema } from 'mongoose';

export interface AdCreativeRecord {
  campaignId: Schema.Types.ObjectId;
  url: string;
  fileType: 'image' | 'video';
  name: string;
}
