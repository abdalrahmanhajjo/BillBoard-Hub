import { authController } from '@/server/modules/auth/auth.controller';

export async function POST() {
  return authController.refresh();
}
