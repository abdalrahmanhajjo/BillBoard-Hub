'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { Billboard } from '@/shared/types/billboard';
import type { Creative } from '@/shared/types/creative';
import type { Playlist } from '@/shared/types/playlist';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';
import { playlistClientService } from '@/client/features/playlists/services/playlist-client.service';
import { PlaylistBuilder } from '@/client/features/playlists/components/playlist-builder';
import { PlaylistCard } from '@/client/features/playlists/components/playlist-card';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdminPlaylistsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [billboardsResult, creativesResult, playlistsResult] = await Promise.all([
      billboardClientService.list({ type: BILLBOARD_TYPES.DIGITAL }),
      creativeClientService.list(),
      playlistClientService.list(),
    ]);

    if (!billboardsResult.ok || !creativesResult.ok || !playlistsResult.ok) {
      setError('Unable to load playlist data.');
      setStatus('error');
      return;
    }

    setBillboards((billboardsResult.data?.billboards as Billboard[] | undefined) ?? []);
    setCreatives((creativesResult.data?.creatives as Creative[] | undefined) ?? []);
    setPlaylists((playlistsResult.data?.playlists as Playlist[] | undefined) ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await loadAll();
      } catch {
        if (active) {
          setError('Unable to load playlist data.');
          setStatus('error');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [loadAll]);

  const creativesById = useMemo(
    () => new Map(creatives.map((creative) => [creative.id, creative])),
    [creatives],
  );
  const billboardsById = useMemo(
    () => new Map(billboards.map((billboard) => [billboard.id, billboard])),
    [billboards],
  );

  const handleDelete = async (playlist: Playlist) => {
    if (!window.confirm(`Delete playlist "${playlist.name}"?`)) return;
    setActionError(null);
    setPendingId(playlist.id);
    const result = await playlistClientService.remove(playlist.id);
    setPendingId(null);
    if (!result.ok) {
      setActionError(result.error ?? 'Deleting the playlist failed.');
      return;
    }
    await loadAll();
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Playlists</h1>
        <p className="text-sm text-zinc-600">
          Program your digital screens by ordering creatives into playlists. The screen rotates
          through a playlist top to bottom.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Build a playlist</h2>
          {status === 'loading' ? (
            <p className="text-sm text-zinc-600">Loading…</p>
          ) : (
            <PlaylistBuilder
              digitalBillboards={billboards}
              creatives={creatives}
              onCreated={loadAll}
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Existing playlists</h2>
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          ) : null}

          {status === 'loading' ? (
            <p className="text-sm text-zinc-600">Loading playlists…</p>
          ) : null}

          {status === 'error' ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {status === 'ready' && playlists.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
              No playlists yet. Build one to program a digital screen.
            </p>
          ) : null}

          {status === 'ready' && playlists.length > 0 ? (
            <div className="grid gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  billboardName={billboardsById.get(playlist.billboardId)?.name ?? 'Unknown screen'}
                  creativesById={creativesById}
                  onDelete={handleDelete}
                  pendingDelete={pendingId === playlist.id}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
