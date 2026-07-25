import { apiResponse } from '@/server/http/api-response';
import { handleControllerError } from '@/server/http/controller-utils';
import { rotationService } from '@/server/modules/rotation/rotation.service';
import type { User } from '@/shared/types/user';

export const rotationController = {
  async getNowPlaying(billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    try {
      const nowPlaying = await rotationService.getNowPlaying(billboardId);
      return apiResponse.ok(nowPlaying);
    } catch (error) {
      return handleControllerError(error, 'Getting now playing failed.');
    }
  },

  async getScheduleRotation(actor: User, scheduleId: string) {
    if (!scheduleId) {
      return apiResponse.badRequest('Schedule id is required.');
    }

    try {
      const rotation = await rotationService.getScheduleRotation(actor, scheduleId);
      return apiResponse.ok({ rotation });
    } catch (error) {
      return handleControllerError(error, 'Getting rotation failed.');
    }
  },
};
