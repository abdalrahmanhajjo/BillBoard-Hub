import type { User } from '@/shared/types/user';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';
import { assert } from '@/shared/policies/policy-utils';

export const paymentPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.PAYMENTS_CREATE, permissionDenied('pay for reservations'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.PAYMENTS_READ, permissionDenied('view payment details'));
  },

  assertCanReconcile(actor: User): void {
    assert(actor.role, PERMISSIONS.PAYMENTS_RECONCILE, permissionDenied('record offline payments'));
  },

  assertCanRefund(actor: User): void {
    assert(actor.role, PERMISSIONS.PAYMENTS_REFUND, permissionDenied('refund payments'));
  },
};
