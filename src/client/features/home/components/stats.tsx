'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { AnimatedCounter } from '@/client/features/home/components/animated-counter';
import { stats as statsData } from '@/client/features/home/data/homepage';
import type { HomeStats } from '@/client/features/home/home.types';

const ease = [0.16, 1, 0.3, 1] as const;

export function Stats({ stats }: { stats: HomeStats }) {
  const reduceMotion = useReducedMotion();
  const [primaryStat, ...supportingStats] = statsData;
  const PrimaryIcon = primaryStat.icon;
  const primaryValue = primaryStat.dynamicKey ? stats[primaryStat.dynamicKey] : primaryStat.value;

  return (
    <section className="overflow-hidden bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Container className="py-20 sm:py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-3xl"
        >
          <h2 className="text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
            Lebanon, measured in real reach.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Live inventory and campaign activity, brought together in one marketplace.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-12">
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, x: -34, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease }}
            className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-blue-600 p-6 text-white sm:min-h-[560px] sm:rounded-[28px] sm:p-10 lg:col-span-7 lg:p-12"
          >
            <motion.div
              aria-hidden
              initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.1, ease }}
              className="absolute -top-24 -right-20 size-80 rounded-full border border-white/15 sm:size-[440px]"
            />
            <motion.div
              aria-hidden
              initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.1, delay: reduceMotion ? 0 : 0.1, ease }}
              className="absolute -top-8 -right-4 size-52 rounded-full border border-white/15 sm:size-72"
            />

            <div className="relative flex h-full min-h-[382px] flex-col justify-between sm:min-h-[480px]">
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-52 text-sm leading-6 text-white/72">
                  Premium placements currently represented across the platform.
                </p>
                <motion.span
                  initial={reduceMotion ? false : { rotate: -18, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                  className="flex size-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_18px_44px_rgba(30,64,175,.24)]"
                >
                  <PrimaryIcon className="size-6" aria-hidden />
                </motion.span>
              </div>

              <div>
                <AnimatedCounter
                  value={primaryValue}
                  suffix={primaryStat.suffix}
                  className="block text-[clamp(4rem,21vw,11rem)] leading-[0.76] font-semibold tracking-[-0.075em] tabular-nums"
                />
                <p className="mt-8 text-lg font-medium text-white">{primaryStat.label}</p>
              </div>
            </div>
          </motion.article>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: 0.12 },
              },
            }}
            className="flex flex-col rounded-[24px] border border-zinc-200 bg-zinc-50 px-5 sm:rounded-[28px] sm:px-9 lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {supportingStats.map((item) => {
              const Icon = item.icon;
              const value = item.dynamicKey ? stats[item.dynamicKey] : item.value;

              return (
                <motion.article
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, x: reduceMotion ? 0 : 28 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
                  }}
                  className="group flex flex-1 items-center gap-4 border-b border-zinc-200 py-7 last:border-b-0 sm:gap-7 sm:py-8 dark:border-zinc-800"
                >
                  <motion.span
                    whileHover={reduceMotion ? undefined : { rotate: -5, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300"
                  >
                    <Icon className="size-5" aria-hidden />
                  </motion.span>

                  <div className="min-w-0 flex-1">
                    <AnimatedCounter
                      value={value}
                      suffix={item.suffix}
                      className="block text-3xl leading-none font-semibold tracking-[-0.045em] text-zinc-950 tabular-nums min-[390px]:text-4xl sm:text-5xl dark:text-white"
                    />
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  </div>

                  <span className="hidden text-5xl leading-none font-light text-zinc-200 sm:block dark:text-zinc-700">
                    +
                  </span>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
