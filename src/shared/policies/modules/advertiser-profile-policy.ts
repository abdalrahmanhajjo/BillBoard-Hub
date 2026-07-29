import type { User } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { ForbiddenError } from '@/shared/http/http-error';

function canReadAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.READ_ADVERTISER_PROFILE_ANY);
}

function canReadOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.READ_ADVERTISER_PROFILE_SELF);
}

function canDeleteOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.DELETE_ADVERTISER_PROFILE_SELF);
}

function canDeleteAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.DELETE_ADVERTISER_PROFILE_ANY);
}

function canUpdateOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.UPDATE_ADVERTISER_PROFILE_SELF);
}

function canUpdateAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.UPDATE_ADVERTISER_PROFILE_ANY);
}

export const advertiserProfilePolicy = {
  assertCanCreate(actor: User): void {
    assert(
      actor.role,
      PERMISSIONS.CREATE_ADVERTISER_PROFILE_SELF,
      'You cannot create an advertiser profile.',
    );
  },

  canReadAny,
  canReadOwn,

  assertCanRead(actor: User, createdBy?: string): boolean {
    if (canReadAny(actor)) return true;
    if (!createdBy || !canReadOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot view an advertiser profile you do not own.');
    }
    return true;
  },
  assertCanDelete(actor: User, createdBy: string): boolean {
    if (canDeleteAny(actor)) return true;
    if (!canDeleteOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot delete an advertiser profile you do not own.');
    }
    return true;
  },

  assertCanUpdate(actor: User, createdBy: string): boolean {
    if (canUpdateAny(actor)) return true;
    if (!canUpdateOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot update an advertiser profile you do not own.');
    }
    return true;
  },
};
