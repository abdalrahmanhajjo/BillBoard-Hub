'use client';

import { useCallback, useEffect, useState } from 'react';

import { CreateCampaignForm } from '@/client/features/campaigns/components/create-campaign-form';
import { CampaignList } from '@/client/features/campaigns/components/campaign-list';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
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

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground text-sm">
          Create campaigns and assign billboards to organize your advertising activity.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">New campaign</h2>
          <CreateCampaignForm onCreated={loadCampaigns} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Your campaigns</h2>
          <CampaignList
            campaigns={campaigns}
            isLoading={status === 'loading'}
            error={status === 'error' ? error : null}
            onRefresh={loadCampaigns}
          />
        </div>
      </div>
    </section>
  );
}
