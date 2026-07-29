import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { ADVERTISER_ROUTES, ADMIN_ROUTES } from '@/shared/constants/routes';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === USER_ROLES.ADMIN) {
    redirect(ADMIN_ROUTES.DASHBOARD);
  }

  if (role === USER_ROLES.ADVERTISER) {
    redirect(ADVERTISER_ROUTES.DASHBOARD);
  }

  redirect('/login');
}
