import { auth } from '@/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { PRIVATE_ROUTE_METADATA } from '@/shared/seo/metadata';
import { ADVERTISER_ROUTES, ADMIN_ROUTES } from '@/shared/constants/routes';

export const metadata: Metadata = PRIVATE_ROUTE_METADATA;

export default async function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user?.id && session.user.isActive) {
    if (session.user.role === USER_ROLES.ADMIN) {
      redirect(ADMIN_ROUTES.DASHBOARD);
    } else if (session.user.role === USER_ROLES.ADVERTISER) {
      redirect(ADVERTISER_ROUTES.DASHBOARD);
    }
  }
  return <>{children}</>;
}
