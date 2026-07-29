import { CreateCampaignSchemaInput } from '@/shared/contracts/campaign/campaign.schema';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import { Schema } from 'mongoose';

export interface CampaignRecord extends CreateCampaignSchemaInput {
  status: (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES];
  createdBy: Schema.Types.ObjectId;
}
