import type { User, UserRole } from '@/shared/types/user';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { assert } from '../policy-utils';
import { ForbiddenError, UnauthorizedError } from '@/server/http/http-error';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const userPolicy = {
  assertCanAssignRole(actor: User | undefined, targetRole: UserRole): void {
    if (targetRole === USER_ROLES.ADMIN) {
      if (!actor?.role) {
        throw new UnauthorizedError('Only admins can create admin users.');
      }

      assert(actor.role, PERMISSIONS.USERS_CREATE_ADMIN, 'Only admins can create admin users.');
      return;
    }

    if (actor?.role) {
      assert(
        actor.role,
        PERMISSIONS.USERS_CREATE_ADVERTISER,
        'Role is not allowed to create advertiser users.',
      );
    }
  },

  assertCanReadUser(actor: User, targetUserId: string): void {
    if (actor.role === USER_ROLES.ADMIN) {
      assert(actor.role, PERMISSIONS.USERS_READ_ANY);
      return;
    }

    if (actor.id === targetUserId) {
      assert(actor.role, PERMISSIONS.USERS_READ_SELF);
      return;
    }

    throw new ForbiddenError('You cannot access this user.');
  },

  assertCanDeleteUser(actor: User, targetUserId: string): void {
    if (actor.role === USER_ROLES.ADMIN) {
      assert(actor.role, PERMISSIONS.USERS_DELETE_ANY);
      return;
    }

    if (actor.id === targetUserId) {
      assert(actor.role, PERMISSIONS.USERS_DELETE_SELF);
      return;
    }

    throw new ForbiddenError('You cannot delete this user.');
  },

  assertCanUpdateUser(actor: User, targetUserId: string): void {
    if (actor.role === USER_ROLES.ADMIN) {
      if (actor.id === targetUserId) {
        assert(actor.role, PERMISSIONS.USERS_UPDATE_SELF);
        return;
      }
      assert(actor.role, PERMISSIONS.USERS_UPDATE_ANY);
      return;
    }

    if (actor.id === targetUserId) {
      assert(actor.role, PERMISSIONS.USERS_UPDATE_SELF);
      return;
    }

    throw new ForbiddenError('You cannot update this user.');
  },
};
