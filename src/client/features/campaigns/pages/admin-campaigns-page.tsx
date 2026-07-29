'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Megaphone,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { ListToolbar } from '@/client/features/dashboard/components/list-toolbar';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import { formatDate } from '@/client/features/dashboard/utils/advertiser-metrics';
import {
  useAdminCampaigns,
  useCampaignOwners,
  useModerateCampaignStatus,
} from '@/client/features/campaigns/hooks/use-admin-campaigns';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type { Campaign, CampaignStatus } from '@/shared/types/campaign';

type StatusFilter = 'all' | CampaignStatus;
type SortKey = 'start-desc' | 'start-asc' | 'ending-soon' | 'name-asc';

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'border-zinc-200 bg-zinc-100 text-zinc-600',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  completed: 'border-sky-200 bg-sky-50 text-sky-700',
};

/** How soon an active campaign has to end to count as "ending soon". */
const ENDING_SOON_DAYS = 7;

type OwnerLookup = Map<string, { name: string; company: string | null }>;

function ownerLabel(campaign: Campaign, owners: OwnerLookup): string {
  const owner = owners.get(campaign.createdBy);
  if (!owner) return 'Unknown owner';
  return owner.company ?? owner.name;
}

function daysUntil(date: string): number {
  const end = new Date(date).getTime();
  if (Number.isNaN(end)) return Number.POSITIVE_INFINITY;
  return Math.ceil((end - Date.now()) / 86_400_000);
}

function isEndingSoon(campaign: Campaign): boolean {
  if (campaign.status !== CAMPAIGN_STATUSES.ACTIVE) return false;
  const remaining = daysUntil(campaign.endDate);
  return remaining >= 0 && remaining <= ENDING_SOON_DAYS;
}

