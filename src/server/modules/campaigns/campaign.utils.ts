import type { CampaignDocument } from '@/server/modules/campaigns/campaign.model';
import type { Campaign, CampaignStatus } from '@/shared/types/campaign';

export function toCampaign(campaign: CampaignDocument): Campaign {
  return {
    id: String(campaign._id),
    name: campaign.name,
    description: campaign.description ?? undefined,
    startDate: new Date(campaign.startDate).toISOString(),
    endDate: new Date(campaign.endDate).toISOString(),
    status: campaign.status as CampaignStatus,
    createdBy: campaign.createdBy,
    createdAt: campaign.createdAt ? new Date(campaign.createdAt).toISOString() : undefined,
    updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt).toISOString() : undefined,
  };
}
