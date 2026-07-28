import {
  CalendarCheck,
  FileImage,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Receipt,
  Settings,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';

export type AdvertiserNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The dashboard root matches only exactly; every other entry matches its subtree. */
  exact?: boolean;
};

export type AdvertiserNavGroup = {
  label: string;
  items: AdvertiserNavItem[];
};

export const ADVERTISER_NAV: AdvertiserNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: ADVERTISER_ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        exact: true,
      },
      { label: 'Reports', href: ADVERTISER_ROUTES.REPORTS, icon: TrendingUp },
    ],
  },
  {
    label: 'Advertising',
    items: [
      { label: 'Campaigns', href: ADVERTISER_ROUTES.CAMPAIGNS, icon: Megaphone },
      { label: 'Creatives', href: ADVERTISER_ROUTES.CREATIVES, icon: FileImage },
      { label: 'Billboards', href: ADVERTISER_ROUTES.BILLBOARDS, icon: MapPinned },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { label: 'Reservations', href: ADVERTISER_ROUTES.BOOKINGS, icon: CalendarCheck },
      { label: 'Invoices', href: ADVERTISER_ROUTES.INVOICES, icon: Receipt },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: ADVERTISER_ROUTES.PROFILE, icon: UserRound },
      { label: 'Settings', href: ADVERTISER_ROUTES.SETTINGS, icon: Settings },
    ],
  },
];

export function isNavItemActive(item: AdvertiserNavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
