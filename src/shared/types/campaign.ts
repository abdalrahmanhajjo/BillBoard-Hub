import { CAMPAIGN_STATUSES } from '../constants/campaign';

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES];

export type Campaign = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  createdBy: string;
  createdAt?: string;
};

export type CampaignBillboardAssignment = {
  id: string;
  campaignId: string;
  billboardId: string;
  createdAt?: string;
};
