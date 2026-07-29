'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { SectionHeading } from '@/client/features/home/components/section-heading';
import { TimelineStep } from '@/client/features/home/components/timeline-step';
import type { HowItWorksStep } from '@/client/features/home/home.types';

export function HowItWorks({ steps }: { steps: HowItWorksStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Draw the spine's gradient fill in sync with scroll through the section.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white">
      <Container className="py-20 sm:py-24 lg:py-32">
        <SectionHeading
          title="How it works"
          subtitle="Book your billboard campaign in three simple steps."
        />

        <div ref={ref} className="relative mx-auto mt-12 max-w-4xl sm:mt-16 lg:mt-20">
          {/* Base spine */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-zinc-200 md:left-1/2"
          />
          {/* Scroll-drawn progress spine */}
          <motion.div
            aria-hidden
            style={{ height: reduce ? '100%' : fillHeight }}
            className="absolute top-0 left-4 w-0.5 -translate-x-1/2 rounded-full bg-linear-to-b from-blue-500 to-blue-600 md:left-1/2"
          />

          <div className="space-y-8 md:space-y-8">
            {steps.map((step, index) => (
              <TimelineStep
                key={step.number}
                step={step}
                side={index % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
