'use client';

import { ADMIN_ROUTES } from '@/shared/constants/routes';
import { ADMIN_NAV } from '@/client/features/dashboard/components/admin-nav';
import { WorkspaceShell } from '@/client/features/dashboard/components/workspace-shell';

type AdminShellProps = {
  children: React.ReactNode;
};

/** Admin binding of the shared workspace frame. */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <WorkspaceShell nav={ADMIN_NAV} homeHref={ADMIN_ROUTES.DASHBOARD} areaLabel="Admin">
      {children}
    </WorkspaceShell>
  );
}
