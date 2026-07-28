import * as React from 'react';
import { useSession } from 'next-auth/react';
import { NavMain } from './nav-main';
import type { NavItem } from '@/client/types/nav-item';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/client/ui/components/ui/sidebar';
import { ADMIN_NAV_LINKS, ADVERTISER_NAV_LINKS } from '@/client/constants/nav-links';
import { AppLoader } from './app-loader';
import { BrandLogo } from '@/client/features/home/components/brand-logo';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, status } = useSession();
  if (status === 'loading') {
    return <AppLoader />;
  }

  const user = data?.user;

  const navItems: NavItem[] = user?.role === 'admin' ? ADMIN_NAV_LINKS : ADVERTISER_NAV_LINKS;

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <BrandLogo showWordmark />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain navItems={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
