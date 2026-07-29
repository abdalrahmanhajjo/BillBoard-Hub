import {
  Building2,
  CalendarCheck,
  CalendarClock,
  LayoutDashboard,
  Layers3,
  MapPinned,
  Megaphone,
  MonitorPlay,
  Settings,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/shared/constants/routes';
import type { WorkspaceNavGroup } from '@/client/features/dashboard/components/workspace-nav';

/**
 * Grouped the same way as `ADVERTISER_NAV` so both areas read alike: an
 * overview group first, the operational modules in the middle, account last.
 */
export const ADMIN_NAV: WorkspaceNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard },
      { label: 'Reports', href: ADMIN_ROUTES.REPORTS, icon: TrendingUp },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Billboards', href: ADMIN_ROUTES.BILLBOARDS, icon: MapPinned },
      { label: 'Playlists', href: ADMIN_ROUTES.PLAYLISTS, icon: Layers3 },
      { label: 'Schedules', href: ADMIN_ROUTES.SCHEDULES, icon: CalendarClock },
      { label: 'Playback', href: ADMIN_ROUTES.PLAYBACK, icon: MonitorPlay },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { label: 'Campaigns', href: ADMIN_ROUTES.CAMPAIGNS, icon: Megaphone },
      { label: 'Reservations', href: ADMIN_ROUTES.BOOKINGS, icon: CalendarCheck },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Advertisers', href: ADMIN_ROUTES.ADVERTISERS, icon: Building2 },
      { label: 'Users', href: ADMIN_ROUTES.USERS, icon: UserRound },
    ],
  },
  {
    label: 'Account',
    items: [{ label: 'Settings', href: ADMIN_ROUTES.SETTINGS, icon: Settings }],
  },
];
