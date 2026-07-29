import type { Variants } from 'motion/react';

// Premium "ease-out expo"-style curve used across the marketing site.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DURATION = 0.6;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION, ease: EASE_OUT } },
};

// Parent container that reveals its children one after another.
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Shared viewport config so scroll reveals feel consistent everywhere.
export const viewportOnce = { once: true, amount: 0.2 } as const;

// Masked, line-by-line headline reveal. Each word sits in an `overflow-hidden`
// clip so it slides up from behind its own baseline — the premium "type wipe".
export const heroLineContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
};

export const heroLine: Variants = {
  hidden: { y: '118%' },
  visible: { y: '0%', transition: { duration: 0.85, ease: EASE_OUT } },
};
