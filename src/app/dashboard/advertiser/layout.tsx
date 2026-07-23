import { auth } from '@/auth';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { redirect } from 'next/navigation';

export default async function AdvertiserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== USER_ROLES.ADVERTISER) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
