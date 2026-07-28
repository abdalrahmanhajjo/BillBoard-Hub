import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  StoreIcon,
  MegaphoneIcon,
  ImagesIcon,
  CalendarCheckIcon,
  SettingsIcon,
} from 'lucide-react';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADVERTISER_NAV_ITEMS: DashboardNavItem[] = [
  { label: 'Dashboard', href: '/dashboard/advertiser', icon: LayoutDashboardIcon },
  { label: 'Marketplace', href: '/dashboard/advertiser/billboards', icon: StoreIcon },
  { label: 'Campaigns', href: '/dashboard/advertiser/campaigns', icon: MegaphoneIcon },
  { label: 'Creatives', href: '/dashboard/advertiser/creatives', icon: ImagesIcon },
  { label: 'My Reservations', href: '/dashboard/advertiser/reservations', icon: CalendarCheckIcon },
  { label: 'Settings', href: '/dashboard/advertiser/settings', icon: SettingsIcon },
];
