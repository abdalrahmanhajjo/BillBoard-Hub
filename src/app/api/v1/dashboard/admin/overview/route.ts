import { dashboardController } from '@/server/modules/dashboard/dashboard.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET() {
  try {
    const session = await requireSession();
    return dashboardController.getAdminOverview(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting admin dashboard overview failed.');
  }
}
