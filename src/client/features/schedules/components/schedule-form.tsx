'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import type { Billboard } from '@/shared/types/billboard';
import type { Playlist } from '@/shared/types/playlist';
import { scheduleClientService } from '@/client/features/schedules/services/schedule-client.service';

type ScheduleFormProps = {
  digitalBillboards: Billboard[];
  playlists: Playlist[];
  onCreated: () => void;
};

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm';

/** Converts a `datetime-local` value (local time) to a UTC ISO string. */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function ScheduleForm({ digitalBillboards, playlists, onCreated }: ScheduleFormProps) {
  const [billboardId, setBillboardId] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const billboardPlaylists = useMemo(
    () => playlists.filter((playlist) => playlist.billboardId === billboardId),
    [playlists, billboardId],
  );

  const handleBillboardChange = (value: string) => {
    setBillboardId(value);
    setPlaylistId('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!billboardId) {
      setError('Select a digital billboard.');
      return;
    }
    if (!playlistId) {
      setError('Select a playlist to schedule.');
      return;
    }

    const startAt = localInputToIso(startLocal);
    const endAt = localInputToIso(endLocal);
    if (!startAt || !endAt) {
      setError('Choose a valid start and end time.');
      return;
    }
    if (Date.parse(endAt) <= Date.parse(startAt)) {
      setError('The end time must be after the start time.');
      return;
    }

    startTransition(async () => {
      const result = await scheduleClientService.create({
        billboardId,
        playlistId,
        startAt,
        endAt,
      });
      if (!result.ok) {
        setError(result.error ?? 'Creating the schedule failed.');
        return;
      }
      setPlaylistId('');
      setStartLocal('');
      setEndLocal('');
      onCreated();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {digitalBillboards.length === 0 ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No digital billboards yet. Create a digital billboard before scheduling playlists.
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="schedule-billboard" className="text-sm font-medium">
          Digital billboard
        </label>
        <select
          id="schedule-billboard"
          value={billboardId}
          onChange={(event) => handleBillboardChange(event.target.value)}
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
        <label htmlFor="schedule-playlist" className="text-sm font-medium">
          Playlist
        </label>
        <select
          id="schedule-playlist"
          value={playlistId}
          onChange={(event) => setPlaylistId(event.target.value)}
          disabled={!billboardId}
          className={`${inputClassName} disabled:bg-zinc-50 disabled:text-zinc-400`}
        >
          <option value="">{billboardId ? 'Select a playlist…' : 'Choose a screen first'}</option>
          {billboardPlaylists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
        {billboardId && billboardPlaylists.length === 0 ? (
          <p className="text-xs text-amber-600">
            This screen has no playlists yet. Build one on the Playlists page first.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="schedule-start" className="text-sm font-medium">
            Starts
          </label>
          <input
            id="schedule-start"
            type="datetime-local"
            value={startLocal}
            onChange={(event) => setStartLocal(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="schedule-end" className="text-sm font-medium">
            Ends
          </label>
          <input
            id="schedule-end"
            type="datetime-local"
            value={endLocal}
            onChange={(event) => setEndLocal(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        Times use your local timezone and are stored in UTC. Windows on the same screen cannot
        overlap.
      </p>

      <button
        type="submit"
        disabled={isPending || digitalBillboards.length === 0}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Scheduling…' : 'Schedule playlist'}
      </button>
    </form>
  );
}
