import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const billboardPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_CREATE, 'You cannot create billboards.');
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_READ, 'You cannot view billboards.');
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_UPDATE, 'You cannot update billboards.');
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_DELETE, 'You cannot archive billboards.');
  },
};
