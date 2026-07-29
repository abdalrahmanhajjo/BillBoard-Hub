import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateExpenseSchemaInput } from '@/shared/contracts/finance/expense.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const params = new URL(request.url).searchParams;
    return financeController.listExpenses(
      {
        billboardId: params.get('billboardId') ?? undefined,
        ownerId: params.get('ownerId') ?? undefined,
        category: params.get('category') ?? undefined,
        status: (params.get('status') ?? undefined) as never,
        from: params.get('from') ?? undefined,
        to: params.get('to') ?? undefined,
      },
      session.user,
    );
  } catch (error) {
    return handleControllerError(error, 'We could not load expenses.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateExpenseSchemaInput;
    return financeController.createExpense(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not record this expense.');
  }
}
