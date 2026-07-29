'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';
import type { Billboard } from '@/shared/types/billboard';
import type { Playlist } from '@/shared/types/playlist';
import type { Schedule } from '@/shared/types/schedule';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { playlistClientService } from '@/client/features/playlists/services/playlist-client.service';
import { scheduleClientService } from '@/client/features/schedules/services/schedule-client.service';
import { ScheduleForm } from '@/client/features/schedules/components/schedule-form';
import { ScheduleCard } from '@/client/features/schedules/components/schedule-card';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdminSchedulesPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const loadAll = useCallback(async () => {
    const [billboardsResult, playlistsResult, schedulesResult] = await Promise.all([
      billboardClientService.list({ type: BILLBOARD_TYPES.DIGITAL }),
      playlistClientService.list(),
      scheduleClientService.list(),
    ]);

    if (!billboardsResult.ok || !playlistsResult.ok || !schedulesResult.ok) {
      setError('We could not load schedules. Try again.');
      setStatus('error');
      return;
    }

    setBillboards((billboardsResult.data?.billboards as Billboard[] | undefined) ?? []);
    setPlaylists((playlistsResult.data?.playlists as Playlist[] | undefined) ?? []);
    setSchedules((schedulesResult.data?.schedules as Schedule[] | undefined) ?? []);
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
          setError('We could not load schedules. Try again.');
          setStatus('error');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [loadAll]);

  // Keeps the live / upcoming / ended badges accurate as time passes.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const billboardsById = useMemo(
    () => new Map(billboards.map((billboard) => [billboard.id, billboard])),
    [billboards],
  );
  const playlistsById = useMemo(
    () => new Map(playlists.map((playlist) => [playlist.id, playlist])),
    [playlists],
  );

  const handleCancel = async (schedule: Schedule) => {
    if (!window.confirm('Cancel this schedule? The playlist will stop being programmed.')) return;
    setActionError(null);
    setCancellingId(schedule.id);
    const result = await scheduleClientService.update(schedule.id, {
      status: SCHEDULE_STATUSES.CANCELLED,
    });
    setCancellingId(null);
    if (!result.ok) {
      setActionError(
        result.error ?? 'We could not cancel this schedule. Refresh the page and try again.',
      );
      return;
    }
    await loadAll();
  };

  const handleDelete = async (schedule: Schedule) => {
    if (
      !window.confirm(
        'Delete this schedule permanently? The playlist will no longer run during this time window.',
      )
    )
      return;
    setActionError(null);
    setDeletingId(schedule.id);
    const result = await scheduleClientService.remove(schedule.id);
    setDeletingId(null);
    if (!result.ok) {
      setActionError(
        result.error ?? 'We could not delete this schedule. Refresh the page and try again.',
      );
      return;
    }
    await loadAll();
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Scheduling</h1>
        <p className="text-sm text-zinc-600">
          Book playlists onto digital screens for specific time windows. The platform prevents
          overlapping bookings on the same screen.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Schedule a playlist</h2>
          {status === 'loading' ? (
            <p className="text-sm text-zinc-600">Loading…</p>
          ) : (
            <ScheduleForm
              digitalBillboards={billboards}
              playlists={playlists}
              onCreated={loadAll}
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Booked schedules</h2>
          {actionError ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {actionError}
            </p>
          ) : null}

          {status === 'loading' ? (
            <p className="text-sm text-zinc-600">Loading schedules…</p>
          ) : null}

          {status === 'error' ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}

          {status === 'ready' && schedules.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
              No schedules yet. Book a playlist onto a screen to get started.
            </p>
          ) : null}

          {status === 'ready' && schedules.length > 0 ? (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  billboardName={billboardsById.get(schedule.billboardId)?.name ?? 'Unknown screen'}
                  playlistName={playlistsById.get(schedule.playlistId)?.name ?? 'Unknown playlist'}
                  now={now}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  pendingCancel={cancellingId === schedule.id}
                  pendingDelete={deletingId === schedule.id}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
