import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateOwnerPaymentSchemaInput } from '@/shared/contracts/finance/owner.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const ownerId = new URL(request.url).searchParams.get('ownerId') ?? undefined;
    return financeController.listOwnerPayments(session.user, ownerId);
  } catch (error) {
    return handleControllerError(error, 'We could not load payments.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateOwnerPaymentSchemaInput;
    return financeController.createOwnerPayment(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not schedule this payment.');
  }
}
