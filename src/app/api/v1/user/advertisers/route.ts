import { userController } from '@/server/modules/users/user.controller';

export async function GET() {
  return userController.listAdvertisers();
}
