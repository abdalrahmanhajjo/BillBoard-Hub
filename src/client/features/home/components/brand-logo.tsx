import { cn } from '@/client/ui/lib/utils';

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
};

/**
 * Boardly brand mark: a deep-blue tile holding a clean billboard glyph (an ad
 * panel on two posts) plus a two-tone wordmark. Server-safe (no hooks, no SVG
 * ids) so it can be reused in both client and server components.
 */
export function BrandLogo({
  className,
  markClassName = 'size-9',
  textClassName = 'text-xl',
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.65)] ring-1 ring-white/15 ring-inset',
          markClassName,
        )}
      >
        {/* Top gloss for depth. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/25 to-transparent"
        />
        <svg viewBox="0 0 24 24" fill="none" className="relative size-[60%]" aria-hidden>
          {/* Billboard panel */}
          <rect x="2.75" y="3.75" width="18.5" height="12" rx="2.6" fill="currentColor" />
          {/* Ad content */}
          <rect x="5.6" y="6.6" width="12.8" height="3" rx="1.5" fill="#2563eb" />
          <rect x="5.6" y="10.9" width="7.6" height="2" rx="1" fill="#93c5fd" />
          {/* Two posts */}
          <path d="M8.2 15.75V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15.8 15.75V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      {showWordmark ? (
        <span className={cn('font-bold tracking-[-0.02em] text-zinc-950', textClassName)}>
          Board<span className="text-blue-600">ly</span>
        </span>
      ) : null}
    </span>
  );
}
