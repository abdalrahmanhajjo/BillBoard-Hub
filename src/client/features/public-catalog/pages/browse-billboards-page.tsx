import type { PublicBillboard } from '@/shared/types/billboard';
import { BillboardGrid } from '@/client/features/public-catalog/components/billboard-grid';

type BrowseBillboardsPageProps = {
  billboards: PublicBillboard[];
  error?: string | null;
  query?: string;
};

export function BrowseBillboardsPage({ billboards, error, query }: BrowseBillboardsPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Browse billboards</h1>
        <p className="text-sm text-zinc-600">
          {query
            ? `Showing results for “${query}”.`
            : 'Explore available advertising locations and compare them before making a reservation.'}
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <BillboardGrid
          billboards={billboards}
          emptyMessage={query ? `No billboards match “${query}”.` : 'No billboards available yet.'}
        />
      )}
    </section>
  );
}
