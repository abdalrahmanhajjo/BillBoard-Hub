import Link from 'next/link';

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card ring-foreground/10 hover:ring-foreground/20 rounded-xl p-5 ring-1 transition hover:shadow-sm"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </Link>
  );
}

export function AdvertiserDashboardFeaturePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Advertiser Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Plan campaigns, upload creatives, and track bookings.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          title="Marketplace"
          description="Browse and inspect available billboard inventory."
          href="/dashboard/advertiser/billboards"
        />
        <DashboardCard
          title="Reservations"
          description="Create and track billboard reservation requests."
          href="/dashboard/advertiser/reservations"
        />
        <DashboardCard
          title="Campaigns"
          description="Manage campaign lifecycle and status."
          href="/dashboard/advertiser/campaigns"
        />
        <DashboardCard
          title="Creatives"
          description="Upload and organize campaign creatives."
          href="/dashboard/advertiser/creatives"
        />
      </div>
    </section>
  );
}
