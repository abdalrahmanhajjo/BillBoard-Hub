import Link from 'next/link';
import { ArrowUpRight, House } from 'lucide-react';
import { DashboardShell } from '@/client/features/dashboard/components/dashboard-shell';
import { DashboardLinkCard } from '@/client/features/dashboard/components/dashboard-link-card';
import { Button } from '@/client/ui/components/ui/button';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';

export function AdvertiserDashboardFeaturePage() {
  return (
    <DashboardShell
      title="Advertiser Dashboard"
      subtitle="Plan campaigns, upload creatives, and track bookings."
      actions={
        <Button
          variant="outline"
          render={<Link href={ADVERTISER_ROUTES.HOME} />}
          nativeButton={false}
          className="min-h-11 rounded-xl border-zinc-200 bg-white px-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md active:translate-y-0"
        >
          <House className="size-4" aria-hidden />
          Website home
          <ArrowUpRight className="size-3.5 text-zinc-400" aria-hidden />
        </Button>
      }
    >
      <DashboardLinkCard
        title="Marketplace"
        description="Browse and inspect available billboard inventory."
        href="/user/advertiser/billboards"
      />
      <DashboardLinkCard
        title="Bookings"
        description="Create and track billboard booking requests."
        href="/user/advertiser/bookings"
      />
      <DashboardLinkCard
        title="Campaigns"
        description="Manage campaign lifecycle and status."
        href="/user/advertiser/campaigns"
      />
      <DashboardLinkCard
        title="Creatives"
        description="Upload and organize campaign creatives."
        href="/user/advertiser/creatives"
      />
    </DashboardShell>
  );
}
