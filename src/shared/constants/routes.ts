const ADMIN_ROUTES = {
  DASHBOARD: '/user/admin/dashboard',
  CAMPAIGNS: '/user/admin/campaigns',
  BOOKINGS: '/user/admin/bookings',
  ADVERTISERS: '/user/admin/advertisers',
  BILLBOARDS: '/user/admin/billboards',
} as const;

const ADVERTISER_ROUTES = {
  DASHBOARD: '/user/advertiser/dashboard',
  CAMPAIGNS: '/user/advertiser/campaigns',
  BOOKINGS: '/user/advertiser/bookings',
  INVOICES: '/user/advertiser/invoices',
} as const;

export { ADMIN_ROUTES, ADVERTISER_ROUTES };
