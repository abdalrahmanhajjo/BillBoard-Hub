import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const schedulePolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_CREATE, 'You cannot create schedules.');
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_READ, 'You cannot view schedules.');
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_UPDATE, 'You cannot update schedules.');
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.SCHEDULES_DELETE, 'You cannot delete schedules.');
  },
};
