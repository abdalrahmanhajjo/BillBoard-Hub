import { SidebarTrigger } from '@/client/ui/components/ui/sidebar';
import { NotificationsMenu } from '@/client/features/dashboard/components/notifications-menu';
import { UserNav } from '@/client/features/dashboard/components/user-nav';
import type { DashboardUser } from '@/client/features/dashboard/types/dashboard-user';

export function DashboardTopbar({ user }: { user: DashboardUser }) {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-1.5">
        <NotificationsMenu />
        <UserNav user={user} />
      </div>
    </header>
  );
}
