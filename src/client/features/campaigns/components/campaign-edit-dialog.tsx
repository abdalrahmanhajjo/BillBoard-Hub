'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { Textarea } from '@/client/ui/components/ui/textarea';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/ui/components/ui/dialog';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type { Campaign, CampaignStatus } from '@/shared/types/campaign';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';

type CampaignEditDialogProps = {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
};

const STATUS_OPTIONS: CampaignStatus[] = [
  CAMPAIGN_STATUSES.DRAFT,
  CAMPAIGN_STATUSES.ACTIVE,
  CAMPAIGN_STATUSES.COMPLETED,
];

/** ISO timestamps from the API narrowed to the `yyyy-mm-dd` a date input needs. */
function toDateInput(value: string): string {
  return value ? value.slice(0, 10) : '';
}

export function CampaignEditDialog({
  campaign,
  open,
  onOpenChange,
  onSaved,
}: CampaignEditDialogProps) {
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description ?? '');
  const [startDate, setStartDate] = useState(toDateInput(campaign.startDate));
  const [endDate, setEndDate] = useState(toDateInput(campaign.endDate));
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (startDate && endDate && startDate >= endDate) {
      setError('Start date must be before end date.');
      return;
    }

    setSaving(true);
    const result = await campaignClientService.update(campaign.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
      status,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? 'We could not save this campaign. Try again.');
      return;
    }

    await onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit campaign</DialogTitle>
          <DialogDescription>
            Update the schedule, details, or lifecycle status of this campaign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          {error ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/8 text-destructive rounded-lg border px-3 py-2 text-sm"
            >
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="campaign-name" className="block text-sm font-medium">
              Name
            </label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="campaign-description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="campaign-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="campaign-start" className="block text-sm font-medium">
                Start date
              </label>
              <Input
                id="campaign-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="campaign-end" className="block text-sm font-medium">
                End date
              </label>
              <Input
                id="campaign-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="campaign-status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="campaign-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CampaignStatus)}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" className="h-10">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={saving} className="h-10 gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
