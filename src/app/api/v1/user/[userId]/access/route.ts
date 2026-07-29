import { userController } from '@/server/modules/users/user.controller';
import type { UpdateUserAccessSchemaInput } from '@/shared/contracts/user/user-access.schema';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const payload: UpdateUserAccessSchemaInput = await request.json();

  return userController.updateUserAccess(userId, payload);
}
