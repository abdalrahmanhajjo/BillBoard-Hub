import type { User } from '@/shared/types/user';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { ForbiddenError } from '@/shared/http/http-error';
import { permissionDenied } from '@/shared/messages/user-messages';
import { assert, can } from '@/shared/policies/policy-utils';

/**
 * Company finances are admin-only, and this is the second gate after the route
 * guard. Every method asserts the role explicitly as well as the permission:
 * finance exposes supplier rates and per-billboard margins, so if a permission
 * were ever granted to another role by mistake, the role check still refuses.
 */
function assertAdmin(actor: User): void {
  if (actor.role !== USER_ROLES.ADMIN) {
    throw new ForbiddenError(permissionDenied('access company financial records'));
  }
}

export const financePolicy = {
  canView(actor: User): boolean {
    return actor.role === USER_ROLES.ADMIN && can(actor.role, PERMISSIONS.FINANCE_VIEW);
  },

  assertCanView(actor: User): void {
    assertAdmin(actor);
    assert(actor.role, PERMISSIONS.FINANCE_VIEW, permissionDenied('view company finances'));
  },

  assertCanCreate(actor: User): void {
    assertAdmin(actor);
    assert(actor.role, PERMISSIONS.FINANCE_CREATE, permissionDenied('record company finances'));
  },

  assertCanUpdate(actor: User): void {
    assertAdmin(actor);
    assert(actor.role, PERMISSIONS.FINANCE_UPDATE, permissionDenied('change financial records'));
  },

  assertCanDelete(actor: User): void {
    assertAdmin(actor);
    assert(actor.role, PERMISSIONS.FINANCE_DELETE, permissionDenied('delete financial records'));
  },
};
