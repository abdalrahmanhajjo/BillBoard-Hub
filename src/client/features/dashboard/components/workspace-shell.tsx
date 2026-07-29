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
import {
  isNavItemActive,
  type WorkspaceNavGroup,
} from '@/client/features/dashboard/components/workspace-nav';

type WorkspaceShellProps = {
  /** Grouped sidebar entries for the area this shell frames. */
  nav: WorkspaceNavGroup[];
  /** Where the brand block links to — each area's own landing route. */
  homeHref: string;
  /** Sub-label under the brand, and the header title before a route matches. */
  areaLabel: string;
  children: React.ReactNode;
};

/**
 * Persistent navigation frame shared by the advertiser and admin areas. Lives in
 * each area's layout so the sidebar keeps its state across navigations instead
 * of remounting per page, and so both areas cannot drift apart visually.
 */
export function WorkspaceShell({ nav, homeHref, areaLabel, children }: WorkspaceShellProps) {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession();
  const user = session?.user;

  const activeLabel = nav
    .flatMap((group) => group.items)
    .find((item) => isNavItemActive(item, pathname))?.label;

  return (
    <SidebarProvider
      // Pages inside the shell size themselves against the header, so its height
      // has to be readable as a variable rather than only as a utility class.
      style={{ '--header-height': '3.5rem' } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href={homeHref} />}>
                <span className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-lg">
                  <MonitorPlay className="size-4" aria-hidden />
                </span>
                <span className="grid text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Boardly</span>
                  <span className="text-muted-foreground truncate text-xs">{areaLabel}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {nav.map((group) => (
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

        <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <span className="text-sm font-medium">{activeLabel ?? areaLabel}</span>
          <div className="ml-auto">
            <ThemeModeToggle />
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
