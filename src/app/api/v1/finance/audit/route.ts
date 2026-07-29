import { financeController } from '@/server/modules/finance/finance.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const entityId = new URL(request.url).searchParams.get('entityId') ?? undefined;
    return financeController.auditTrail(session.user, entityId);
  } catch (error) {
    return handleControllerError(error, 'We could not load the audit trail.');
  }
}
