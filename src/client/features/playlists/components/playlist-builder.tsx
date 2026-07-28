'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { PLAYLIST_STATUSES } from '@/shared/constants/playlist';
import type { Billboard } from '@/shared/types/billboard';
import type { Creative } from '@/shared/types/creative';
import type { PlaylistStatus } from '@/shared/types/playlist';
import { playlistClientService } from '@/client/features/playlists/services/playlist-client.service';
import { CreativeThumb } from '@/client/features/playlists/components/creative-thumb';

type PlaylistBuilderProps = {
  digitalBillboards: Billboard[];
  creatives: Creative[];
  onCreated: () => void;
};

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm';

export function PlaylistBuilder({ digitalBillboards, creatives, onCreated }: PlaylistBuilderProps) {
  const [billboardId, setBillboardId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PlaylistStatus>(PLAYLIST_STATUSES.DRAFT);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const creativesById = useMemo(
    () => new Map(creatives.map((creative) => [creative.id, creative])),
    [creatives],
  );
  const available = useMemo(
    () => creatives.filter((creative) => !selectedIds.includes(creative.id)),
    [creatives, selectedIds],
  );

  const move = (index: number, direction: -1 | 1) => {
    setSelectedIds((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!billboardId) {
      setError('Select a digital billboard.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Add at least one creative to the playlist.');
      return;
    }

    startTransition(async () => {
      const result = await playlistClientService.create({
        billboardId,
        name,
        creativeIds: selectedIds,
        status,
      });
      if (!result.ok) {
        setError(
          result.error ?? 'We could not create this playlist. Review the selections and try again.',
        );
        return;
      }
      setBillboardId('');
      setName('');
      setSelectedIds([]);
      setStatus(PLAYLIST_STATUSES.DRAFT);
      onCreated();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {digitalBillboards.length === 0 ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No digital billboards yet. Create a digital billboard before building a playlist.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="playlist-billboard" className="text-sm font-medium">
            Digital billboard
          </label>
          <select
            id="playlist-billboard"
            value={billboardId}
            onChange={(event) => setBillboardId(event.target.value)}
            className={inputClassName}
          >
            <option value="">Select a screen…</option>
            {digitalBillboards.map((billboard) => (
              <option key={billboard.id} value={billboard.id}>
                {billboard.name} — {billboard.location.city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="playlist-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="playlist-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PlaylistStatus)}
            className={inputClassName}
          >
            <option value={PLAYLIST_STATUSES.DRAFT}>Draft</option>
            <option value={PLAYLIST_STATUSES.ACTIVE}>Active</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="playlist-name" className="text-sm font-medium">
          Playlist name
        </label>
        <input
          id="playlist-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          placeholder="Morning rotation"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Playlist order ({selectedIds.length})</p>
        {selectedIds.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-500">
            Add creatives below — they play top to bottom.
          </p>
        ) : (
          <ol className="space-y-2">
            {selectedIds.map((creativeId, index) => {
              const creative = creativesById.get(creativeId);
              return (
                <li
                  key={creativeId}
                  className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-2"
                >
                  <span className="w-5 text-center text-xs font-semibold text-zinc-400">
                    {index + 1}
                  </span>
                  {creative ? (
                    <CreativeThumb
                      creative={creative}
                      className="h-10 w-14 shrink-0 rounded object-cover"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {creative?.name ?? 'Unknown creative'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === selectedIds.length - 1}
                      aria-label="Move down"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIds((prev) => prev.filter((id) => id !== creativeId))
                      }
                      aria-label="Remove"
                      className="rounded p-1 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Available creatives</p>
        {available.length === 0 ? (
          <p className="text-xs text-zinc-500">
            {creatives.length === 0
              ? 'No creatives available. Advertisers add these on their dashboard.'
              : 'All creatives are already in the playlist.'}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {available.map((creative) => (
              <li key={creative.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIds((prev) => [...prev, creative.id])}
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white py-1 pr-2.5 pl-1 text-xs font-medium transition-colors hover:border-blue-300"
                >
                  <CreativeThumb creative={creative} className="h-7 w-10 rounded object-cover" />
                  <span className="max-w-32 truncate">{creative.name}</span>
                  <Plus className="size-3.5 text-blue-600" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || digitalBillboards.length === 0}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Creating…' : 'Create playlist'}
      </button>
    </form>
  );
}
