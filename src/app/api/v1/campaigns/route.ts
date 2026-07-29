import { campaignController } from '@/server/modules/campaigns/campaign.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateCampaignSchemaInput } from '@/shared/contracts/campaign/campaign.schema';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateCampaignSchemaInput;
    return campaignController.createCampaign(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Campaign creation failed.');
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    return campaignController.listCampaigns(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting campaigns failed.');
  }
}
