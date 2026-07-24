'use client';

import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { Billboard, BillboardStatus } from '@/shared/types/billboard';
import { BillboardStatusBadge } from '@/client/features/billboards/components/billboard-status-badge';

type BillboardInventoryTableProps = {
  billboards: Billboard[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onStatusChange?: (billboardId: string, status: BillboardStatus) => void;
  onEdit?: (billboard: Billboard) => void;
  onDelete?: (billboard: Billboard) => void;
  pendingStatusId?: string | null;
};

const STATUS_OPTIONS: { value: BillboardStatus; label: string }[] = [
  { value: BILLBOARD_STATUSES.AVAILABLE, label: 'Available' },
  { value: BILLBOARD_STATUSES.RESERVED, label: 'Reserved' },
  { value: BILLBOARD_STATUSES.OCCUPIED, label: 'Occupied' },
  { value: BILLBOARD_STATUSES.MAINTENANCE, label: 'Maintenance' },
];

function SkeletonRows() {
  return (
    <div className="space-y-px rounded-lg border border-slate-200 bg-slate-200">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 bg-white px-4 py-4">
          {Array.from({ length: 6 }).map((__, cell) => (
            <div key={cell} className="h-4 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function BillboardInventoryTable({
  billboards,
  isLoading,
  error,
  emptyMessage = 'No billboards yet.',
  onStatusChange,
  onEdit,
  onDelete,
  pendingStatusId,
}: BillboardInventoryTableProps) {
  if (isLoading) return <SkeletonRows />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (billboards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
        <p className="font-medium text-slate-800">No inventory found</p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold text-slate-600">
              <th className="w-10 px-4 py-3">
                <input aria-label="Select all billboards" type="checkbox" className="size-3.5" />
              </th>
              <th className="px-2 py-3">ID &amp; Photo</th>
              <th className="px-2 py-3">Location</th>
              <th className="px-2 py-3">City</th>
              <th className="px-2 py-3">Format</th>
              <th className="px-2 py-3">Size</th>
              <th className="px-2 py-3">Price (USD)</th>
              <th className="px-2 py-3">Availability</th>
              <th className="px-2 py-3">Status</th>
              <th className="w-12 px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {billboards.map((billboard) => (
              <tr
                key={billboard.id}
                className="group border-b border-slate-100 text-slate-700 transition-colors last:border-b-0 hover:bg-blue-50/35"
              >
                <td className="px-4 py-3">
                  <input
                    aria-label={`Select ${billboard.name}`}
                    type="checkbox"
                    className="size-3.5"
                  />
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-11 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-sky-100 to-slate-200">
                      {billboard.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={billboard.images[0]}
                          alt={`${billboard.name} billboard`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-end justify-center bg-[linear-gradient(150deg,#dbeafe_0%,#bae6fd_46%,#64748b_47%,#334155_65%,#e2e8f0_66%)] pb-1 text-[8px] font-bold text-white">
                          AD
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/admin/billboards/${billboard.id}`}
                        className="block max-w-28 truncate font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {billboard.code}
                      </Link>
                      <span className="text-[10px] text-slate-400">#{billboard.id.slice(-6)}</span>
                    </div>
                  </div>
                </td>
                <td className="max-w-44 px-2 py-3">
                  <p className="truncate font-medium text-slate-800">{billboard.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {billboard.location.address}
                  </p>
                </td>
                <td className="px-2 py-3">{billboard.location.city}</td>
                <td className="px-2 py-3 capitalize">
                  <span className="block">{billboard.type}</span>
                  <span className="text-[10px] text-slate-500">Billboard</span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap tabular-nums">
                  {billboard.dimensions.width}m × {billboard.dimensions.height}m
                </td>
                <td className="px-2 py-3 font-medium whitespace-nowrap text-slate-800 tabular-nums">
                  ${billboard.monthlyPrice.toLocaleString()} / month
                </td>
                <td className="px-2 py-3">
                  <select
                    aria-label={`Change availability for ${billboard.name}`}
                    value={billboard.status}
                    disabled={!onStatusChange || pendingStatusId === billboard.id}
                    onChange={(event) =>
                      onStatusChange?.(billboard.id, event.target.value as BillboardStatus)
                    }
                    className="max-w-28 bg-transparent text-[11px] font-medium outline-none disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {billboard.status === BILLBOARD_STATUSES.AVAILABLE
                      ? 'From today'
                      : 'Schedule restricted'}
                  </p>
                </td>
                <td className="px-2 py-3">
                  <BillboardStatusBadge status={billboard.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit?.(billboard)}
                      className="rounded p-1.5 text-slate-500 hover:bg-blue-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500"
                      aria-label={`Edit ${billboard.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(billboard)}
                      className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
                      aria-label={`Archive ${billboard.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <MoreHorizontal className="size-3.5 text-slate-400" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500">
        <span>
          Showing 1 to {billboards.length} of {billboards.length.toLocaleString()} results
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className={`size-7 rounded border text-xs ${
                page === 1
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
