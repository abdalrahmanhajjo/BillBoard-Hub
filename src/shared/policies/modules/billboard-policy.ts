import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const billboardPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_CREATE, permissionDenied('add billboard inventory'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_READ, permissionDenied('view billboard inventory'));
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_UPDATE, permissionDenied('edit billboard inventory'));
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.BILLBOARDS_DELETE, permissionDenied('archive billboards'));
  },
};
