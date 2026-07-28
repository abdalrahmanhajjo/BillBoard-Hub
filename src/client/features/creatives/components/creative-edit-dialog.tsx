'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/ui/components/ui/dialog';
import { CREATIVE_TYPES, MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';
import type { Creative } from '@/shared/types/creative';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';

type CreativeEditDialogProps = {
  creative: Creative;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
};

/**
 * `updateCreativeSchema` accepts name and duration only — type and asset URL are
 * immutable once uploaded, so they are shown read-only rather than as inputs
 * that would be silently discarded.
 */
export function CreativeEditDialog({
  creative,
  open,
  onOpenChange,
  onSaved,
}: CreativeEditDialogProps) {
  const [name, setName] = useState(creative.name);
  const [duration, setDuration] = useState(
    creative.durationSeconds ? String(creative.durationSeconds) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isVideo = creative.type === CREATIVE_TYPES.VIDEO;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload: { name?: string; durationSeconds?: number } = {};
    if (name.trim() !== creative.name) payload.name = name.trim();
    if (isVideo && duration && Number(duration) !== creative.durationSeconds) {
      payload.durationSeconds = Number(duration);
    }

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      setError('Change the creative name or duration before saving.');
      return;
    }

    const result = await creativeClientService.update(creative.id, payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? 'We could not save this creative. Try again.');
      return;
    }

    await onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit creative</DialogTitle>
          <DialogDescription>Renaming does not resubmit the asset for review.</DialogDescription>
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
            <label htmlFor="creative-name" className="block text-sm font-medium">
              Name
            </label>
            <Input
              id="creative-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10"
              maxLength={120}
              required
            />
          </div>

          {isVideo ? (
            <div className="space-y-1.5">
              <label htmlFor="creative-duration" className="block text-sm font-medium">
                Duration (seconds)
              </label>
              <Input
                id="creative-duration"
                type="number"
                step="0.1"
                min="0.1"
                max={MAX_CREATIVE_VIDEO_DURATION_SECONDS - 0.1}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="h-10"
              />
              <p className="text-muted-foreground text-xs">
                Must be shorter than {MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.
              </p>
            </div>
          ) : null}

          <dl className="text-muted-foreground bg-muted/40 grid gap-1 rounded-lg px-3 py-2.5 text-xs">
            <div className="flex justify-between gap-3">
              <dt>Type</dt>
              <dd className="text-foreground font-medium capitalize">{creative.type}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Review status</dt>
              <dd className="text-foreground font-medium capitalize">{creative.status}</dd>
            </div>
          </dl>

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
