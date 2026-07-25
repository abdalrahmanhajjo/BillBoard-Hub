import { CREATIVE_STATUSES } from '@/shared/constants/creative';
import type { CreativeStatus } from '@/shared/types/creative';

const STATUS_STYLES: Record<CreativeStatus, string> = {
  [CREATIVE_STATUSES.PENDING]: 'border-amber-200 bg-amber-50 text-amber-700',
  [CREATIVE_STATUSES.APPROVED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [CREATIVE_STATUSES.REJECTED]: 'border-red-200 bg-red-50 text-red-700',
};

export function CreativeStatusBadge({ status }: { status: CreativeStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
