'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Creative } from '@/shared/types/creative';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';
import { CreativeUploadForm } from '@/client/features/creatives/components/creative-upload-form';
import { CreativeCard } from '@/client/features/creatives/components/creative-card';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdvertiserCreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await creativeClientService.list();
    if (!result.ok) {
      setError(result.error ?? 'Unable to load creatives.');
      setStatus('error');
      return;
    }
    setCreatives((result.data?.creatives as Creative[] | undefined) ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;
    creativeClientService
      .list()
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Unable to load creatives.');
          setStatus('error');
          return;
        }
        setCreatives((result.data?.creatives as Creative[] | undefined) ?? []);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load creatives.');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (creative: Creative) => {
    if (!window.confirm(`Delete "${creative.name}"? This cannot be undone.`)) return;
    setActionError(null);
    setPendingId(creative.id);
    const result = await creativeClientService.remove(creative.id);
    setPendingId(null);
    if (!result.ok) {
      setActionError(result.error ?? 'Deleting the creative failed.');
      return;
    }
    await load();
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Creatives</h1>
        <p className="text-sm text-zinc-600">
          Upload the image and video assets you&apos;ll use across campaigns. New creatives are
          submitted for review before they can run.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Upload creative</h2>
          <CreativeUploadForm onCreated={load} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Your creatives</h2>
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          ) : null}

          {status === 'loading' ? (
            <p className="text-sm text-zinc-600">Loading creatives…</p>
          ) : null}

          {status === 'error' ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {status === 'ready' && creatives.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
              No creatives yet. Upload your first asset to get started.
            </p>
          ) : null}

          {status === 'ready' && creatives.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {creatives.map((creative) => (
                <CreativeCard
                  key={creative.id}
                  creative={creative}
                  onDelete={handleDelete}
                  pendingDelete={pendingId === creative.id}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
