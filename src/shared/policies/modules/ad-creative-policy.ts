import type { User } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { ForbiddenError } from '@/shared/http/http-error';

function canReadAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.CREATIVES_READ_ANY);
}

function canReadOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.CREATIVES_READ_OWN);
}

function canDeleteOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.CREATIVES_DELETE_OWN);
}

function canDeleteAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.CREATIVES_DELETE_ANY);
}

function canUpdateOwn(actor: User, createdBy: string): boolean {
  if (createdBy !== actor.id) {
    return false;
  }
  return can(actor.role, PERMISSIONS.CREATIVES_UPDATE_OWN);
}

function canUpdateAny(actor: User): boolean {
  return can(actor.role, PERMISSIONS.CREATIVES_UPDATE_ANY);
}

export const adCreativePolicy = {
  assertCanCreate(actor: User, campainAdvertiser: string): void {
    assert(actor.role, PERMISSIONS.CREATIVES_CREATE, 'You cannot upload ad creatives.');
    if (campainAdvertiser !== actor.id) {
      throw new ForbiddenError('You cannot add creatives to a campaign you do not own.');
    }
  },

  canReadAny,
  canReadOwn,

  assertCanRead(actor: User, createdBy: string): boolean {
    if (canReadAny(actor)) return true;
    if (!canReadOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot view creatives for a campaign you do not own.');
    }
    return true;
  },
  assertCanDelete(actor: User, createdBy: string): boolean {
    if (canDeleteAny(actor)) return true;
    if (!canDeleteOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot delete creatives for a campaign you do not own.');
    }
    return true;
  },

  assertCanUpdate(actor: User, createdBy: string): boolean {
    if (canUpdateAny(actor)) return true;
    if (!canUpdateOwn(actor, createdBy)) {
      throw new ForbiddenError('You cannot update creatives for a campaign you do not own.');
    }
    return true;
  },
};
