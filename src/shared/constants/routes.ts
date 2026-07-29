const ADMIN_ROUTES = {
  DASHBOARD: '/user/admin/dashboard',
  CAMPAIGNS: '/user/admin/campaigns',
  BOOKINGS: '/user/admin/bookings',
  ADVERTISERS: '/user/admin/advertisers',
  BILLBOARDS: '/user/admin/billboards',
} as const;

const ADVERTISER_ROUTES = {
  HOME: '/',
  DASHBOARD: '/user/advertiser/dashboard',
  CAMPAIGNS: '/user/advertiser/campaigns',
  BOOKINGS: '/user/advertiser/bookings',
} as const;

const ROLE_LANDING_ROUTES = {
  admin: ADMIN_ROUTES.DASHBOARD,
  advertiser: '/',
} as const;

export { ADMIN_ROUTES, ADVERTISER_ROUTES, ROLE_LANDING_ROUTES };
