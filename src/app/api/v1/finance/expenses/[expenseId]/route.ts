import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateExpenseSchemaInput } from '@/shared/contracts/finance/expense.schema';

type RouteContext = { params: Promise<{ expenseId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { expenseId } = await params;
    return financeController.getExpense(expenseId, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not load this expense.');
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { expenseId } = await params;
    const payload = (await request.json()) as UpdateExpenseSchemaInput;
    return financeController.updateExpense(expenseId, payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not update this expense.');
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { expenseId } = await params;
    return financeController.deleteExpense(expenseId, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not delete this expense.');
  }
}