const SORTERS: Record<SortKey, (a: Campaign, b: Campaign) => number> = {
  'start-desc': (a, b) => b.startDate.localeCompare(a.startDate),
  'start-asc': (a, b) => a.startDate.localeCompare(b.startDate),
  'ending-soon': (a, b) => a.endDate.localeCompare(b.endDate),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

export function AdminCampaignsFeaturePage() {
  const campaignsQuery = useAdminCampaigns();
  const ownersQuery = useCampaignOwners();
  const moderate = useModerateCampaignStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('start-desc');

  const allCampaigns = campaignsQuery.data ?? [];

  // Left unmemoized on purpose: React Compiler handles this, and a manual
  // useMemo here is one it cannot preserve.
  const owners: OwnerLookup = new Map(
    (ownersQuery.data?.users ?? []).map((user) => [
      user.id,
      { name: `${user.firstName} ${user.lastName}`.trim(), company: user.companyName },
    ]),
  );

  const searchTerm = search.trim().toLowerCase();
  const campaigns = allCampaigns
    .filter((campaign) => {
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
      if (!searchTerm) return true;
      return [campaign.name, campaign.description ?? '', ownerLabel(campaign, owners)]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm);
    })
    .sort(SORTERS[sortKey]);

  const activeCount = allCampaigns.filter(
    (campaign) => campaign.status === CAMPAIGN_STATUSES.ACTIVE,
  ).length;
  const draftCount = allCampaigns.filter(
    (campaign) => campaign.status === CAMPAIGN_STATUSES.DRAFT,
  ).length;
  const endingSoonCount = allCampaigns.filter(isEndingSoon).length;

  const handleExport = () => {
    const csv = buildCsv(campaigns, [
      { header: 'Campaign', value: (campaign) => campaign.name },
      { header: 'Owner', value: (campaign) => ownerLabel(campaign, owners) },
      { header: 'Status', value: (campaign) => campaign.status },
      { header: 'Start date', value: (campaign) => campaign.startDate },
      { header: 'End date', value: (campaign) => campaign.endDate },
      { header: 'Description', value: (campaign) => campaign.description ?? '' },
      { header: 'Created', value: (campaign) => campaign.createdAt ?? '' },
    ]);

    downloadCsv(`boardly-campaigns-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // A failed moderation matters more than a stale load error, so it wins.
  const activeError = moderate.error ?? campaignsQuery.error;
  const errorMessage =
    activeError instanceof Error ? activeError.message : 'Unknown campaign error.';

  return (
    <WorkspacePage
      title="Campaigns"
      description="Every advertiser campaign on the platform. Move one through its lifecycle without touching its content."
      actions={
        <Button
          variant="outline"
          onClick={() => void campaignsQuery.refetch()}
          disabled={campaignsQuery.isFetching}
        >
          <RefreshCw
            className={campaignsQuery.isFetching ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
    >
      {activeError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {campaignsQuery.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading campaigns...
        </div>
      ) : allCampaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Campaigns appear here as soon as an advertiser creates one."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Megaphone}
              label="Campaigns"
              value={String(allCampaigns.length)}
              hint={`${owners.size > 0 ? new Set(allCampaigns.map((c) => c.createdBy)).size : 0} advertisers`}
            />
            <StatCard
              icon={PlayCircle}
              label="Active"
              value={String(activeCount)}
              hint="Running now"
            />
            <StatCard
              icon={Megaphone}
              label="Drafts"
              value={String(draftCount)}
              hint="Not yet live"
            />
            <StatCard
              icon={CalendarClock}
              label="Ending soon"
              value={String(endingSoonCount)}
              hint={`Active, within ${ENDING_SOON_DAYS} days`}
            />
          </div>

          <div>
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search campaign, description, or advertiser"
              summary={`${campaigns.length} of ${allCampaigns.length}`}
              onExport={campaigns.length > 0 ? handleExport : undefined}
              filters={[
                {
                  id: 'campaign-status-filter',
                  label: 'Status',
                  value: statusFilter,
                  onChange: (value) => setStatusFilter(value as StatusFilter),
                  options: [
                    { value: 'all', label: 'All' },
                    ...Object.values(CAMPAIGN_STATUSES).map((status) => ({
                      value: status,
                      label: STATUS_LABELS[status],
                    })),
                  ],
                },
                {
                  id: 'campaign-sort',
                  label: 'Sort by',
                  value: sortKey,
                  onChange: (value) => setSortKey(value as SortKey),
                  options: [
                    { value: 'start-desc', label: 'Newest start' },
                    { value: 'start-asc', label: 'Oldest start' },
                    { value: 'ending-soon', label: 'Ending soonest' },
                    { value: 'name-asc', label: 'Name A–Z' },
                  ],
                },
              ]}
            />

            {campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns match those filters"
                description="Try a different search term or status."
              />
            ) : (
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Advertiser</th>
                        <th className="px-4 py-3 font-medium">Flight</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Set status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {campaigns.map((campaign) => (
                        <CampaignRow
                          key={campaign.id}
                          campaign={campaign}
                          owner={ownerLabel(campaign, owners)}
                          isPending={
                            moderate.isPending && moderate.variables?.campaignId === campaign.id
                          }
                          onChangeStatus={(status) =>
                            moderate.mutate({ campaignId: campaign.id, status })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Status is the only field an administrator can change here — a campaign&apos;s name,
            dates, and description stay with the advertiser who owns it.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}

type CampaignRowProps = {
  campaign: Campaign;
  owner: string;
  isPending: boolean;
  onChangeStatus: (status: CampaignStatus) => void;
};

function CampaignRow({ campaign, owner, isPending, onChangeStatus }: CampaignRowProps) {
  const remaining = daysUntil(campaign.endDate);
  const endingSoon = isEndingSoon(campaign);

  return (
    <tr>
      <td className="px-4 py-3">
        <span className="font-medium">{campaign.name}</span>
        {campaign.description ? (
          <span className="text-muted-foreground line-clamp-1 block max-w-xs text-xs">
            {campaign.description}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3">{owner}</td>
      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
        {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
        {endingSoon ? (
          <span className="block font-medium text-amber-700 dark:text-amber-500">
            {remaining === 0 ? 'Ends today' : `Ends in ${remaining}d`}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[campaign.status]}`}
        >
          {STATUS_LABELS[campaign.status]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
          <label htmlFor={`campaign-status-${campaign.id}`} className="sr-only">
            Status for {campaign.name}
          </label>
          <select
            id={`campaign-status-${campaign.id}`}
            value={campaign.status}
            disabled={isPending}
            onChange={(event) => onChangeStatus(event.target.value as CampaignStatus)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border px-2 text-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.values(CAMPAIGN_STATUSES).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}
