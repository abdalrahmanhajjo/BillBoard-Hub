import type { CampaignDocument } from '@/server/modules/campaigns/campaign.model';
import type { Campaign, CampaignStatus } from '@/shared/types/campaign';

export function toCampaign(campaign: CampaignDocument): Campaign {
  return {
    id: String(campaign._id),
    name: campaign.name,
    description: campaign.description ?? undefined,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as CampaignStatus,
    createdBy: campaign.createdBy.toString(),
    createdAt: campaign.createdAt ? new Date(campaign.createdAt).toISOString() : undefined,
  };
}
