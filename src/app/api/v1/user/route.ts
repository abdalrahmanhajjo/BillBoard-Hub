import { userController } from '@/server/modules/users/user.controller';
import { CreateUserSchemaInput } from '@/shared/contracts/user/user.schema';

export async function POST(request: Request) {
  const payload: CreateUserSchemaInput = await request.json();
  return userController.createUser(payload);
}
