import { CreateCampaignSchemaOutput } from '@/shared/contracts/campaign/campaign.schema';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';

export interface CampaignRecord extends CreateCampaignSchemaOutput {
  status: (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES];
  createdBy: string;
}
