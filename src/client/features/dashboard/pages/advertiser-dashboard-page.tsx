import Link from 'next/link';
import { DashboardShell } from '@/client/features/dashboard/components/dashboard-shell';

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </Link>
  );
}

export function AdvertiserDashboardFeaturePage() {
  return (
    <DashboardShell
      title="Advertiser Dashboard"
      subtitle="Plan campaigns, upload creatives, and track bookings."
    >
      <Card
        title="Marketplace"
        description="Browse and inspect available billboard inventory."
        href="/dashboard/advertiser/billboards"
      />
      <Card
        title="Bookings"
        description="Create and track billboard booking requests."
        href="/dashboard/advertiser/bookings"
      />
      <Card
        title="Campaigns"
        description="Manage campaign lifecycle and status."
        href="/dashboard/advertiser/campaigns"
      />
      <Card
        title="Creatives"
        description="Upload and organize campaign creatives."
        href="/dashboard/advertiser/creatives"
      />
    </DashboardShell>
  );
}
