'use client';

import { Monitor, Trash2 } from 'lucide-react';
import { PLAYLIST_STATUSES } from '@/shared/constants/playlist';
import type { AdCreative as Creative } from '@/shared/types/ad-creative';
import type { Playlist } from '@/shared/types/playlist';
import { CreativeThumb } from '@/client/features/playlists/components/creative-thumb';

type PlaylistCardProps = {
  playlist: Playlist;
  billboardName: string;
  creativesById: Map<string, Creative>;
  onDelete: (playlist: Playlist) => void;
  pendingDelete?: boolean;
};

export function PlaylistCard({
  playlist,
  billboardName,
  creativesById,
  onDelete,
  pendingDelete,
}: PlaylistCardProps) {
  const isActive = playlist.status === PLAYLIST_STATUSES.ACTIVE;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-900">{playlist.name}</h3>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-500">
            <Monitor className="size-3.5" aria-hidden />
            {billboardName}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
            isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-zinc-200 bg-zinc-100 text-zinc-600'
          }`}
        >
          {playlist.status}
        </span>
      </div>

      <ol className="mt-3 flex flex-wrap gap-2">
        {playlist.creativeIds.map((creativeId, index) => {
          const creative = creativesById.get(creativeId);
          return (
            <li key={`${creativeId}-${index}`} className="relative">
              {creative ? (
                <CreativeThumb
                  creative={creative}
                  className="h-12 w-16 rounded border border-zinc-200 object-cover"
                />
              ) : (
                <span className="flex h-12 w-16 items-center justify-center rounded border border-dashed border-zinc-300 text-[10px] text-zinc-400">
                  missing
                </span>
              )}
              <span className="absolute -top-1.5 -left-1.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {index + 1}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-400">{playlist.creativeIds.length} creatives</span>
        <button
          type="button"
          onClick={() => onDelete(playlist)}
          disabled={pendingDelete}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-60"
        >
          <Trash2 className="size-3.5" aria-hidden />
          {pendingDelete ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
