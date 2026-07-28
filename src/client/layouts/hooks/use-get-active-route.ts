'use client';

import { ADMIN_NAV_LINKS, ADVERTISER_NAV_LINKS } from '@/client/constants/nav-links';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const ALL_ROUTES = [...ADMIN_NAV_LINKS, ...ADVERTISER_NAV_LINKS];

export function useGetActiveRoute() {
  const pathname = usePathname();

  const activeRoute = useMemo(() => {
    return ALL_ROUTES.find((route) => pathname.startsWith(route.to));
  }, [pathname]);

  return activeRoute || null;
}
