import { apiResponse } from '@/server/http/api-response';
import { handleControllerError } from '@/server/http/controller-utils';
import { imagekitUploadService } from '@/server/modules/uploads/imagekit.service';
import { authorizationPolicy } from '@/shared/policies';
import type { User } from '@/shared/types/user';

export const uploadsController = {
  getImageKitAuth(actor: User) {
    try {
      // Only users allowed to manage billboard inventory may request upload creds.
      authorizationPolicy.billboard.assertCanCreate(actor);

      return apiResponse.ok(imagekitUploadService.getAuthParams());
    } catch (error) {
      return handleControllerError(error, 'Could not authorize the upload.');
    }
  },
};
