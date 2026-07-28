import { campaignController } from '@/server/modules/campaigns/campaign.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateCampaignSchemaInput } from '@/shared/contracts/campaign/campaign.schema';

type RouteContext = {
  params: Promise<{ campaignId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    return campaignController.getCampaign(session.user, campaignId);
  } catch (error) {
    return handleControllerError(error, 'Getting campaign failed.');
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    const payload = (await request.json()) as UpdateCampaignSchemaInput;
    return campaignController.updateCampaign(session.user, campaignId, payload);
  } catch (error) {
    return handleControllerError(error, 'Campaign update failed.');
  }
}
