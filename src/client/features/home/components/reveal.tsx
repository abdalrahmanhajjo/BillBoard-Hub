'use client';

import { motion, type Variants } from 'motion/react';
import { fadeUp, staggerContainer, viewportOnce } from '@/client/features/home/lib/animations';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  /** Delay before this element starts animating (seconds). */
  delay?: number;
};

/** Single element that fades/slides in the first time it scrolls into view. */
export function Reveal({ children, className, variants = fadeUp, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container that reveals its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
