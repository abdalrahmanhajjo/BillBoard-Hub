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
  // Company-side finance. Nested under the existing /user/admin prefix so the
  // middleware guard and admin shell apply without a new protected root.
  FINANCE: '/user/admin/finance',
  FINANCE_EXPENSES: '/user/admin/finance/expenses',
  FINANCE_PAYMENTS: '/user/admin/finance/payments',
  FINANCE_REPORTS: '/user/admin/finance/reports',
  OWNERS: '/user/admin/owners',
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
