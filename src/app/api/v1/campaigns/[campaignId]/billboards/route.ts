import { campaignController } from '@/server/modules/campaigns/campaign.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { AssignBillboardsSchemaInput } from '@/shared/contracts/campaign/campaign-billboard.schema';

type RouteContext = {
  params: Promise<{ campaignId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    return campaignController.listAssignedBillboards(session.user, campaignId);
  } catch (error) {
    return handleControllerError(error, 'Getting assigned billboards failed.');
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    const payload = (await request.json()) as AssignBillboardsSchemaInput;
    return campaignController.assignBillboards(session.user, campaignId, payload);
  } catch (error) {
    return handleControllerError(error, 'Assigning billboards failed.');
  }
}
