const ADMIN_ROUTES = {
  DASHBOARD: '/user/admin/dashboard',
  REPORTS: '/user/admin/reports',
  BILLBOARDS: '/user/admin/billboards',
  PLAYLISTS: '/user/admin/playlists',
  SCHEDULES: '/user/admin/schedules',
  PLAYBACK: '/user/admin/playback',
  CAMPAIGNS: '/user/admin/campaigns',
  BOOKINGS: '/user/admin/bookings',
  IMPRESSIONS: '/user/admin/impressions',
  ADVERTISERS: '/user/admin/advertisers',
  USERS: '/user/admin/users',
  SETTINGS: '/user/admin/settings',
} as const;

const ADVERTISER_ROUTES = {
  HOME: '/',
  DASHBOARD: '/user/advertiser',
  BILLBOARDS: '/user/advertiser/billboards',
  CAMPAIGNS: '/user/advertiser/campaigns',
  BOOKINGS: '/user/advertiser/bookings',
  CREATIVES: '/user/advertiser/creatives',
  INVOICES: '/user/advertiser/invoices',
  REPORTS: '/user/advertiser/reports',
  PROFILE: '/user/advertiser/profile',
  SETTINGS: '/user/advertiser/settings',
} as const;

const ROLE_LANDING_ROUTES = {
  admin: ADMIN_ROUTES.DASHBOARD,
  advertiser: '/',
} as const;

export { ADMIN_ROUTES, ADVERTISER_ROUTES, ROLE_LANDING_ROUTES };
