import { userController } from '@/server/modules/users/user.controller';
import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { DeleteUserPayload, UpdateUserPayload } from '@/shared/types/user';

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const payload: UpdateUserPayload = await request.json();
    return userController.updateUserInfo(session.user, payload.id, payload.data);
  } catch (error) {
    return handleControllerError(error, 'Unable to update user.');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    const payload: DeleteUserPayload = await request.json();
    return userController.deleteUser(session.user, payload.id);
  } catch (error) {
    return handleControllerError(error, 'Unable to delete user.');
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return apiResponse.badRequest('Missing id parameter.');
    }

    return userController.getUser(session.user, userId);
  } catch (error) {
    return handleControllerError(error, 'Unable to get user.');
  }
}
