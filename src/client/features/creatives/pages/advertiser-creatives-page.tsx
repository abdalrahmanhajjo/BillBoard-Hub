'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, FileImage, RefreshCw } from 'lucide-react';
import type { Creative } from '@/shared/types/creative';
import { CREATIVE_STATUSES, CREATIVE_TYPES } from '@/shared/constants/creative';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';
import { CreativeUploadForm } from '@/client/features/creatives/components/creative-upload-form';
import { CreativeCard } from '@/client/features/creatives/components/creative-card';
import { ListToolbar } from '@/client/features/dashboard/components/list-toolbar';
import {
  EmptyState,
  SectionCard,
  StatCard,
  WorkspaceError,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { Button } from '@/client/ui/components/ui/button';
import { Skeleton } from '@/client/ui/components/ui/skeleton';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdvertiserCreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const searchTerm = search.trim().toLowerCase();
  const visibleCreatives = creatives.filter((creative) => {
    if (typeFilter !== 'all' && creative.type !== typeFilter) return false;
    if (statusFilter !== 'all' && creative.status !== statusFilter) return false;
    return !searchTerm || creative.name.toLowerCase().includes(searchTerm);
  });

  const load = useCallback(async () => {
    const result = await creativeClientService.list();
    if (!result.ok) {
      setError(result.error ?? 'We could not load your creatives. Try again.');
      setStatus('error');
      return;
    }
    setCreatives((result.data?.creatives as Creative[] | undefined) ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const handleDelete = async (creative: Creative) => {
    if (!window.confirm(`Delete "${creative.name}"? This cannot be undone.`)) return;
    setActionError(null);
    setPendingId(creative.id);
    const result = await creativeClientService.remove(creative.id);
    setPendingId(null);
    if (!result.ok) {
      setActionError(
        result.error ?? 'We could not delete this creative. Refresh the page and try again.',
      );
      return;
    }
    await load();
  };

  const approved = creatives.filter(
    (creative) => creative.status === CREATIVE_STATUSES.APPROVED,
  ).length;
  const awaiting = creatives.filter(
    (creative) => creative.status === CREATIVE_STATUSES.PENDING,
  ).length;

  return (
    <WorkspacePage
      eyebrow="Advertising"
      title="Creatives"
      description="Upload the image and video assets you'll use across campaigns. New creatives are submitted for review before they can run."
      actions={
        <Button variant="outline" onClick={load} disabled={status === 'loading'}>
          <RefreshCw
            className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
      canvas
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
          label="Approved"
          value={String(approved)}
          hint="Ready to schedule"
        />
        <StatCard
          index={1}
          icon={Clock3}
          accent="bg-amber-50 text-amber-700"
          label="In review"
          value={String(awaiting)}
          hint="Awaiting the team"
        />
        <StatCard
          index={2}
          icon={FileImage}
          accent="bg-blue-50 text-blue-700"
          label="Uploaded"
          value={String(creatives.length)}
          hint="All assets"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <SectionCard
          title="Upload creative"
          description="Images and video up to 50MB; video must be under 10 seconds."
        >
          <CreativeUploadForm onCreated={load} />
        </SectionCard>

        <SectionCard title="Your creatives" description="Filter by type or review status.">
          {actionError ? (
            <p
              role="alert"
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {actionError}
            </p>
          ) : null}

          {status === 'loading' ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : null}

          {status === 'error' ? (
            <WorkspaceError message={error ?? 'Unknown error.'} onRetry={load} />
          ) : null}

          {status === 'ready' && creatives.length === 0 ? (
            <EmptyState
              icon={FileImage}
              title="No creatives yet"
              description="Upload your first asset so it can be reviewed before your campaign starts."
            />
          ) : null}

          {status === 'ready' && creatives.length > 0 ? (
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search creatives by name"
              summary={`${visibleCreatives.length} of ${creatives.length}`}
              filters={[
                {
                  id: 'creative-type-filter',
                  label: 'Type',
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: [
                    { value: 'all', label: 'All types' },
                    { value: CREATIVE_TYPES.IMAGE, label: 'Image' },
                    { value: CREATIVE_TYPES.VIDEO, label: 'Video' },
                  ],
                },
                {
                  id: 'creative-status-filter',
                  label: 'Review',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: 'all', label: 'All statuses' },
                    { value: CREATIVE_STATUSES.PENDING, label: 'Pending' },
                    { value: CREATIVE_STATUSES.APPROVED, label: 'Approved' },
                    { value: CREATIVE_STATUSES.REJECTED, label: 'Rejected' },
                  ],
                },
              ]}
            />
          ) : null}

          {status === 'ready' && creatives.length > 0 && visibleCreatives.length === 0 ? (
            <EmptyState
              icon={FileImage}
              title="No matches"
              description="No creatives match those filters. Clear the search or pick another status."
            />
          ) : null}

          {status === 'ready' && visibleCreatives.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {visibleCreatives.map((creative) => (
                <CreativeCard
                  key={creative.id}
                  creative={creative}
                  onDelete={handleDelete}
                  onUpdated={load}
                  pendingDelete={pendingId === creative.id}
                />
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </WorkspacePage>
  );
}
