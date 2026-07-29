import { Schema } from 'mongoose';

export interface CampaignBillboardRecord {
  campaignId: Schema.Types.ObjectId;
  billboardId: Schema.Types.ObjectId;
}
