import { billboardController } from '@/server/modules/billboards/billboard.controller';
import { handleControllerError } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;

    return billboardController.getPublicBillboard(billboardId);
  } catch (error) {
    return handleControllerError(error, 'Getting billboard failed.');
  }
}
