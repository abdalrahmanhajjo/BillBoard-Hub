import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import type { UpdateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ creativeId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;

    return adCreativeController.getCreative(session.user, creativeId);
  } catch (error) {
    return handleControllerError(error, 'We could not load this creative. Try again.');
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;
    const payload = (await request.json()) as UpdateAdCreativeSchemaInput;

    return adCreativeController.updateCreative(session.user, creativeId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not save this creative. Try again.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;

    return adCreativeController.deleteCreative(session.user, creativeId);
  } catch (error) {
    return handleControllerError(error, 'Deleting ad creative failed.');
  }
}
