import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const params = new URL(request.url).searchParams;
    return financeController.overview(session.user, {
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
    });
  } catch (error) {
    return handleControllerError(error, 'We could not build the financial overview.');
  }
}
