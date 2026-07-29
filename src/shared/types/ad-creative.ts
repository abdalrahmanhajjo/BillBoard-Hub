import { AD_CREATIVE_TYPES } from '../constants/ad-creative';

export type AdCreativeType = (typeof AD_CREATIVE_TYPES)[keyof typeof AD_CREATIVE_TYPES];

export type AdCreative = {
  id: string;
  campaignId: string;
  url: string;
  fileType: AdCreativeType;
  durationSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
};

export type AdCreativeWithCampaign = AdCreative & {
  campaignName: string;
};
