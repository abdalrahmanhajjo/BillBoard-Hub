import { apiResponse } from '@/server/http/api-response';
import { handleControllerError } from '@/server/http/controller-utils';
import { dashboardService } from '@/server/modules/dashboard/dashboard.service';
import type { User } from '@/shared/types/user';

export const dashboardController = {
  async getAdminOverview(actor: User) {
    try {
      const overview = await dashboardService.getAdminOverview(actor);
      return apiResponse.ok({ overview });
    } catch (error) {
      return handleControllerError(error, 'Getting admin dashboard overview failed.');
    }
  },
};
