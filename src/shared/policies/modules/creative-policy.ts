import type { User, UserRole } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const creativePolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_CREATE, permissionDenied('upload creatives'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_READ, permissionDenied('view creatives'));
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_UPDATE, permissionDenied('edit creatives'));
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_DELETE, permissionDenied('delete creatives'));
  },

  assertCanModerate(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_MODERATE, permissionDenied('review creatives'));
  },

  /** Moderators (admins) may read and act on every advertiser's creatives. */
  canModerate(role: UserRole): boolean {
    return can(role, PERMISSIONS.CREATIVES_MODERATE);
  },
};
