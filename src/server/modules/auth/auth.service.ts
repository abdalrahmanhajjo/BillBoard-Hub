import type { User } from '@/shared/types/user';
import type { RegisterSchemaOutput } from '@/shared/contracts/auth/register.schema';
import { userService } from '../users/user.service';
import { userRepository } from '../users/user.repository';
import { advertiserService } from '../advertiser/advertiser.service';
import { USER_ROLES } from '@/shared/constants/user-roles';

export const authService = {
  /**
   * Creates the account and its advertiser profile together.
   *
   * The two are collected as separate steps in the UI but land in one call, so
   * a caller never observes a half-registered advertiser. The freshly created
   * user is its own actor: it already holds the advertiser role, which is what
   * the profile policy gates on.
   */
  async register(input: RegisterSchemaOutput): Promise<User> {
    const user = await userService.create({
      ...input,
      role: USER_ROLES.ADVERTISER, // Default role for registered users
    });

    try {
      await advertiserService.create(user, {
        companyName: input.companyName,
        phone: input.phone,
        address: input.address,
      });
    } catch (error) {
      // An account with no profile cannot list its creatives or read its own
      // delivery, and the email is now taken so the person cannot simply retry.
      // Undo our own write rather than leave that behind — deleted through the
      // repository because this is a rollback, not a user-initiated deletion.
      await userRepository.deleteById(user.id);
      throw error;
    }

    return user;
  },

  async authenticateCredentials(email: string, password: string): Promise<User | null> {
    return userService.findByEmailWithPassword(email, password);
  },

  async getCurrentUser(userId: string, actor: User): Promise<User | null> {
    return userService.getById(userId, actor);
  },
};
