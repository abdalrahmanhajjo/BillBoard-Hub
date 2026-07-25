import { Permission } from '../../types/permissions';
import { PERMISSIONS } from './permissions';

export const ADVERTISER_PERMISSIONS: Permission[] = [
  // User Permissions
  PERMISSIONS.USERS_READ_SELF,
  PERMISSIONS.USERS_CREATE_ADVERTISER,
  PERMISSIONS.USERS_UPDATE_SELF,

  // Dashboard Permissions
  PERMISSIONS.DASHBOARD_ACCESS_ADVERTISER,

  // Billboard Permissions
  PERMISSIONS.BILLBOARDS_READ,

  // Creative Permissions (advertisers manage their own)
  PERMISSIONS.CREATIVES_READ,
  PERMISSIONS.CREATIVES_CREATE,
  PERMISSIONS.CREATIVES_UPDATE,
  PERMISSIONS.CREATIVES_DELETE,
];
