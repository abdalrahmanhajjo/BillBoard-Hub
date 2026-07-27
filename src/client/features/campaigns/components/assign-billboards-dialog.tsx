'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/client/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/client/ui/components/ui/dialog';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import type { Billboard } from '@/shared/types/billboard';

type AssignBillboardsDialogProps = {
  campaignId: string;
  onAssigned: () => void | Promise<void>;
};

export function AssignBillboardsDialog({ campaignId, onAssigned }: AssignBillboardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;

    billboardClientService
      .list()
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setLoadError(result.error ?? 'Unable to load billboards.');
          return;
        }
        setLoadError(null);
        setBillboards((result.data?.billboards as Billboard[] | undefined) ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load billboards.');
      });

    return () => {
      active = false;
    };
  }, [open]);

  const toggleSelected = (billboardId: string) => {
    setSelectedIds((prev) =>
      prev.includes(billboardId) ? prev.filter((id) => id !== billboardId) : [...prev, billboardId],
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      setSubmitError('Select at least one billboard.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await campaignClientService.assignBillboards(campaignId, {
      billboardIds: selectedIds,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error ?? 'Assigning billboards failed.');
      return;
    }

    setSelectedIds([]);
    setOpen(false);
    await onAssigned();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Assign billboards
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign billboards to campaign</DialogTitle>
        </DialogHeader>

        {loadError ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {loadError}
          </p>
        ) : null}

        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {billboards.length === 0 && !loadError ? (
            <p className="text-muted-foreground text-sm">No billboards available.</p>
          ) : null}
          {billboards.map((billboard) => (
            <label
              key={billboard.id}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(billboard.id)}
                onChange={() => toggleSelected(billboard.id)}
                className="size-4"
              />
              <span className="flex-1">{billboard.name}</span>
              <span className="text-muted-foreground text-xs">{billboard.location.city}</span>
            </label>
          ))}
        </div>

        {submitError ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {submitError}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting}>
            {isSubmitting ? 'Assigning…' : 'Assign selected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
