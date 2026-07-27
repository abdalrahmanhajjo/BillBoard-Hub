'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2Icon } from 'lucide-react';

import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import { adCreativeClientService } from '@/client/features/campaigns/services/ad-creative-client.service';
import type { AdCreativeWithCampaign } from '@/shared/types/ad-creative';

type CreativeGalleryCardProps = {
  creative: AdCreativeWithCampaign;
  onDeleted: () => void | Promise<void>;
};

export function CreativeGalleryCard({ creative, onDeleted }: CreativeGalleryCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await adCreativeClientService.delete(creative.id);

    setIsDeleting(false);

    if (!result.ok) {
      setError(result.error ?? 'Deleting creative failed.');
      setConfirming(false);
      return;
    }

    await onDeleted();
  };

  return (
    <div className="group ring-foreground/10 relative overflow-hidden rounded-xl ring-1">
      <div className="bg-muted aspect-video w-full overflow-hidden">
        {creative.fileType === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creative.url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <video src={creative.url} className="h-full w-full object-cover" controls />
        )}
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <Badge
          variant={creative.fileType === 'video' ? 'success' : 'secondary'}
          className="backdrop-blur"
        >
          {creative.fileType}
        </Badge>
        {creative.durationSeconds ? (
          <Badge variant="outline" className="bg-background/80 backdrop-blur">
            {Math.round(creative.durationSeconds)}s
          </Badge>
        ) : null}
      </div>

      <div className="bg-card space-y-2 p-3">
        <Link
          href={`/dashboard/advertiser/campaigns/${creative.campaignId}`}
          className="hover:text-primary block truncate text-sm font-medium"
        >
          {creative.campaignName}
        </Link>
        <p className="text-muted-foreground text-xs">
          {creative.createdAt ? new Date(creative.createdAt).toLocaleDateString() : ''}
        </p>

        {error ? <p className="text-destructive text-xs">{error}</p> : null}

        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Confirm delete'}
            </Button>
            <Button type="button" variant="ghost" size="xs" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setConfirming(true)}
            aria-label="Delete creative"
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
    </div>
  );
}
