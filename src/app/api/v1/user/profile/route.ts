import { userController } from '@/server/modules/users/user.controller';
import { apiResponse } from '@/server/http/api-response';
import type { DeleteUserPayload, UpdateUserPayload } from '@/shared/types/user';

export async function PUT(request: Request) {
  const payload: UpdateUserPayload = await request.json();
  return userController.updateUserInfo(payload.id, payload.data);
}

export async function DELETE(request: Request) {
  const payload: DeleteUserPayload = await request.json();
  return userController.deleteUser(payload.id);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return apiResponse.badRequest('Missing id parameter.');
  }

  return userController.getUser(userId);
}
