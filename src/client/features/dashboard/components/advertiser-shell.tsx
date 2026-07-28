'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MonitorPlay } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/client/ui/components/ui/sidebar';
import { Separator } from '@/client/ui/components/ui/separator';
import { NavUser } from '@/client/layouts/components/nav-user';
import { ThemeModeToggle } from '@/client/layouts/components/theme-mode-toggle';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import {
  ADVERTISER_NAV,
  isNavItemActive,
} from '@/client/features/dashboard/components/advertiser-nav';

type AdvertiserShellProps = {
  children: React.ReactNode;
};

/**
 * Persistent navigation frame for every advertiser route. Lives in the layout so
 * the sidebar keeps its state across navigations instead of remounting per page.
 */
export function AdvertiserShell({ children }: AdvertiserShellProps) {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession();
  const user = session?.user;

  const activeLabel = ADVERTISER_NAV.flatMap((group) => group.items).find((item) =>
    isNavItemActive(item, pathname),
  )?.label;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href={ADVERTISER_ROUTES.DASHBOARD} />}>
                <span className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-lg">
                  <MonitorPlay className="size-4" aria-hidden />
                </span>
                <span className="grid text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Boardly</span>
                  <span className="text-muted-foreground truncate text-xs">Advertiser</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {ADVERTISER_NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = isNavItemActive(item, pathname);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                        >
                          <item.icon aria-hidden />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Same component the admin sidebar uses, so the account block and its
            menu stay identical across both areas. */}
        <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <span className="text-sm font-medium">{activeLabel ?? 'Advertiser'}</span>
          <div className="ml-auto">
            <ThemeModeToggle />
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
