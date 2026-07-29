import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateOwnerSchemaInput } from '@/shared/contracts/finance/owner.schema';

type RouteContext = { params: Promise<{ ownerId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { ownerId } = await params;
    const payload = (await request.json()) as UpdateOwnerSchemaInput;
    return financeController.updateOwner(ownerId, payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not update this owner.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { ownerId } = await params;
    return financeController.deleteOwner(ownerId, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not delete this owner.');
  }
}
