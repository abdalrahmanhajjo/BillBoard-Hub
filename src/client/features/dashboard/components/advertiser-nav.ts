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
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import {
  isNavItemActive,
  type WorkspaceNavGroup,
  type WorkspaceNavItem,
} from '@/client/features/dashboard/components/workspace-nav';

export type AdvertiserNavItem = WorkspaceNavItem;
export type AdvertiserNavGroup = WorkspaceNavGroup;

export const ADVERTISER_NAV: WorkspaceNavGroup[] = [
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

export { isNavItemActive };
