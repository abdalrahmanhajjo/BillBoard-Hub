import { billboardController } from '@/server/modules/billboards/billboard.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateBillboardSchemaInput } from '@/shared/contracts/billboard/billboard.schema';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;

    return billboardController.getBillboard(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'Getting billboard failed.');
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;
    const payload = (await request.json()) as UpdateBillboardSchemaInput;

    return billboardController.updateBillboard(session.user, billboardId, payload);
  } catch (error) {
    return handleControllerError(error, 'Billboard update failed.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;

    return billboardController.deleteBillboard(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'Archiving billboard failed.');
  }
}
