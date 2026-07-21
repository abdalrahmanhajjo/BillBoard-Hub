import { authController } from "@/server/modules/auth/auth.controller";

export async function GET() {
  return authController.me();
}
