import bcrypt from 'bcryptjs';
import { userRepository } from '@/server/modules/users/user.repository';
import { toAdvertiserDirectory, toUser, toUserDirectory } from '@/server/modules/users/user.utils';
import { advertiserService } from '@/server/modules/advertiser/advertiser.service';
import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import { campaignRepository } from '@/server/modules/campaigns/campaign.repository';
import { USER_ROLES } from '@/shared/constants/user-roles';
import type {
  CreateUserSchemaInput,
  UpdateUserInfoSchemaInput,
} from '@/shared/contracts/user/user.schema';
import type { UpdateUserAccessSchemaOutput } from '@/shared/contracts/user/user-access.schema';
import type { AdvertiserDirectory } from '@/shared/types/advertiser-directory';
import type { UserDirectory } from '@/shared/types/user-directory';
import type { User } from '@/shared/types/user';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, ConflictError } from '@/shared/http/http-error';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

export const userService = {
  async create(input: CreateUserSchemaInput, actor?: User): Promise<User> {
    const assignedRole = input.role ?? USER_ROLES.ADVERTISER;
    authorizationPolicy.user.assertCanAssignRole(actor, assignedRole);

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(
        'An account already uses this email. Sign in or use a different email address.',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const created = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: assignedRole,
    });

    return toUser(created);
  },

  async findByEmailWithPassword(email: string, password: string): Promise<User | null> {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return toUser(user);
  },

  /**
   * Replaces a password outside the usual actor/permission path: the caller must
   * already have proved ownership some other way (a single-use reset token).
   * Anything acting on behalf of a signed-in actor belongs in `updateById`.
   */
  async replacePassword(userId: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user || !user.isActive) {
      throw new BadRequestError('This account can no longer be updated. Contact support for help.');
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      throw new BadRequestError('Choose a password you have not used on this account before.');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updateById(userId, { passwordHash });
  },

  async getById(userId: string, actor: User): Promise<User | null> {
    authorizationPolicy.user.assertCanReadUser(actor, userId);

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return toUser(user);
  },

  /**
   * The admin advertiser directory: every advertiser account joined to its
   * company profile and to the reservation and campaign activity that says how
   * the relationship is going.
   *
   * Only the profile lookup depends on the account list; the two activity
   * aggregations do not, so all three run together. The join happens here
   * rather than in the database because the counts come from other modules, and
   * each of those owns its own aggregation.
   */
  async listAdvertiserDirectory(actor: User): Promise<AdvertiserDirectory> {
    authorizationPolicy.user.assertCanListUsers(actor);

    const advertisers = await userRepository.findManyByRole(USER_ROLES.ADVERTISER);

    const [profilesByUserId, bookingActivity, campaignActivity] = await Promise.all([
      advertiserService.mapByUserIds(
        advertisers.map((advertiser) => String(advertiser._id)),
        actor,
      ),
      bookingRepository.aggregateAdvertiserActivity(),
      campaignRepository.aggregateOwnerActivity(),
    ]);

    return toAdvertiserDirectory(advertisers, profilesByUserId, bookingActivity, campaignActivity);
  },

  /**
   * Every account on the platform, for the admin user directory. Advertiser
   * rows carry their company name so an admin can tell two similar names apart.
   */
  async listUserDirectory(actor: User): Promise<UserDirectory> {
    authorizationPolicy.user.assertCanListUsers(actor);

    const users = await userRepository.findMany();
    const advertiserIds = users
      .filter((user) => user.role === USER_ROLES.ADVERTISER)
      .map((user) => String(user._id));

    const profilesByUserId = await advertiserService.mapByUserIds(advertiserIds, actor);

    return toUserDirectory(users, profilesByUserId);
  },

  /**
   * Changes what an account may do: its role, its activation state, or both.
   *
   * Two guards sit beyond the permission check, because `users.update:any` on
   * its own would let an admin lock everyone out — including themselves:
   *
   * 1. An admin cannot change their own access. Self-demotion and self-
   *    deactivation are irreversible from the UI that performed them.
   * 2. The last active admin cannot be demoted or deactivated, or the platform
   *    would be left with nobody able to administer it.
   */
  async updateAccessById(
    userId: string,
    input: UpdateUserAccessSchemaOutput,
    actor: User,
  ): Promise<User | null> {
    authorizationPolicy.user.assertCanUpdateUser(actor, userId);

    if (actor.id === userId) {
      throw new BadRequestError(
        'You cannot change your own role or activation state. Ask another administrator.',
      );
    }

    const target = await userRepository.findById(userId);
    if (!target) {
      return null;
    }

    const losesAdmin =
      target.role === USER_ROLES.ADMIN &&
      ((input.role !== undefined && input.role !== USER_ROLES.ADMIN) || input.isActive === false);

    if (losesAdmin) {
      const remainingAdmins = await userRepository.countActiveByRoleExcluding(
        USER_ROLES.ADMIN,
        userId,
      );

      if (remainingAdmins === 0) {
        throw new ConflictError(
          'This is the last active administrator. Promote another account before changing this one.',
        );
      }
    }

    const updated = await userRepository.updateById(userId, input);
    if (!updated) {
      return null;
    }

    return toUser(updated);
  },

  async updateById(
    userId: string,
    updateData: Partial<UpdateUserInfoSchemaInput>,
    actor: User,
  ): Promise<User | null> {
    authorizationPolicy.user.assertCanUpdateUser(actor, userId);
    const updated = await userRepository.updateById(userId, updateData);
    if (!updated) {
      return null;
    }

    return toUser(updated);
  },

  async deleteById(userId: string, actor: User): Promise<User | null> {
    authorizationPolicy.user.assertCanDeleteUser(actor, userId);

    const deleted = await userRepository.deleteById(userId);
    if (!deleted) {
      return null;
    }

    return toUser(deleted);
  },
};
