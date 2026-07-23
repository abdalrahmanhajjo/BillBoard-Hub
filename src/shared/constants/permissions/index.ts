import type { UserRole } from '../../types/user';
import type { Permission } from '../../types/permissions';
import { ADMIN_PERMISSIONS } from './admin-permissions';
import { ADVERTISER_PERMISSIONS } from './advertiser-permissions';

export const rolePermissionMap: Record<UserRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  advertiser: ADVERTISER_PERMISSIONS,
};
