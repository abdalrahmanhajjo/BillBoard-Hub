import { Permission } from '@/shared/types/permissions';
import { PERMISSIONS } from './permissions';

export const ADMIN_PERMISSIONS: Permission[] = [
  // User Permissions
  PERMISSIONS.USERS_READ_ANY,
  PERMISSIONS.USERS_READ_SELF,
  PERMISSIONS.USERS_CREATE_ADMIN,
  PERMISSIONS.USERS_CREATE_ADVERTISER,
  PERMISSIONS.USERS_UPDATE_SELF,
  PERMISSIONS.USERS_DELETE_ANY,

  // Dashboard Permissions
  PERMISSIONS.DASHBOARD_ACCESS_ADMIN,
];
