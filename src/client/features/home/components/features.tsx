'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { features } from '@/client/features/home/data/homepage';

const ease = [0.16, 1, 0.3, 1] as const;

export function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="scroll-mt-24 overflow-hidden border-y border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container className="py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-4xl"
        >
          <h2 className="max-w-4xl text-4xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-7xl">
            Everything you need to run smarter campaigns.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Plan, launch, and measure every placement through one connected workflow.
          </p>
        </motion.div>

        <div className="relative mt-16 lg:mt-24">
          <motion.div
            aria-hidden
            initial={reduceMotion ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.2, ease }}
            className="absolute top-0 bottom-0 left-6 w-px origin-top bg-blue-600/35 lg:left-1/2"
          />

          <div className="grid gap-y-2 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const onRight = index % 2 === 1;

              return (
                <motion.article
                  key={feature.title}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: onRight ? 36 : -36,
                          y: 18,
                        }
                  }
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.7, delay: reduceMotion ? 0 : index * 0.05, ease }}
                  className={`group relative ml-12 py-8 lg:ml-0 lg:min-h-56 lg:py-10 ${
                    onRight ? 'lg:pl-10' : 'lg:pr-10'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-14 h-px w-6 bg-blue-600/35 lg:w-10 ${
                      onRight ? '-left-6 lg:-left-10' : '-left-6 lg:-right-10 lg:left-auto'
                    }`}
                  />

                  <div className="border-t border-zinc-300 pt-7 transition-colors duration-300 group-hover:border-blue-600 dark:border-zinc-700">
                    <div className="flex items-start gap-5">
                      <motion.span
                        whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_12px_32px_rgba(24,24,27,.07)] transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-900 dark:shadow-none"
                      >
                        <Icon className="size-6" aria-hidden />
                      </motion.span>

                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
