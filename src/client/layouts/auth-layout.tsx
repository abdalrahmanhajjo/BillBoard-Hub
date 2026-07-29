'use client';
import { AppLoader } from './components/app-loader';
import { SidebarInset, SidebarProvider } from '@/client/ui/components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from './components/site-header';
import { useSession } from 'next-auth/react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status === 'loading') {
    return <AppLoader />;
  }
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="mt-0!">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
