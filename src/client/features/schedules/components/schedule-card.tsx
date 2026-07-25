'use client';

import { CalendarClock, Monitor, Trash2, Ban } from 'lucide-react';
import type { Schedule } from '@/shared/types/schedule';
import { ScheduleStateBadge } from '@/client/features/schedules/components/schedule-state-badge';
import {
  formatLocalDateTime,
  getScheduleState,
} from '@/client/features/schedules/utils/schedule-state';

type ScheduleCardProps = {
  schedule: Schedule;
  billboardName: string;
  playlistName: string;
  now: number;
  onCancel: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  pendingCancel: boolean;
  pendingDelete: boolean;
};

export function ScheduleCard({
  schedule,
  billboardName,
  playlistName,
  now,
  onCancel,
  onDelete,
  pendingCancel,
  pendingDelete,
}: ScheduleCardProps) {
  const state = getScheduleState(schedule, now);
  const canCancel = state === 'upcoming' || state === 'live';

  return (
    <article className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-zinc-900">{playlistName}</p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Monitor className="size-3.5 shrink-0" />
            <span className="truncate">{billboardName}</span>
          </p>
        </div>
        <ScheduleStateBadge state={state} />
      </div>

      <p className="flex items-center gap-1.5 text-xs text-zinc-600">
        <CalendarClock className="size-3.5 shrink-0 text-zinc-400" />
        <span>
          {formatLocalDateTime(schedule.startAt)} → {formatLocalDateTime(schedule.endAt)}
        </span>
      </p>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
        {canCancel ? (
          <button
            type="button"
            onClick={() => onCancel(schedule)}
            disabled={pendingCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            <Ban className="size-3.5" />
            {pendingCancel ? 'Cancelling…' : 'Cancel'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(schedule)}
          disabled={pendingDelete}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          {pendingDelete ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
