'use client';

import { useCallback, useEffect, useState } from 'react';
import { Archive, Layers3, Megaphone, RefreshCw } from 'lucide-react';

import { CreateCampaignForm } from '@/client/features/campaigns/components/create-campaign-form';
import { CampaignList } from '@/client/features/campaigns/components/campaign-list';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import {
  SectionCard,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { Button } from '@/client/ui/components/ui/button';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type { Campaign } from '@/shared/types/campaign';

type LoadStatus = 'loading' | 'ready' | 'error';

export function AdvertiserCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    const result = await campaignClientService.list();
    if (!result.ok) {
      setError(result.error ?? 'Unable to load campaigns.');
      setStatus('error');
      return;
    }
    setCampaigns((result.data?.campaigns as Campaign[] | undefined) ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;

    campaignClientService
      .list()
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Unable to load campaigns.');
          setStatus('error');
          return;
        }
        setCampaigns((result.data?.campaigns as Campaign[] | undefined) ?? []);
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load campaigns.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const active = campaigns.filter(
    (campaign) => campaign.status === CAMPAIGN_STATUSES.ACTIVE,
  ).length;

  return (
    <WorkspacePage
      eyebrow="Advertising"
      title="Campaigns"
      description="Group billboards under a campaign so briefs, creatives, and reporting stay together."
      actions={
        <Button variant="outline" onClick={loadCampaigns} disabled={status === 'loading'}>
          <RefreshCw
            className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
      canvas
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          index={0}
          icon={Megaphone}
          accent="bg-cyan-50 text-cyan-700"
          label="Active campaigns"
          value={String(active)}
          hint="Currently running"
        />
        <StatCard
          index={1}
          icon={Layers3}
          accent="bg-blue-50 text-blue-700"
          label="Total campaigns"
          value={String(campaigns.length)}
          hint="All time"
        />
        <StatCard
          index={2}
          icon={Archive}
          accent="bg-muted text-muted-foreground"
          label="Not running"
          value={String(campaigns.length - active)}
          hint="Draft, paused, or finished"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SectionCard
          title="New campaign"
          description="Name the campaign and set the window it should cover."
        >
          <CreateCampaignForm onCreated={loadCampaigns} />
        </SectionCard>

        <SectionCard title="Your campaigns" description="Everything you have created so far.">
          <CampaignList
            campaigns={campaigns}
            isLoading={status === 'loading'}
            error={status === 'error' ? error : null}
            onRefresh={loadCampaigns}
          />
        </SectionCard>
      </div>
    </WorkspacePage>
  );
}
