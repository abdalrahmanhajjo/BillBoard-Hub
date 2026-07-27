'use client';
import type { NavItem } from '@/client/types/nav-item';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/client/ui/components/ui/sidebar';
import Link from 'next/link';
import { useGetActiveRoute } from '../hooks/use-get-active-route';

const activeItemClassName = 'bg-primary text-primary-foreground';

interface NavMainProps extends React.ComponentProps<'div'> {
  navItems: NavItem[];
}

export function NavMain({ navItems }: NavMainProps) {
  const activeRoute = useGetActiveRoute();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className={activeRoute?.to === item.to ? activeItemClassName : ''}
              >
                <Link href={item.to} className="flex items-center gap-2">
                  {item.icon ? <item.icon className="size-5!" /> : null}
                  <span className="text-base font-semibold">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
