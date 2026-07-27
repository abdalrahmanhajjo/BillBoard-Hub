import { rolePermissionMap } from '../constants/permissions';
import { ForbiddenError } from '@/server/http/http-error';
import { Permission } from '../types/permissions';
import { UserRole } from '../types/user';

function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissionMap[role].includes(permission);
}

export function can(role: UserRole, permission: Permission): boolean {
  return hasPermission(role, permission);
}

export function assert(role: UserRole, permission: Permission, message?: string): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(message ?? 'Forbidden.');
  }
}
