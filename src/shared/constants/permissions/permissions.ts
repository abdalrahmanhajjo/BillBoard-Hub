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

  // Billboard Permissions
  BILLBOARDS_READ: 'billboards.read',
  BILLBOARDS_CREATE: 'billboards.create',
  BILLBOARDS_UPDATE: 'billboards.update',

  // Campaign Permissions
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_READ_ANY: 'campaigns.read:any',
  CAMPAIGNS_READ_SELF: 'campaigns.read:self',
  CAMPAIGNS_UPDATE_SELF: 'campaigns.update:self',
  CAMPAIGNS_ASSIGN_BILLBOARDS: 'campaigns.assign_billboards',

  // Ad Creative Permissions
  CREATIVES_CREATE: 'creatives.create',
  CREATIVES_READ_ANY: 'creatives.read:any',
  CREATIVES_READ_SELF: 'creatives.read:self',
  CREATIVES_DELETE_SELF: 'creatives.delete:self',
} as const;
