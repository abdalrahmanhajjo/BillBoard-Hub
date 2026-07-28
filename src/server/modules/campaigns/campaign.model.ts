import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import { CampaignRecord } from './campaign.types';

const campaignSchema = new Schema<CampaignRecord>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUSES),
      required: true,
      default: CAMPAIGN_STATUSES.DRAFT,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Advertiser',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'campaigns',
  },
);

export type CampaignDocument = InferSchemaType<typeof campaignSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const CampaignModel = models.Campaign || model('Campaign', campaignSchema);
