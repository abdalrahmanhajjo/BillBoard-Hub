import type { AdCreative } from '@/shared/types/ad-creative';

export function CreativeList({ creatives }: { creatives: AdCreative[] }) {
  if (creatives.length === 0) {
    return (
      <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
        No creatives uploaded yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {creatives.map((creative) => (
        <li key={creative.id} className="overflow-hidden rounded-lg border border-zinc-200">
          {creative.fileType === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creative.url} alt="" className="h-32 w-full object-cover" />
          ) : (
            <video src={creative.url} className="h-32 w-full object-cover" controls />
          )}
          <div className="space-y-1 p-3">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              {creative.fileType}
            </p>
            {creative.durationSeconds ? (
              <p className="text-xs text-zinc-500">{Math.round(creative.durationSeconds)}s</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
