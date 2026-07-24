import { userController } from '@/server/modules/users/user.controller';
import type { CreateUserSchemaInput } from '@/shared/contracts/user/user.schema';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload: CreateUserSchemaInput = await request.json();
    return userController.createUser(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Unable to create user.');
  }
}
