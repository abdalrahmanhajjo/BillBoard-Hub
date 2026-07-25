import type { User, UserRole } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const bookingPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_CREATE, 'You cannot create reservations.');
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_READ, 'You cannot view reservations.');
  },

  assertCanModerate(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_MODERATE, 'You cannot moderate reservations.');
  },

  /** Admins see every reservation; everyone else is scoped to their own. */
  canModerate(role: UserRole): boolean {
    return can(role, PERMISSIONS.BOOKINGS_MODERATE);
  },
};
