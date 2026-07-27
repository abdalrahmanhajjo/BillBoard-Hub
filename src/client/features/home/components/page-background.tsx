import type { CSSProperties } from 'react';

// Live, colourless backdrop for the public pages: large, softly-blurred neutral
// grey fields drift and scale over a light base for ambient, video-like motion
// with no colour. Pure CSS/no JS, fixed behind all content, and held static for
// users who prefer reduced motion (via the `motion-safe:` variant).
type Blob = { className: string; style: CSSProperties };

const BLOBS: Blob[] = [
  {
    className:
      'left-[-12%] top-[-16%] size-184 motion-safe:animate-[aurora-a_26s_ease-in-out_infinite]',
    style: { background: 'radial-gradient(circle, rgba(148,163,184,0.34), transparent 68%)' },
  },
  {
    className:
      'right-[-14%] top-[4%] size-168 motion-safe:animate-[aurora-b_32s_ease-in-out_infinite]',
    style: { background: 'radial-gradient(circle, rgba(100,116,139,0.26), transparent 66%)' },
  },
  {
    className:
      'left-[16%] bottom-[-22%] size-192 motion-safe:animate-[aurora-c_30s_ease-in-out_infinite]',
    style: { background: 'radial-gradient(circle, rgba(203,213,225,0.42), transparent 68%)' },
  },
  {
    className:
      'right-[6%] bottom-[-12%] size-152 motion-safe:animate-[aurora-a_36s_ease-in-out_infinite]',
    style: { background: 'radial-gradient(circle, rgba(148,163,184,0.28), transparent 66%)' },
  },
  {
    className:
      'left-[38%] top-[28%] size-136 motion-safe:animate-[aurora-b_28s_ease-in-out_infinite]',
    style: { background: 'radial-gradient(circle, rgba(212,212,216,0.3), transparent 68%)' },
  },
];

export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-slate-50 via-white to-slate-100"
    >
      {BLOBS.map((blob) => (
        <div
          key={blob.className}
          className={`absolute rounded-full blur-3xl will-change-transform ${blob.className}`}
          style={blob.style}
        />
      ))}
    </div>
  );
}
