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
  BILLBOARDS_DELETE: 'billboards.delete',

  // Creative Permissions
  CREATIVES_READ: 'creatives.read',
  CREATIVES_CREATE: 'creatives.create',
  CREATIVES_UPDATE: 'creatives.update',
  CREATIVES_DELETE: 'creatives.delete',
  CREATIVES_MODERATE: 'creatives.moderate',

  // Playlist Permissions
  PLAYLISTS_READ: 'playlists.read',
  PLAYLISTS_CREATE: 'playlists.create',
  PLAYLISTS_UPDATE: 'playlists.update',
  PLAYLISTS_DELETE: 'playlists.delete',

  // Schedule Permissions
  SCHEDULES_READ: 'schedules.read',
  SCHEDULES_CREATE: 'schedules.create',
  SCHEDULES_UPDATE: 'schedules.update',
  SCHEDULES_DELETE: 'schedules.delete',

  // Impression Permissions
  IMPRESSIONS_READ: 'impressions.read',

  // Booking Permissions
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_MODERATE: 'bookings.moderate',

  // Campaign Permissions
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_READ_ANY: 'campaigns.read:any',
  CAMPAIGNS_READ_SELF: 'campaigns.read:self',
  CAMPAIGNS_UPDATE_SELF: 'campaigns.update:self',
  CAMPAIGNS_ASSIGN_BILLBOARDS: 'campaigns.assign_billboards',

  // Ad Creative Permissions (campaign ad creatives — distinct from the
  // digital-screen CREATIVES_* module above)
  AD_CREATIVES_CREATE: 'ad_creatives.create',
  AD_CREATIVES_READ_ANY: 'ad_creatives.read:any',
  AD_CREATIVES_READ_SELF: 'ad_creatives.read:self',
  AD_CREATIVES_DELETE_SELF: 'ad_creatives.delete:self',
  // Payment Permissions
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_RECONCILE: 'payments.reconcile',
  PAYMENTS_REFUND: 'payments.refund',
} as const;
