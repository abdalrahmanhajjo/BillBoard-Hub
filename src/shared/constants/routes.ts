const ADMIN_ROUTES = {
  DASHBOARD: '/user/admin/dashboard',
  CAMPAIGNS: '/user/admin/campaigns',
  BOOKINGS: '/user/admin/bookings',
  ADVERTISERS: '/user/admin/advertisers',
} as const;

const ADVERTISER_ROUTES = {
  DASHBOARD: '/user/advertiser',
  CAMPAIGNS: '/user/advertiser/campaigns',
  BOOKINGS: '/user/advertiser/bookings',
  INVOICES: '/user/advertiser/invoices',
} as const;

export { ADMIN_ROUTES, ADVERTISER_ROUTES };
