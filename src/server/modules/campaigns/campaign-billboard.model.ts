import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { CampaignBillboardRecord } from './campaign-billboard.types';

const campaignBillboardSchema = new Schema<CampaignBillboardRecord>(
  {
    campaignId: { type: String, required: true, index: true },
    billboardId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: 'campaign_billboards',
  },
);

// Prevent the same billboard being assigned to the same campaign twice (BB-25).
campaignBillboardSchema.index({ campaignId: 1, billboardId: 1 }, { unique: true });

export type CampaignBillboardDocument = InferSchemaType<typeof campaignBillboardSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const CampaignBillboardModel =
  models.CampaignBillboard || model('CampaignBillboard', campaignBillboardSchema);
