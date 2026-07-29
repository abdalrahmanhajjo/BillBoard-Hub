import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { BillboardStatus } from '@/shared/types/billboard';

const STATUS_STYLES: Record<BillboardStatus, string> = {
  [BILLBOARD_STATUSES.AVAILABLE]: 'border-green-200 bg-green-50 text-green-700',
  [BILLBOARD_STATUSES.RESERVED]: 'border-amber-200 bg-amber-50 text-amber-700',
  [BILLBOARD_STATUSES.OCCUPIED]: 'border-red-200 bg-red-50 text-red-700',
  [BILLBOARD_STATUSES.MAINTENANCE]: 'border-zinc-200 bg-zinc-100 text-zinc-700',
};

export function BillboardStatusBadge({ status }: { status: BillboardStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
