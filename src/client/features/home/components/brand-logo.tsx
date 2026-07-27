import { cn } from '@/client/ui/lib/utils';

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
};

/**
 * Boardly brand mark: a gradient tile holding a billboard glyph (a board with
 * ad content lines on a post) plus a two-tone wordmark. Server-safe (no hooks,
 * no SVG ids) so it can be reused in both client and server components.
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
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-500 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)] ring-1 ring-white/15 ring-inset',
          markClassName,
        )}
      >
        {/* Top gloss for depth. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15"
        />
        <svg viewBox="0 0 24 24" fill="none" className="relative size-[62%]" aria-hidden>
          {/* Billboard panel */}
          <rect x="3" y="4.5" width="18" height="11" rx="2.4" fill="currentColor" />
          {/* Ad content lines */}
          <rect x="5.6" y="7.1" width="12.8" height="2.5" rx="1.25" fill="#2563eb" />
          <rect x="5.6" y="10.9" width="8" height="1.9" rx="0.95" fill="#3b82f6" opacity="0.7" />
          {/* Post + base */}
          <path d="M12 15.5v4.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8.5 19.8h7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {showWordmark ? (
        <span className={cn('font-semibold tracking-tight text-zinc-900', textClassName)}>
          Board<span className="text-blue-600">ly</span>
        </span>
      ) : null}
    </span>
  );
}
