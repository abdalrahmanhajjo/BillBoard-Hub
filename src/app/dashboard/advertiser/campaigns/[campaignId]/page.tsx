import { CampaignDetailsPage } from '@/client/features/campaigns/pages/campaign-details-page';

type RouteParams = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailsRoute({ params }: RouteParams) {
  const { campaignId } = await params;
  return <CampaignDetailsPage campaignId={campaignId} />;
}
