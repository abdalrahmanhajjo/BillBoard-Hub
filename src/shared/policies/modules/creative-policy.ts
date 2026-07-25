import type { User, UserRole } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const creativePolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_CREATE, 'You cannot create creatives.');
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_READ, 'You cannot view creatives.');
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_UPDATE, 'You cannot update creatives.');
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_DELETE, 'You cannot delete creatives.');
  },

  assertCanModerate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_MODERATE, 'You cannot moderate creatives.');
  },

  /** Moderators (admins) may read and act on every advertiser's creatives. */
  canModerate(role: UserRole): boolean {
    return can(role, PERMISSIONS.CREATIVES_MODERATE);
  },
};
