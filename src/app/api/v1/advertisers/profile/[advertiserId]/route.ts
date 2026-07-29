import { advertiserProfileController } from '@/server/modules/advertiser/advertiser.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateAdvertiserSchemaInput } from '@/shared/contracts/advertiser/advertiser.schema';

type RouteContext = {
  params: Promise<{ advertiserId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { advertiserId } = await params;

    return advertiserProfileController.getAdvertiser(session.user, advertiserId);
  } catch (error) {
    return handleControllerError(error, 'Getting advertiser profile failed.');
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { advertiserId } = await params;
    const payload = (await request.json()) as UpdateAdvertiserSchemaInput;

    return advertiserProfileController.updateAdvertiser(session.user, advertiserId, payload);
  } catch (error) {
    return handleControllerError(error, 'Advertiser profile update failed.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { advertiserId } = await params;

    return advertiserProfileController.deleteAdvertiser(session.user, advertiserId);
  } catch (error) {
    return handleControllerError(error, 'Deleting advertiser profile failed.');
  }
}
