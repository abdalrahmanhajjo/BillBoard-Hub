import { uploadsController } from '@/server/modules/uploads/uploads.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET() {
  try {
    const session = await requireSession();
    return uploadsController.getImageKitAuth(session.user);
  } catch (error) {
    return handleControllerError(error, 'Could not authorize the upload.');
  }
}
