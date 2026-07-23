import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/shared/constants/user-roles';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === USER_ROLES.ADMIN) {
    redirect('/dashboard/admin');
  }

  if (role === USER_ROLES.ADVERTISER) {
    redirect('/dashboard/advertiser');
  }

  redirect('/login');
}
