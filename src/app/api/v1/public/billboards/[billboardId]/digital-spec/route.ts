import { digitalSpecController } from '@/server/modules/billboards/digital-spec.controller';
import { handleControllerError } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;

    return digitalSpecController.getPublicDigitalSpec(billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load the digital specifications. Try again.');
  }
}
