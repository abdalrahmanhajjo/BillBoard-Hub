'use client';

import { Film, ImageIcon, Trash2 } from 'lucide-react';
import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';
import type { AdCreative } from '@/shared/types/ad-creative';

type CreativeCardProps = {
  creative: AdCreative;
  onDelete: (creative: AdCreative) => void;
  pendingDelete?: boolean;
};

export function CreativeCard({ creative, onDelete, pendingDelete }: CreativeCardProps) {
  const isVideo = creative.fileType === AD_CREATIVE_TYPES.VIDEO;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-video w-full bg-zinc-900">
        {isVideo ? (
          <video src={creative.url} className="h-full w-full object-cover" muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creative.url} alt="Image Ad" className="h-full w-full object-cover" />
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white capitalize">
          {isVideo ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
          {creative.fileType}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-zinc-900">{creative.name}</h3>
        </div>
        <p className="text-xs text-zinc-500">
          {isVideo && creative.durationSeconds ? `Video · ${creative.durationSeconds}s` : 'Image'}
        </p>
        <button
          type="button"
          onClick={() => onDelete(creative)}
          disabled={pendingDelete}
          className="mt-auto inline-flex items-center gap-1.5 self-start rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-60"
        >
          <Trash2 className="size-3.5" aria-hidden />
          {pendingDelete ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
