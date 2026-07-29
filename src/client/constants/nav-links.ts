import type { NavItem } from '@/client/types/nav-item';
import { ADMIN_ROUTES, ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { Home, LayoutDashboard, ListFilterIcon, User } from 'lucide-react';

export const ADMIN_NAV_LINKS: NavItem[] = [
  {
    title: 'Dashboard',
    to: ADMIN_ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: 'Campaigns',
    to: ADMIN_ROUTES.CAMPAIGNS,
    icon: ListFilterIcon,
  },
  {
    title: 'Bookings',
    to: ADMIN_ROUTES.BOOKINGS,
    icon: ListFilterIcon,
  },
  {
    title: 'Advertisers',
    to: ADMIN_ROUTES.ADVERTISERS,
    icon: User,
  },
  {
    title: 'Billboards',
    to: ADMIN_ROUTES.BILLBOARDS,
    icon: User,
  },
] as const;

export const ADVERTISER_NAV_LINKS: NavItem[] = [
  {
    title: 'Browse Billboards',
    to: ADVERTISER_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Campaigns',
    to: ADVERTISER_ROUTES.CAMPAIGNS,
    icon: ListFilterIcon,
  },
  {
    title: 'Bookings',
    to: ADVERTISER_ROUTES.BOOKINGS,
    icon: ListFilterIcon,
  },
] as const;
