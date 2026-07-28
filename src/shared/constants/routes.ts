const ADMIN_ROUTES = {
  DASHBOARD: '/user/admin/dashboard',
  CAMPAIGNS: '/user/admin/campaigns',
  BOOKINGS: '/user/admin/bookings',
  ADVERTISERS: '/user/admin/advertisers',
  BILLBOARDS: '/user/admin/billboards',
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
