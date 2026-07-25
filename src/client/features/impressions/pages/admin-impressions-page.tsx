'use client';

import { useEffect, useMemo, useState } from 'react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { Billboard } from '@/shared/types/billboard';
import type { ImpressionAnalytics } from '@/shared/types/impression';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { impressionClientService } from '@/client/features/impressions/services/impression-client.service';
import { formatLocalDateTime } from '@/client/features/schedules/utils/schedule-state';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdminImpressionsPage() {
  const [analytics, setAnalytics] = useState<ImpressionAnalytics | null>(null);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [filterBillboardId, setFilterBillboardId] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await billboardClientService.list({ type: BILLBOARD_TYPES.DIGITAL });
      if (!active) return;
      if (result.ok) {
        setBillboards((result.data?.billboards as Billboard[] | undefined) ?? []);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      setStatus('loading');
      const result = await impressionClientService.getAnalytics(
        filterBillboardId ? { billboardId: filterBillboardId } : {},
      );
      if (!active) return;
      if (!result.ok) {
        setStatus('error');
        return;
      }
      setAnalytics((result.data as ImpressionAnalytics | undefined) ?? null);
      setStatus('ready');
    })();
    return () => {
      active = false;
    };
  }, [filterBillboardId]);

  const billboardsById = useMemo(
    () => new Map(billboards.map((billboard) => [billboard.id, billboard])),
    [billboards],
  );
  const creativeNameById = useMemo(
    () => new Map((analytics?.byCreative ?? []).map((stat) => [stat.creativeId, stat.name])),
    [analytics],
  );
  const maxCount = useMemo(
    () => Math.max(1, ...(analytics?.byCreative ?? []).map((stat) => stat.count)),
    [analytics],
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Impressions</h1>
          <p className="text-sm text-zinc-600">
            Playback analytics — how many times each creative has played across your digital
            screens.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-1">
          <label htmlFor="impressions-screen" className="text-sm font-medium">
            Filter by screen
          </label>
          <select
            id="impressions-screen"
            value={filterBillboardId}
            onChange={(event) => setFilterBillboardId(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All digital screens</option>
            {billboards.map((billboard) => (
              <option key={billboard.id} value={billboard.id}>
                {billboard.name} — {billboard.location.city}
              </option>
            ))}
          </select>
        </div>
      </header>

      {status === 'loading' ? <p className="text-sm text-zinc-600">Loading analytics…</p> : null}
      {status === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Unable to load impression analytics.
        </p>
      ) : null}

      {status === 'ready' && analytics ? (
        <>
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-500">Total impressions</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              {analytics.total.toLocaleString()}
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-lg font-medium">By creative</h2>
              {analytics.byCreative.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
                  No impressions yet. Play a scheduled screen on the Playback page to generate some.
                </p>
              ) : (
                <ul className="space-y-2">
                  {analytics.byCreative.map((stat) => (
                    <li key={stat.creativeId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="min-w-0 truncate pr-3">{stat.name}</span>
                        <span className="font-medium text-zinc-900">
                          {stat.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.round((stat.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-medium">Recent plays</h2>
              {analytics.recent.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
                  Nothing recorded yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-zinc-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium">Creative</th>
                        <th className="px-3 py-2 font-medium">Screen</th>
                        <th className="px-3 py-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {analytics.recent.map((impression) => (
                        <tr key={impression.id}>
                          <td className="px-3 py-2">
                            {creativeNameById.get(impression.creativeId) ?? 'Unknown creative'}
                          </td>
                          <td className="px-3 py-2 text-zinc-600">
                            {billboardsById.get(impression.billboardId)?.name ?? 'Unknown screen'}
                          </td>
                          <td className="px-3 py-2 text-zinc-500">
                            {formatLocalDateTime(impression.occurredAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
