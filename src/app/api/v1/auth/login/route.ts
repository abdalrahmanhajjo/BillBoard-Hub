import { authController } from '@/server/modules/auth/auth.controller';
import { handleControllerError } from '@/server/http/controller-utils';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return authController.login(payload);
  } catch (error) {
    return handleControllerError(error, 'Unable to process the login request.');
  }
}
