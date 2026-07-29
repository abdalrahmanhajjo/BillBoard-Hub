import { CreateCampaignSchemaOutput } from '@/shared/contracts/campaign/campaign.schema';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';

export interface CampaignRecord extends CreateCampaignSchemaOutput {
  status: (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES];
  createdBy: string;
}

/** One row per owner out of `campaignRepository.aggregateOwnerActivity`. */
export type CampaignOwnerActivityRow = {
  /** The `createdBy` id the campaigns belong to. */
  _id: string;
  total: number;
  active: number;
  lastCampaignAt: Date | null;
};
