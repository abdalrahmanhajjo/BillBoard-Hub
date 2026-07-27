import type { ScheduleState } from '@/shared/types/schedule';

const STATE_STYLES: Record<ScheduleState, { label: string; className: string }> = {
  live: { label: 'Live', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  upcoming: { label: 'Upcoming', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  ended: { label: 'Ended', className: 'border-zinc-200 bg-zinc-100 text-zinc-500' },
  cancelled: { label: 'Cancelled', className: 'border-red-200 bg-red-50 text-red-600' },
};

export function ScheduleStateBadge({ state }: { state: ScheduleState }) {
  const { label, className } = STATE_STYLES[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {state === 'live' ? (
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
