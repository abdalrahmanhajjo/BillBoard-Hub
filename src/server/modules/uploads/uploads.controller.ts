import { apiResponse } from '@/server/http/api-response';
import { handleControllerError } from '@/server/http/controller-utils';
import { imagekitUploadService } from '@/server/modules/uploads/imagekit.service';
import { can } from '@/shared/policies/policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import type { User } from '@/shared/types/user';

export const uploadsController = {
  getImageKitAuth(actor: User) {
    try {
      // Anyone who can add billboard media (admins) or their own creatives
      // (advertisers) may request short-lived upload credentials.
      const allowed =
        can(actor.role, PERMISSIONS.BILLBOARDS_CREATE) ||
        can(actor.role, PERMISSIONS.CREATIVES_CREATE);

      if (!allowed) {
        return apiResponse.forbidden('You are not allowed to upload media.');
      }

      return apiResponse.ok(imagekitUploadService.getAuthParams());
    } catch (error) {
      return handleControllerError(error, 'Could not authorize the upload.');
    }
  },
};
