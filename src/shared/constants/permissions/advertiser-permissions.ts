import { Permission } from '../../types/permissions';
import { PERMISSIONS } from './permissions';

export const ADVERTISER_PERMISSIONS: Permission[] = [
  // User Permissions
  PERMISSIONS.USERS_READ_SELF,
  PERMISSIONS.USERS_CREATE_ADVERTISER,
  PERMISSIONS.USERS_UPDATE_SELF,

  // Advertiser Profile Permissions
  PERMISSIONS.CREATE_ADVERTISER_PROFILE_SELF,
  PERMISSIONS.UPDATE_ADVERTISER_PROFILE_SELF,
  PERMISSIONS.READ_ADVERTISER_PROFILE_SELF,

  // Dashboard Permissions
  PERMISSIONS.DASHBOARD_ACCESS_ADVERTISER,

  // Billboard Permissions
  PERMISSIONS.BILLBOARDS_READ,

  // Ad Creative Permissions (advertisers manage their own)
  PERMISSIONS.CREATIVES_READ_OWN,
  PERMISSIONS.CREATIVES_CREATE,
  PERMISSIONS.CREATIVES_UPDATE_OWN,
  PERMISSIONS.CREATIVES_DELETE_OWN,

  // Booking Permissions (advertisers reserve billboards and track their requests)
  PERMISSIONS.BOOKINGS_CREATE,
  PERMISSIONS.BOOKINGS_READ,

  // Campaign Permissions (advertisers manage their own campaigns)
  PERMISSIONS.CAMPAIGNS_CREATE,
  PERMISSIONS.CAMPAIGNS_READ_SELF,
  PERMISSIONS.CAMPAIGNS_UPDATE_SELF,
  PERMISSIONS.CAMPAIGNS_ASSIGN_BILLBOARDS,

  // Payment Permissions (advertisers pay for and view their own reservations)
  PERMISSIONS.PAYMENTS_CREATE,
  PERMISSIONS.PAYMENTS_READ,
];
