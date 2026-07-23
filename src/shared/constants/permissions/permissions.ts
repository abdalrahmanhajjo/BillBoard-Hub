export const PERMISSIONS = {
  // User Permissions
  USERS_READ_ANY: 'users.read:any',
  USERS_READ_SELF: 'users.read:self',
  USERS_CREATE_ADMIN: 'users.create:admin',
  USERS_CREATE_ADVERTISER: 'users.create:advertiser',
  USERS_UPDATE_ANY: 'users.update:any',
  USERS_UPDATE_SELF: 'users.update:self',
  USERS_DELETE_ANY: 'users.delete:any',
  USERS_DELETE_SELF: 'users.delete:self',

  // Dashboard Permissions
  DASHBOARD_ACCESS_ADMIN: 'dashboard.access:admin',
  DASHBOARD_ACCESS_ADVERTISER: 'dashboard.access:advertiser',
} as const;
