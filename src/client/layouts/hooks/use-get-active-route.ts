'use client';

import { ADMIN_NAV_LINKS, ADVERTISER_NAV_LINKS } from '@/client/constants/nav-links';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const ALL_ROUTES = [...ADMIN_NAV_LINKS, ...ADVERTISER_NAV_LINKS];

export function useGetActiveRoute() {
  const pathname = usePathname();

  const activeRoute = useMemo(() => {
    return [...ALL_ROUTES]
      .sort((a, b) => b.to.length - a.to.length)
      .find((route) => (route.to === '/' ? pathname === '/' : pathname.startsWith(route.to)));
  }, [pathname]);

  return activeRoute || null;
}
