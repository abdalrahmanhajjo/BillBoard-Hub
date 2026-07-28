import type { User } from '@/shared/types/user';
import { dashboardService } from '@/server/modules/dashboard/dashboard.service';

export async function getAdminDashboardOverviewAction(actor: User) {
  return dashboardService.getAdminOverview(actor);
}
