import { Permission } from '@/shared/types/permissions';
import { PERMISSIONS } from './permissions';

export const ADMIN_PERMISSIONS: Permission[] = [
  // User Permissions
  PERMISSIONS.USERS_READ_ANY,
  PERMISSIONS.USERS_READ_SELF,
  PERMISSIONS.USERS_CREATE_ADMIN,
  PERMISSIONS.USERS_CREATE_ADVERTISER,
  PERMISSIONS.USERS_UPDATE_SELF,
  // Role and activation administration. Guarded in the service beyond the
  // permission itself: an admin cannot change their own access, and the last
  // active admin cannot be demoted or deactivated.
  PERMISSIONS.USERS_UPDATE_ANY,
  PERMISSIONS.USERS_DELETE_ANY,

  // Advertiser profile Permissions (admins read every company profile)
  PERMISSIONS.ADVERTISERS_READ_ANY,

  // Dashboard Permissions
  PERMISSIONS.DASHBOARD_ACCESS_ADMIN,

  // Billboard Permissions
  PERMISSIONS.BILLBOARDS_READ,
  PERMISSIONS.BILLBOARDS_CREATE,
  PERMISSIONS.BILLBOARDS_UPDATE,
  PERMISSIONS.BILLBOARDS_DELETE,

  // Creative Permissions (admins moderate all)
  PERMISSIONS.CREATIVES_READ,
  PERMISSIONS.CREATIVES_MODERATE,
  PERMISSIONS.CREATIVES_DELETE,

  // Playlist Permissions (admins program digital screens)
  PERMISSIONS.PLAYLISTS_READ,
  PERMISSIONS.PLAYLISTS_CREATE,
  PERMISSIONS.PLAYLISTS_UPDATE,
  PERMISSIONS.PLAYLISTS_DELETE,

  // Schedule Permissions (admins book playlists onto screens)
  PERMISSIONS.SCHEDULES_READ,
  PERMISSIONS.SCHEDULES_CREATE,
  PERMISSIONS.SCHEDULES_UPDATE,
  PERMISSIONS.SCHEDULES_DELETE,

  // Impression Permissions (admins read playback analytics)
  PERMISSIONS.IMPRESSIONS_READ,

  // Booking Permissions (admins review and moderate reservations)
  PERMISSIONS.BOOKINGS_CREATE,
  PERMISSIONS.BOOKINGS_READ,
  PERMISSIONS.BOOKINGS_MODERATE,

  // Campaign & ad-creative Permissions (admins read all)
  PERMISSIONS.CAMPAIGNS_READ_ANY,
  // Status only. Admins never edit an advertiser's campaign content — name,
  // dates, and description stay with the owner.
  PERMISSIONS.CAMPAIGNS_MODERATE,
  PERMISSIONS.AD_CREATIVES_READ_ANY,
  // Payment Permissions
  PERMISSIONS.PAYMENTS_READ,
  PERMISSIONS.PAYMENTS_RECONCILE,
  PERMISSIONS.PAYMENTS_REFUND,
];
