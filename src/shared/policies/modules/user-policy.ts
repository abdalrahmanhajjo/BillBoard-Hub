import type { User, UserRole } from '@/shared/types/user';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { assert } from '../policy-utils';
import { ForbiddenError, UnauthorizedError } from '@/shared/http/http-error';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const userPolicy = {
  assertCanAssignRole(actor: User | undefined, targetRole: UserRole): void {
    if (targetRole === USER_ROLES.ADMIN) {
      if (!actor?.role) {
        throw new UnauthorizedError('Sign in as an administrator to create an admin account.');
      }

      assert(
        actor.role,
        PERMISSIONS.USERS_CREATE_ADMIN,
        permissionDenied('create administrator accounts'),
      );
      return;
    }

    if (actor?.role) {
      assert(
        actor.role,
        PERMISSIONS.USERS_CREATE_ADVERTISER,
        permissionDenied('create advertiser accounts'),
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

    throw new ForbiddenError(permissionDenied('view this user account'));
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

    throw new ForbiddenError(permissionDenied('delete this user account'));
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

    throw new ForbiddenError(permissionDenied('edit this user account'));
  },
};
