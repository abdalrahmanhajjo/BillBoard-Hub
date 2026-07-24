'use client';

import Link from 'next/link';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { Billboard, BillboardStatus } from '@/shared/types/billboard';
import { isBillboardBookable } from '@/shared/utils/billboard-availability';
import { BillboardStatusBadge } from '@/client/features/billboards/components/billboard-status-badge';

type BillboardInventoryTableProps = {
  billboards: Billboard[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onStatusChange?: (billboardId: string, status: BillboardStatus) => void;
  pendingStatusId?: string | null;
};

const STATUS_OPTIONS: { value: BillboardStatus; label: string }[] = [
  { value: BILLBOARD_STATUSES.AVAILABLE, label: 'Available' },
  { value: BILLBOARD_STATUSES.RESERVED, label: 'Reserved' },
  { value: BILLBOARD_STATUSES.OCCUPIED, label: 'Occupied' },
  { value: BILLBOARD_STATUSES.MAINTENANCE, label: 'Maintenance' },
];

export function BillboardInventoryTable({
  billboards,
  isLoading,
  error,
  emptyMessage = 'No billboards yet.',
  onStatusChange,
  pendingStatusId,
}: BillboardInventoryTableProps) {
  if (isLoading) {
    return <p className="text-sm text-zinc-600">Loading inventory…</p>;
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (billboards.length === 0) {
    return <p className="text-sm text-zinc-600">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Code</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Location</th>
            <th className="py-2 pr-4 font-medium">Monthly Price</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            {onStatusChange ? <th className="py-2 pr-4 font-medium">Change status</th> : null}
          </tr>
        </thead>
        <tbody>
          {billboards.map((billboard) => {
            const bookable = isBillboardBookable(billboard.status);

            return (
              <tr
                key={billboard.id}
                className={`border-b border-zinc-100 ${bookable ? '' : 'bg-zinc-50/60'}`}
              >
                <td className="py-2 pr-4">
                  <Link
                    href={`/dashboard/admin/billboards/${billboard.id}`}
                    className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                  >
                    {billboard.name}
                  </Link>
                </td>
                <td className="py-2 pr-4">{billboard.code}</td>
                <td className="py-2 pr-4 capitalize">{billboard.type}</td>
                <td className="py-2 pr-4">
                  {billboard.location.city}, {billboard.location.country}
                </td>
                <td className="py-2 pr-4">{billboard.monthlyPrice}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <BillboardStatusBadge status={billboard.status} />
                    {!bookable ? <span className="text-xs text-zinc-500">Unavailable</span> : null}
                  </div>
                </td>
                {onStatusChange ? (
                  <td className="py-2 pr-4">
                    <select
                      aria-label={`Change status for ${billboard.name}`}
                      value={billboard.status}
                      disabled={pendingStatusId === billboard.id}
                      onChange={(event) =>
                        onStatusChange(billboard.id, event.target.value as BillboardStatus)
                      }
                      className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
