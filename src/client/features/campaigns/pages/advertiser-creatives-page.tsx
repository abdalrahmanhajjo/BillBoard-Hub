'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, VideoIcon, LayoutGridIcon } from 'lucide-react';

import { Button } from '@/client/ui/components/ui/button';
import { CreativeGalleryCard } from '@/client/features/campaigns/components/creative-gallery-card';
import { adCreativeClientService } from '@/client/features/campaigns/services/ad-creative-client.service';
import type { AdCreativeWithCampaign } from '@/shared/types/ad-creative';

type LoadStatus = 'loading' | 'ready' | 'error';
type TypeFilter = 'all' | 'image' | 'video';

export function AdvertiserCreativesPage() {
  const [creatives, setCreatives] = useState<AdCreativeWithCampaign[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const load = () => {
    return adCreativeClientService.listMine().then((result) => {
      if (!result.ok) {
        setError(result.error ?? 'Unable to load creatives.');
        setStatus('error');
        return;
      }
      setCreatives((result.data?.creatives as AdCreativeWithCampaign[] | undefined) ?? []);
      setError(null);
      setStatus('ready');
    });
  };

  useEffect(() => {
    let active = true;

    adCreativeClientService
      .listMine()
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Unable to load creatives.');
          setStatus('error');
          return;
        }
        setCreatives((result.data?.creatives as AdCreativeWithCampaign[] | undefined) ?? []);
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load creatives.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = creatives.filter(
    (creative) => typeFilter === 'all' || creative.fileType === typeFilter,
  );
  const imageCount = creatives.filter((c) => c.fileType === 'image').length;
  const videoCount = creatives.filter((c) => c.fileType === 'video').length;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Ad Creatives</h1>
        <p className="text-muted-foreground text-sm">
          Every image and video uploaded across your campaigns, in one place.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('all')}
        >
          <LayoutGridIcon data-icon="inline-start" />
          All ({creatives.length})
        </Button>
        <Button
          type="button"
          size="sm"
          variant={typeFilter === 'image' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('image')}
        >
          <ImageIcon data-icon="inline-start" />
          Images ({imageCount})
        </Button>
        <Button
          type="button"
          size="sm"
          variant={typeFilter === 'video' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('video')}
        >
          <VideoIcon data-icon="inline-start" />
          Videos ({videoCount})
        </Button>
      </div>

      {status === 'loading' ? (
        <p className="text-muted-foreground text-sm">Loading creatives…</p>
      ) : status === 'error' ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm">
            {creatives.length === 0
              ? 'No creatives uploaded yet. Open a campaign to upload your first image or video.'
              : 'No creatives match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((creative) => (
            <CreativeGalleryCard key={creative.id} creative={creative} onDeleted={load} />
          ))}
        </div>
      )}
    </section>
  );
}
