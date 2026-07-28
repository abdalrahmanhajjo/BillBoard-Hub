import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const schedulePolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_CREATE, permissionDenied('create schedules'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_READ, permissionDenied('view schedules'));
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_UPDATE, permissionDenied('edit schedules'));
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_DELETE, permissionDenied('delete schedules'));
  },
};
