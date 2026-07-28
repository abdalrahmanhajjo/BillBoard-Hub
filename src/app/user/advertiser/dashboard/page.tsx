import { redirect } from 'next/navigation';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';

export default function AdvertiserDashboardAliasPage() {
  redirect(ADVERTISER_ROUTES.DASHBOARD);
}
