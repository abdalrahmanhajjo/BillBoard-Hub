import { authController } from '@/server/modules/auth/auth.controller';

export async function POST(request: Request) {
  const payload = await request.json();
  return authController.login(payload);
}
