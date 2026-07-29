import { dashboardRepository } from '@/server/modules/dashboard/dashboard.repository';
import { authorizationPolicy } from '@/shared/policies';
import { ForbiddenError } from '@/shared/http/http-error';
import type { User } from '@/shared/types/user';

export const dashboardService = {
  async getAdminOverview(actor: User) {
    if (!authorizationPolicy.dashboard.canAccessDashboard(actor.role, 'admin')) {
      throw new ForbiddenError('You cannot access the admin dashboard.');
    }

    return dashboardRepository.getAdminOverview(new Date());
  },
};
