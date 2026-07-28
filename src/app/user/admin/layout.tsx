import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { ROLE_LANDING_ROUTES } from '@/shared/constants/routes';
export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive) {
    redirect('/login');
  }

  if (session.user.role === USER_ROLES.ADVERTISER) {
    redirect(ROLE_LANDING_ROUTES.advertiser);
  }

  if (session.user.role !== USER_ROLES.ADMIN) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
