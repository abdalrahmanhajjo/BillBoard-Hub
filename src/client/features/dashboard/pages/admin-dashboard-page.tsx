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

export function AdminDashboardFeaturePage() {
  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Manage platform operations, users, inventory, and performance."
    >
      <Card
        title="Users"
        description="Manage platform users and access."
        href="/dashboard/admin/users"
      />
      <Card
        title="Advertisers"
        description="Review and manage advertiser accounts."
        href="/dashboard/admin/advertisers"
      />
      <Card
        title="Billboards"
        description="Configure static and digital billboard inventory."
        href="/dashboard/admin/billboards"
      />
      <Card
        title="Bookings"
        description="Review, approve, and track reservations."
        href="/dashboard/admin/bookings"
      />
      <Card
        title="Playlists"
        description="Order creatives into playlists for each digital screen."
        href="/dashboard/admin/playlists"
      />
      <Card
        title="Scheduling"
        description="Book playlists onto digital screens for specific time windows."
        href="/dashboard/admin/schedules"
      />
      <Card
        title="Playback"
        description="See what each digital screen is playing now and preview rotations."
        href="/dashboard/admin/playback"
      />
      <Card
        title="Impressions"
        description="Track how many times each creative has played across screens."
        href="/dashboard/admin/impressions"
      />
    </DashboardShell>
  );
}
