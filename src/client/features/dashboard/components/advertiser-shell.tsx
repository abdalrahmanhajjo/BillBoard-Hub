'use client';

import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { ADVERTISER_NAV } from '@/client/features/dashboard/components/advertiser-nav';
import { WorkspaceShell } from '@/client/features/dashboard/components/workspace-shell';

type AdvertiserShellProps = {
  children: React.ReactNode;
};

/** Advertiser binding of the shared workspace frame. */
export function AdvertiserShell({ children }: AdvertiserShellProps) {
  return (
    <WorkspaceShell
      nav={ADVERTISER_NAV}
      homeHref={ADVERTISER_ROUTES.DASHBOARD}
      areaLabel="Advertiser"
    >
      {children}
    </WorkspaceShell>
  );
}
