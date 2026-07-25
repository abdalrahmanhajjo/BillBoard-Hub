'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { Billboard } from '@/shared/types/billboard';
import type { Schedule } from '@/shared/types/schedule';
import type { NowPlaying, RotationItem, RotationSummary } from '@/shared/types/rotation';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { scheduleClientService } from '@/client/features/schedules/services/schedule-client.service';
import { rotationClientService } from '@/client/features/rotation/services/rotation-client.service';
import { impressionClientService } from '@/client/features/impressions/services/impression-client.service';
import { RotationPlayer } from '@/client/features/rotation/components/rotation-player';
import {
  formatLocalDateTime,
  getScheduleState,
} from '@/client/features/schedules/utils/schedule-state';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdminPlaybackPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [selectedBillboardId, setSelectedBillboardId] = useState('');

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [nowLoading, setNowLoading] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);

  const [previewScheduleId, setPreviewScheduleId] = useState('');
  const [previewRotation, setPreviewRotation] = useState<RotationSummary | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadNowPlaying = useCallback(async (billboardId: string) => {
    if (!billboardId) {
      setNowPlaying(null);
      return;
    }
    setNowLoading(true);
    const result = await rotationClientService.getNowPlaying(billboardId);
    setNowLoading(false);
    setNowPlaying(result.ok ? ((result.data as NowPlaying | undefined) ?? null) : null);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [billboardsResult, schedulesResult] = await Promise.all([
        billboardClientService.list({ type: BILLBOARD_TYPES.DIGITAL }),
        scheduleClientService.list(),
      ]);
      if (!active) return;
      if (!billboardsResult.ok || !schedulesResult.ok) {
        setStatus('error');
        return;
      }
      const digital = (billboardsResult.data?.billboards as Billboard[] | undefined) ?? [];
      setBillboards(digital);
      setSchedules((schedulesResult.data?.schedules as Schedule[] | undefined) ?? []);
      setStatus('ready');
      const initialId = digital[0]?.id ?? '';
      setSelectedBillboardId(initialId);
      if (initialId) {
        await loadNowPlaying(initialId);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadNowPlaying]);

  const selectScreen = (billboardId: string) => {
    setSelectedBillboardId(billboardId);
    setLoggedCount(0);
    setPreviewScheduleId('');
    setPreviewRotation(null);
    setPreviewError(null);
    void loadNowPlaying(billboardId);
  };

  const schedulesForScreen = useMemo(
    () => schedules.filter((schedule) => schedule.billboardId === selectedBillboardId),
    [schedules, selectedBillboardId],
  );

  const recordLive = useCallback(
    (item: RotationItem) => {
      const rotation = nowPlaying?.rotation;
      if (!rotation) return;
      void impressionClientService
        .record(nowPlaying.billboardId, {
          creativeId: item.creativeId,
          playlistId: rotation.playlistId,
          scheduleId: rotation.scheduleId,
        })
        .then((result) => {
          if (result.ok) setLoggedCount((count) => count + 1);
        });
    },
    [nowPlaying],
  );

  const handlePreviewChange = async (scheduleId: string) => {
    setPreviewScheduleId(scheduleId);
    setPreviewRotation(null);
    setPreviewError(null);
    if (!scheduleId) return;
    const result = await rotationClientService.getScheduleRotation(scheduleId);
    if (!result.ok) {
      setPreviewError(result.error ?? 'Unable to load the rotation.');
      return;
    }
    setPreviewRotation((result.data?.rotation as RotationSummary | undefined) ?? null);
  };

  const liveRotation = nowPlaying?.playing ? nowPlaying.rotation : null;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Playback</h1>
        <p className="text-sm text-zinc-600">
          See what a digital screen is playing right now, and preview any schedule&apos;s rotation.
          The live player logs an impression each time a creative plays.
        </p>
      </header>

      {status === 'loading' ? <p className="text-sm text-zinc-600">Loading…</p> : null}
      {status === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Unable to load playback data.
        </p>
      ) : null}

      {status === 'ready' && billboards.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
          No digital billboards yet. Create one, build a playlist, and schedule it to see playback.
        </p>
      ) : null}

      {status === 'ready' && billboards.length > 0 ? (
        <>
          <div className="max-w-sm space-y-1">
            <label htmlFor="playback-screen" className="text-sm font-medium">
              Digital screen
            </label>
            <select
              id="playback-screen"
              value={selectedBillboardId}
              onChange={(event) => selectScreen(event.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {billboards.map((billboard) => (
                <option key={billboard.id} value={billboard.id}>
                  {billboard.name} — {billboard.location.city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Now playing</h2>
                <span className="text-xs text-zinc-500">{loggedCount} impressions logged</span>
              </div>
              {nowLoading ? (
                <p className="text-sm text-zinc-600">Checking the screen…</p>
              ) : liveRotation && liveRotation.items.length > 0 ? (
                <>
                  <p className="text-sm text-zinc-600">
                    Playing{' '}
                    <span className="font-medium text-zinc-900">{liveRotation.playlistName}</span>{' '}
                    until {formatLocalDateTime(liveRotation.endAt)}.
                  </p>
                  <RotationPlayer
                    key={liveRotation.scheduleId}
                    items={liveRotation.items}
                    onItemStart={recordLive}
                  />
                </>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-sm text-zinc-500">
                  Nothing scheduled on this screen right now.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-medium">Preview a schedule</h2>
              <select
                value={previewScheduleId}
                onChange={(event) => handlePreviewChange(event.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                aria-label="Schedule to preview"
              >
                <option value="">Select a schedule…</option>
                {schedulesForScreen.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {formatLocalDateTime(schedule.startAt)} → {formatLocalDateTime(schedule.endAt)}{' '}
                    ({getScheduleState(schedule)})
                  </option>
                ))}
              </select>
              {schedulesForScreen.length === 0 ? (
                <p className="text-xs text-zinc-500">No schedules for this screen yet.</p>
              ) : null}
              {previewError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {previewError}
                </p>
              ) : null}
              {previewRotation ? (
                previewRotation.items.length > 0 ? (
                  <RotationPlayer
                    key={previewRotation.scheduleId}
                    items={previewRotation.items}
                    autoPlay={false}
                  />
                ) : (
                  <p className="text-sm text-zinc-500">
                    This schedule&apos;s playlist has no creatives.
                  </p>
                )
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
