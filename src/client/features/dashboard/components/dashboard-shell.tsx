import type { ReactNode } from 'react';

import { SidebarProvider, SidebarInset } from '@/client/ui/components/ui/sidebar';
import { AppSidebar } from '@/client/features/dashboard/components/app-sidebar';
import { DashboardTopbar } from '@/client/features/dashboard/components/dashboard-topbar';
import type { DashboardUser } from '@/client/features/dashboard/types/dashboard-user';

type DashboardShellProps = {
  user: DashboardUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardTopbar user={user} />
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
