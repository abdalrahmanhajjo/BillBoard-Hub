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
    return handleControllerError(error, 'We could not load this billboard. Try again.');
  }
}

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;
    const payload = (await request.json()) as UpdateBillboardSchemaInput;

    return billboardController.updateBillboard(session.user, billboardId, payload);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not save the billboard changes. Review the details and try again.',
    );
  }
}

// PATCH is the canonical verb for partial billboard updates; PUT is kept as an
// alias for backward compatibility.
export const PATCH = handleUpdate;
export const PUT = handleUpdate;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;

    return billboardController.deleteBillboard(session.user, billboardId);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not archive this billboard. Refresh and try again.',
    );
  }
}
