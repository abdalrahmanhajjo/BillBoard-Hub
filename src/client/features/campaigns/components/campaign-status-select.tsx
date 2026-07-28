'use client';

import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/ui/components/ui/select';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import type { CampaignStatus } from '@/shared/types/campaign';

type CampaignStatusSelectProps = {
  campaignId: string;
  status: CampaignStatus;
  onChanged: (status: CampaignStatus) => void;
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

export function CampaignStatusSelect({ campaignId, status, onChanged }: CampaignStatusSelectProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (value: CampaignStatus | null) => {
    if (value === null) return;

    setIsUpdating(true);
    setError(null);

    const result = await campaignClientService.update(campaignId, { status: value });

    setIsUpdating(false);

    if (!result.ok) {
      setError(result.error ?? 'Updating status failed.');
      return;
    }

    onChanged(value);
  };

  return (
    <div className="space-y-1">
      <Select value={status} onValueChange={handleChange} disabled={isUpdating}>
        <SelectTrigger size="sm">
          <SelectValue>{STATUS_LABEL[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.values(CAMPAIGN_STATUSES).map((statusValue) => (
            <SelectItem key={statusValue} value={statusValue}>
              {STATUS_LABEL[statusValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
