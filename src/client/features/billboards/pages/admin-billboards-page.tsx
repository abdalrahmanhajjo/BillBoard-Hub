'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Billboard, BillboardStatus } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { CreateBillboardForm } from '@/client/features/billboards/components/create-billboard-form';
import { BillboardInventoryTable } from '@/client/features/billboards/components/billboard-inventory-table';
import { DigitalSpecsManager } from '@/client/features/billboards/components/digital-specs-manager';

type LoadStatus = 'loading' | 'ready' | 'error';

async function fetchBillboards(): Promise<Billboard[]> {
  const result = await billboardClientService.list();

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to load billboards.');
  }

  return (result.data?.billboards as Billboard[] | undefined) ?? [];
}

export function AdminBillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBillboards = normalizedQuery
    ? billboards.filter((billboard) =>
        [
          billboard.name,
          billboard.code,
          billboard.type,
          billboard.location.address,
          billboard.location.city,
          billboard.location.country,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : billboards;

  const loadBillboards = useCallback(async () => {
    try {
      setBillboards(await fetchBillboards());
      setLoadError(null);
      setStatus('ready');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load billboards.');
      setStatus('error');
    }
  }, []);

  const handleStatusChange = useCallback(
    async (billboardId: string, nextStatus: BillboardStatus) => {
      setStatusError(null);
      setPendingStatusId(billboardId);

      const result = await billboardClientService.updateAvailability(billboardId, {
        status: nextStatus,
      });

      setPendingStatusId(null);

      if (!result.ok) {
        setStatusError(result.error ?? 'Updating availability failed.');
        return;
      }

      await loadBillboards();
    },
    [loadBillboards],
  );

  useEffect(() => {
    let active = true;

    fetchBillboards()
      .then((next) => {
        if (!active) return;
        setBillboards(next);
        setLoadError(null);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load billboards.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Billboards</h1>
        <p className="text-sm text-zinc-600">Create billboards and manage advertising inventory.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">New billboard</h2>
          <CreateBillboardForm onCreated={loadBillboards} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Inventory</h2>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, code, type, or location…"
            aria-label="Search billboards"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          {statusError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {statusError}
            </p>
          ) : null}
          <BillboardInventoryTable
            billboards={filteredBillboards}
            isLoading={status === 'loading'}
            error={status === 'error' ? loadError : null}
            emptyMessage={
              normalizedQuery ? 'No billboards match your search.' : 'No billboards yet.'
            }
            onStatusChange={handleStatusChange}
            pendingStatusId={pendingStatusId}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-zinc-200 pt-8">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Digital specifications</h2>
          <p className="text-sm text-zinc-600">
            Manage resolution, brightness, slot duration, rotating ads, and screen status for
            digital billboards.
          </p>
        </div>
        <DigitalSpecsManager billboards={billboards} />
      </div>
    </section>
  );
}
