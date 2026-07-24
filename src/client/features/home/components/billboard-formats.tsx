'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MoveUpRight } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { billboardFormats } from '@/client/features/home/data/homepage';

const ease = [0.16, 1, 0.3, 1] as const;

export function BillboardFormats() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.6 });
  const imageX = useTransform(smoothX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-10, 10]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], reduceMotion ? [0, 0] : [-8, 8]);
  const imageRotateX = useTransform(smoothY, [-0.5, 0.5], reduceMotion ? [0, 0] : [1.5, -1.5]);
  const imageRotateY = useTransform(smoothX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-1.5, 1.5]);

  const activeFormat = billboardFormats[activeIndex];
  const ActiveIcon = activeFormat.icon;

  return (
    <section
      id="formats"
      className="scroll-mt-24 overflow-hidden border-y border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container className="py-20 sm:py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease }}
          className="grid gap-8 lg:grid-cols-[1fr_25rem] lg:items-end lg:gap-16"
        >
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
              <span className="h-px w-10 bg-blue-600" aria-hidden />
              Billboard formats
            </div>
            <h2 className="max-w-4xl text-4xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-7xl">
              One city. Five ways to own the moment.
            </h2>
          </div>
          <div className="border-l-2 border-blue-600 pl-5">
            <p className="max-w-sm text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Match your message to how people move—from fast highway reach to immersive,
              street-level attention.
            </p>
            <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              05 distinct media environments
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:mt-14 lg:mt-20 lg:grid-cols-[1.45fr_.85fr] lg:gap-5">
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease }}
            onPointerMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
              pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
            }}
            onPointerLeave={() => {
              pointerX.set(0);
              pointerY.set(0);
            }}
            className="relative aspect-[4/5] min-h-[460px] overflow-hidden rounded-[24px] bg-zinc-900 shadow-[0_32px_80px_rgba(24,24,27,.14)] sm:aspect-auto sm:min-h-[620px] sm:rounded-[28px] lg:min-h-[680px]"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={activeFormat.image}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.04 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.7, ease }}
                className="absolute -inset-4"
                style={{
                  x: imageX,
                  y: imageY,
                  rotateX: imageRotateX,
                  rotateY: imageRotateY,
                }}
              >
                <Image
                  src={activeFormat.image}
                  alt={activeFormat.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,.02)_30%,rgba(9,9,11,.78)_100%)]" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-white sm:p-8">
              <span className="rounded-full border border-white/25 bg-zinc-950/25 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                Format {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-white/70">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(billboardFormats.length).padStart(2, '0')}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9 lg:p-11">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFormat.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.42, ease }}
                >
                  <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur-md">
                    <ActiveIcon className="size-5" aria-hidden />
                  </div>
                  <h3 className="max-w-lg text-3xl leading-none font-semibold tracking-[-0.04em] sm:text-5xl">
                    {activeFormat.title}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base">
                    {activeFormat.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 flex items-center gap-4">
                <Link
                  href={activeFormat.href}
                  className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-zinc-950 transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
                >
                  View placements
                  <MoveUpRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
                <span className="hidden text-xs text-white/60 sm:block">Live inventory</span>
              </div>
            </div>
          </motion.article>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
            }}
            className="grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[84%] grid-flow-col gap-2 overflow-x-auto overscroll-x-contain rounded-[24px] pb-1 lg:flex lg:snap-none lg:flex-col lg:gap-0 lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-zinc-200 lg:pb-0 lg:dark:border-zinc-800 [&::-webkit-scrollbar]:hidden"
          >
            {billboardFormats.map((format, index) => {
              const Icon = format.icon;
              const active = index === activeIndex;

              return (
                <motion.button
                  key={format.title}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, x: reduceMotion ? 0 : 22 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
                  }}
                  onClick={() => setActiveIndex(index)}
                  onPointerEnter={() => setActiveIndex(index)}
                  aria-pressed={active}
                  className={`group relative flex min-h-24 snap-start items-center gap-3 rounded-2xl border border-zinc-200 px-4 text-left transition-colors sm:auto-cols-[62%] sm:px-6 lg:min-h-0 lg:flex-1 lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:px-7 lg:last:border-b-0 dark:border-zinc-800 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <motion.span
                    animate={{
                      scale: active && !reduceMotion ? 1.08 : 1,
                      rotate: active && !reduceMotion ? -4 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                      active
                        ? 'bg-white/14 text-white'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </motion.span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`mb-1 block text-[10px] font-semibold tracking-[0.16em] uppercase ${
                        active ? 'text-white/65' : 'text-zinc-400'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block text-base font-semibold tracking-tight">
                      {format.title}
                    </span>
                    <AnimatePresence initial={false}>
                      {active ? (
                        <motion.span
                          initial={reduceMotion ? false : { opacity: 0, height: 0, y: 5 }}
                          animate={{ opacity: 0.75, height: 'auto', y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -3 }}
                          transition={{ duration: 0.28, ease }}
                          className="mt-1.5 block overflow-hidden text-xs leading-5"
                        >
                          {format.description}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </span>
                  <ArrowRight
                    className={`hidden size-4 shrink-0 transition-transform duration-300 min-[390px]:block ${
                      active
                        ? 'translate-x-1 text-white'
                        : 'text-zinc-400 group-hover:translate-x-1'
                    }`}
                    aria-hidden
                  />
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
