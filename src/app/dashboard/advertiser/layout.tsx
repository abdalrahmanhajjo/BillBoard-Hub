import { auth } from '@/auth';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/client/features/dashboard/components/dashboard-shell';

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

  return (
    <DashboardShell
      user={{
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email ?? '',
      }}
    >
      {children}
    </DashboardShell>
  );
}
