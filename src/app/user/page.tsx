import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { ROLE_LANDING_ROUTES } from '@/shared/constants/routes';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === USER_ROLES.ADMIN) {
    redirect(ROLE_LANDING_ROUTES.admin);
  }

  if (role === USER_ROLES.ADVERTISER) {
    redirect(ROLE_LANDING_ROUTES.advertiser);
  }

  redirect('/login');
}
