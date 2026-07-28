'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCcwDotIcon } from 'lucide-react';

import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import { CampaignStatusSelect } from '@/client/features/campaigns/components/campaign-status-select';
import { AssignBillboardsDialog } from '@/client/features/campaigns/components/assign-billboards-dialog';
import { CreativeUpload } from '@/client/features/campaigns/components/creative-upload';
import { CreativeList } from '@/client/features/campaigns/components/creative-list';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import { adCreativeClientService } from '@/client/features/campaigns/services/ad-creative-client.service';
import type { Campaign } from '@/shared/types/campaign';
import type { Billboard } from '@/shared/types/billboard';
import type { AdCreative } from '@/shared/types/ad-creative';

type LoadStatus = 'loading' | 'ready' | 'error';

type CampaignDetailsPageProps = {
  campaignId: string;
};

export function CampaignDetailsPage({ campaignId }: CampaignDetailsPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const [campaignResult, billboardsResult, creativesResult] = await Promise.all([
      campaignClientService.get(campaignId),
      campaignClientService.listAssignedBillboards(campaignId),
      adCreativeClientService.listByCampaign(campaignId),
    ]);

    if (!campaignResult.ok) {
      setError(campaignResult.error ?? 'Unable to load campaign.');
      setStatus('error');
      return;
    }

    setCampaign(campaignResult.data?.campaign as Campaign);
    setBillboards((billboardsResult.data?.billboards as Billboard[] | undefined) ?? []);
    setCreatives((creativesResult.data?.creatives as AdCreative[] | undefined) ?? []);
    setError(null);
    setStatus('ready');
  }, [campaignId]);

  useEffect(() => {
    let active = true;

    Promise.all([
      campaignClientService.get(campaignId),
      campaignClientService.listAssignedBillboards(campaignId),
      adCreativeClientService.listByCampaign(campaignId),
    ])
      .then(([campaignResult, billboardsResult, creativesResult]) => {
        if (!active) return;
        if (!campaignResult.ok) {
          setError(campaignResult.error ?? 'Unable to load campaign.');
          setStatus('error');
          return;
        }
        setCampaign(campaignResult.data?.campaign as Campaign);
        setBillboards((billboardsResult.data?.billboards as Billboard[] | undefined) ?? []);
        setCreatives((creativesResult.data?.creatives as AdCreative[] | undefined) ?? []);
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load campaign.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [campaignId]);

  if (status === 'loading') {
    return <p className="text-muted-foreground px-6 py-10 text-sm">Loading campaign…</p>;
  }

  if (status === 'error' || !campaign) {
    return (
      <p className="border-destructive/30 bg-destructive/10 text-destructive mx-6 my-10 rounded-md border px-3 py-2 text-sm">
        {error ?? 'Campaign not found.'}
      </p>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{campaign.name}</h1>
          <div className="flex items-center gap-2">
            <CampaignStatusSelect
              campaignId={campaign.id}
              status={campaign.status}
              onChanged={(next) => setCampaign((prev) => (prev ? { ...prev, status: next } : prev))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => load()}
              aria-label="Refresh campaign"
            >
              <RefreshCcwDotIcon />
            </Button>
          </div>
        </div>
        {campaign.description ? (
          <p className="text-muted-foreground text-sm">{campaign.description}</p>
        ) : null}
        <p className="text-xs text-zinc-500">
          {new Date(campaign.startDate).toLocaleDateString()} –{' '}
          {new Date(campaign.endDate).toLocaleDateString()}
        </p>
      </header>

      <div className="space-y-4 border-t border-zinc-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Assigned billboards ({billboards.length})</h2>
          <AssignBillboardsDialog campaignId={campaign.id} onAssigned={load} />
        </div>

        {billboards.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
            No billboards assigned yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {billboards.map((billboard) => (
              <li key={billboard.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-medium text-zinc-900">{billboard.name}</p>
                <p className="text-xs text-zinc-500">{billboard.code}</p>
                <p className="mt-2 text-sm text-zinc-700">
                  {billboard.location.address}, {billboard.location.city},{' '}
                  {billboard.location.country}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{billboard.type}</Badge>
                  <Badge variant="secondary">{billboard.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 border-t border-zinc-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Ad creatives ({creatives.length})</h2>
          <CreativeUpload campaignId={campaign.id} onUploaded={load} />
        </div>
        <CreativeList creatives={creatives} />
      </div>
    </section>
  );
}
