import { AdminDashboardFeaturePage } from '@/client/features/dashboard/pages/admin-dashboard-page';
import { requireSession } from '@/server/http/controller-utils';

export default async function AdminDashboardPage() {
  const session = await requireSession();

  return <AdminDashboardFeaturePage user={session.user} />;
}
