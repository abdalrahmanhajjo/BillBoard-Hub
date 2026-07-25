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
} as const;
