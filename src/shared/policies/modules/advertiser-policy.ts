import type { User } from '@/shared/types/user';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { assert } from '../policy-utils';
import { ForbiddenError } from '@/shared/http/http-error';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const advertiserPolicy = {
  /**
   * A profile is created for the actor's own account and nobody else's. During
   * registration the freshly created user is its own actor, which already holds
   * the advertiser role.
   */
  assertCanCreateProfile(actor: User): void {
    assert(
      actor.role,
      PERMISSIONS.ADVERTISERS_CREATE_SELF,
      permissionDenied('create an advertiser profile'),
    );
  },

  assertCanReadProfile(actor: User, ownerId: string): void {
    if (actor.role === USER_ROLES.ADMIN) {
      assert(actor.role, PERMISSIONS.ADVERTISERS_READ_ANY);
      return;
    }

    if (actor.id === ownerId) {
      assert(actor.role, PERMISSIONS.ADVERTISERS_READ_SELF);
      return;
    }

    throw new ForbiddenError(permissionDenied('view this advertiser profile'));
  },

  /** Every profile listing is a cross-account read, so only admins may do it. */
  assertCanListProfiles(actor: User): void {
    assert(
      actor.role,
      PERMISSIONS.ADVERTISERS_READ_ANY,
      permissionDenied('list advertiser profiles'),
    );
  },

  assertCanUpdateProfile(actor: User, ownerId: string): void {
    if (actor.id !== ownerId) {
      throw new ForbiddenError(permissionDenied('edit this advertiser profile'));
    }

    assert(
      actor.role,
      PERMISSIONS.ADVERTISERS_UPDATE_SELF,
      permissionDenied('edit this advertiser profile'),
    );
  },
};
