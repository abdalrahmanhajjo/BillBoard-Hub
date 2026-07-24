'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE_OUT } from '@/client/features/home/lib/animations';

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  className?: string;
  durationMs?: number;
};

/** Counts up from 0 to `value` the first time it enters the viewport. */
export function AnimatedCounter({
  value,
  suffix = '',
  className,
  durationMs = 1600,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
