'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from '@/client/ui/components/ui/card';
import { Badge } from '@/client/ui/components/ui/badge';
import { CampaignStatusBadge } from '@/client/features/campaigns/components/campaign-status-badge';
import { AssignBillboardsDialog } from '@/client/features/campaigns/components/assign-billboards-dialog';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import type { Campaign } from '@/shared/types/campaign';
import type { Billboard } from '@/shared/types/billboard';

type CampaignListProps = {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
};

export function CampaignList({ campaigns, isLoading, error, onRefresh }: CampaignListProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading campaigns…</p>;
  }

  if (error) {
    return (
      <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
        {error}
      </p>
    );
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
        No campaigns yet. Create your first campaign to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

const MAX_VISIBLE_BILLBOARD_BADGES = 3;

function CampaignCard({
  campaign,
  onRefresh,
}: {
  campaign: Campaign;
  onRefresh: () => void | Promise<void>;
}) {
  const [assignedBillboards, setAssignedBillboards] = useState<Billboard[]>([]);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);

  const loadAssigned = async () => {
    setIsLoadingAssigned(true);
    const result = await campaignClientService.listAssignedBillboards(campaign.id);
    if (result.ok) {
      setAssignedBillboards((result.data?.billboards as Billboard[] | undefined) ?? []);
    }
    setIsLoadingAssigned(false);
  };

  useEffect(() => {
    let active = true;
    campaignClientService.listAssignedBillboards(campaign.id).then((result) => {
      if (!active || !result.ok) return;
      setAssignedBillboards((result.data?.billboards as Billboard[] | undefined) ?? []);
      setIsLoadingAssigned(false);
    });
    return () => {
      active = false;
    };
  }, [campaign.id]);

  const visibleBillboards = assignedBillboards.slice(0, MAX_VISIBLE_BILLBOARD_BADGES);
  const remainingCount = assignedBillboards.length - visibleBillboards.length;

  const handleAssigned = async () => {
    await loadAssigned();
    await onRefresh();
  };

  return (
    <Card>
      <Link href={`/dashboard/advertiser/campaigns/${campaign.id}`} className="block">
        <CardHeader>
          <CardTitle>{campaign.name}</CardTitle>
          <CardAction>
            <CampaignStatusBadge status={campaign.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.description ? (
            <p className="text-muted-foreground line-clamp-2 text-sm">{campaign.description}</p>
          ) : null}
          <p className="text-xs text-zinc-500">
            {new Date(campaign.startDate).toLocaleDateString()} –{' '}
            {new Date(campaign.endDate).toLocaleDateString()}
          </p>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">
              {isLoadingAssigned
                ? 'Loading billboards…'
                : `${assignedBillboards.length} billboard${assignedBillboards.length === 1 ? '' : 's'} assigned`}
            </p>
            {!isLoadingAssigned && assignedBillboards.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {visibleBillboards.map((billboard) => (
                  <Badge key={billboard.id} variant="secondary">
                    {billboard.name}
                  </Badge>
                ))}
                {remainingCount > 0 ? (
                  <Badge variant="outline">+{remainingCount} more</Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="border-t-0 bg-transparent px-(--card-spacing) pb-(--card-spacing)">
        <AssignBillboardsDialog campaignId={campaign.id} onAssigned={handleAssigned} />
      </CardFooter>
    </Card>
  );
}
