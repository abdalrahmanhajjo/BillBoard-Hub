import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateOwnerSchemaInput } from '@/shared/contracts/finance/owner.schema';

export async function GET() {
  try {
    const session = await requireSession();
    return financeController.listOwners(session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not load billboard owners.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateOwnerSchemaInput;
    return financeController.createOwner(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not add this owner.');
  }
}
