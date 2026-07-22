import type { User } from "@/shared/types/user";
import type { RegisterSchemaInput } from "@/shared/contracts/auth/register.schema";
import { userService } from "../users/user.service";
import { USER_ROLES } from "@/shared/constants/user-roles";

export const authService = {
  async register(input: RegisterSchemaInput): Promise<User> {
    return userService.create({
      ...input,
      role: USER_ROLES.ADVERTISER, // Default role for registered users
    });
  },

  async authenticateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    return userService.findByEmailWithPassword(email, password);
  },

  async getCurrentUser(
    userId: string,
  ): Promise<User | null> {
    return userService.getById(userId);
  },
};
