import type { Billboard } from '@/shared/types/billboard';

type BillboardResultsGridProps = {
  billboards: Billboard[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
};

export function BillboardResultsGrid({
  billboards,
  isLoading,
  error,
  emptyMessage,
}: BillboardResultsGridProps) {
  if (isLoading) {
    return <p className="text-sm text-zinc-600">Loading billboards…</p>;
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (billboards.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {billboards.map((billboard) => (
        <li key={billboard.id} className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm font-medium text-zinc-900">{billboard.name}</p>
          <p className="text-xs text-zinc-500">{billboard.code}</p>
          <p className="mt-2 text-sm text-zinc-700">
            {billboard.location.address}, {billboard.location.city}, {billboard.location.country}
          </p>
          <p className="mt-2 text-xs tracking-wide text-zinc-500 uppercase">{billboard.type}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            ${billboard.monthlyPrice.toLocaleString()}/mo
          </p>
          <p className="mt-1 text-xs text-zinc-500">{billboard.status}</p>
        </li>
      ))}
    </ul>
  );
}
