import { campaignController } from '@/server/modules/campaigns/campaign.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { ModerateCampaignStatusSchemaInput } from '@/shared/contracts/campaign/campaign.schema';

type RouteContext = {
  params: Promise<{ campaignId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    const payload = (await request.json()) as ModerateCampaignStatusSchemaInput;

    return campaignController.moderateCampaignStatus(session.user, campaignId, payload);
  } catch (error) {
    return handleControllerError(error, 'Campaign status update failed.');
  }
}
