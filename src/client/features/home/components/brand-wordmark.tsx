import type { BrandItem } from '@/client/features/home/home.types';

/**
 * Placeholder brand logos. We don't ship real (trademarked) logos, so each
 * brand is drawn as a generated SVG "mark + wordmark" lockup: a small geometric
 * glyph chosen deterministically from the brand's position, paired with the
 * styled brand name. Everything inherits `currentColor` so the carousel can
 * render the whole wall in grayscale and tint on hover.
 */

type MarkProps = { className?: string };

const MARKS: ((props: MarkProps) => React.ReactElement)[] = [
  // Concentric ring
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  ),
  // Rounded square + notch
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  // Linked circles
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="9" cy="12" r="5.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="12" r="5.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  // Triangle
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M12 3.5 21 20H3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  // Dot grid
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <circle cx="8" cy="8" r="2.4" />
      <circle cx="16" cy="8" r="2.4" />
      <circle cx="8" cy="16" r="2.4" />
      <circle cx="16" cy="16" r="2.4" />
    </svg>
  ),
  // Chevrons
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="m6 6 6 6-6 6M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Hexagon
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 3 20 7.5v9L12 21 4 16.5v-9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Equalizer bars
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="4" y="10" width="3.5" height="10" rx="1.5" />
      <rect x="10.25" y="4" width="3.5" height="16" rx="1.5" />
      <rect x="16.5" y="13" width="3.5" height="7" rx="1.5" />
    </svg>
  ),
  // Spark / asterisk
  ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
];

export function BrandWordmark({ brand, index }: { brand: BrandItem; index: number }) {
  const Mark = MARKS[index % MARKS.length];
  return (
    <span className="flex items-center gap-2.5">
      <Mark className="size-6 shrink-0" />
      <span className="text-2xl font-semibold tracking-tight">{brand.name}</span>
    </span>
  );
}
