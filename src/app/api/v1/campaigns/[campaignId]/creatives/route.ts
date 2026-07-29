import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';

type RouteContext = {
  params: Promise<{ campaignId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    return adCreativeController.listCreatives(session.user, campaignId);
  } catch (error) {
    return handleControllerError(error, 'Getting ad creatives failed.');
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { campaignId } = await params;
    const payload = (await request.json()) as CreateAdCreativeSchemaInput;
    return adCreativeController.createCreative({ ...payload, campaignId }, session.user);
  } catch (error) {
    return handleControllerError(error, 'Uploading ad creative failed.');
  }
}
