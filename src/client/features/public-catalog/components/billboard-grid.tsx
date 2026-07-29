import type { PublicBillboard } from '@/shared/types/billboard';
import { BillboardCard } from '@/client/features/public-catalog/components/billboard-card';

type BillboardGridProps = {
  billboards: PublicBillboard[];
  emptyMessage?: string;
};

export function BillboardGrid({
  billboards,
  emptyMessage = 'No billboards available yet.',
}: BillboardGridProps) {
  if (billboards.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {billboards.map((billboard) => (
        <li key={billboard.id}>
          <BillboardCard billboard={billboard} />
        </li>
      ))}
    </ul>
  );
}
