import { CAMPAIGN_OBJECTIVES } from '@/shared/constants/campain';

export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[keyof typeof CAMPAIGN_OBJECTIVES];
