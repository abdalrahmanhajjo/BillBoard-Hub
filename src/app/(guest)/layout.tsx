import { auth } from '@/auth';
import { ADMIN_ROUTES, ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { redirect } from 'next/navigation';

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
