import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { SettleOwnerPaymentSchemaInput } from '@/shared/contracts/finance/owner.schema';

type RouteContext = { params: Promise<{ paymentId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { paymentId } = await params;
    const payload = (await request.json()) as SettleOwnerPaymentSchemaInput;
    return financeController.settleOwnerPayment(paymentId, payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not update this payment.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { paymentId } = await params;
    return financeController.deleteOwnerPayment(paymentId, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not delete this payment.');
  }
}
