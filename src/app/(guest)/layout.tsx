import { auth } from '@/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROLE_LANDING_ROUTES } from '@/shared/constants/routes';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { PRIVATE_ROUTE_METADATA } from '@/shared/seo/metadata';

export const metadata: Metadata = PRIVATE_ROUTE_METADATA;

export default async function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user?.id && session.user.isActive) {
    if (session.user.role === USER_ROLES.ADMIN) {
      redirect(ROLE_LANDING_ROUTES.admin);
    } else if (session.user.role === USER_ROLES.ADVERTISER) {
      redirect(ROLE_LANDING_ROUTES.advertiser);
    }
  }
  return <>{children}</>;
}
