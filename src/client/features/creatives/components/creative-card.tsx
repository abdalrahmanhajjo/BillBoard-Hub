'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Film, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { CREATIVE_TYPES } from '@/shared/constants/creative';
import type { Creative } from '@/shared/types/creative';
import { CreativeStatusBadge } from '@/client/features/creatives/components/creative-status-badge';
import { CreativeEditDialog } from '@/client/features/creatives/components/creative-edit-dialog';
import {
  canDeleteCreative,
  canEditCreative,
} from '@/client/features/dashboard/utils/advertiser-capabilities';

type CreativeCardProps = {
  creative: Creative;
  onDelete: (creative: Creative) => void;
  onUpdated?: () => void | Promise<void>;
  pendingDelete?: boolean;
};

export function CreativeCard({ creative, onDelete, onUpdated, pendingDelete }: CreativeCardProps) {
  const isVideo = creative.type === CREATIVE_TYPES.VIDEO;
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();
  const editVerdict = canEditCreative(creative, session?.user);
  const deleteVerdict = canDeleteCreative(creative, session?.user);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-video w-full bg-zinc-900">
        {isVideo ? (
          <video src={creative.assetUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creative.assetUrl} alt={creative.name} className="h-full w-full object-cover" />
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white capitalize">
          {isVideo ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
          {creative.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-zinc-900">{creative.name}</h3>
          <CreativeStatusBadge status={creative.status} />
        </div>
        <p className="text-xs text-zinc-500">
          {isVideo && creative.durationSeconds ? `Video · ${creative.durationSeconds}s` : 'Image'}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={!editVerdict.allowed || pendingDelete}
            title={editVerdict.reason}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(creative)}
            disabled={!deleteVerdict.allowed || pendingDelete}
            title={deleteVerdict.reason}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-3.5" aria-hidden />
            {pendingDelete ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <CreativeEditDialog
          creative={creative}
          open={isEditing}
          onOpenChange={setIsEditing}
          onSaved={() => onUpdated?.()}
        />
      ) : null}
    </article>
  );
}
