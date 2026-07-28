'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, Headphones } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { Button } from '@/client/ui/components/ui/button';
import type { FaqItem } from '@/client/features/home/home.types';

const ease = [0.16, 1, 0.3, 1] as const;
const faqTopics = ['Booking', 'Availability', 'Inventory', 'Billing', 'Planning'];

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeFaq = faqs[activeIndex];
  const activeNumber = String(activeIndex + 1).padStart(2, '0');

  return (
    <section
      id="faq"
      className="scroll-mt-24 overflow-hidden bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container className="py-20 sm:py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
              Before you book
            </p>
            <h2 className="mt-5 max-w-4xl text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
              Questions, answered clearly.
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-sm text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Straight answers about choosing inventory, setting dates, pricing, and getting your
              campaign live.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 transition-colors hover:text-blue-600 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-white"
            >
              Ask a different question
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
          }}
          className="mt-12 overflow-hidden border-y border-zinc-200 lg:hidden dark:border-zinc-800"
        >
          {faqs.map((faq, index) => {
            const active = index === activeIndex;
            const answerId = `faq-mobile-answer-${index}`;

            return (
              <motion.article
                key={faq.question}
                variants={{
                  hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
                }}
                className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveIndex(index)}
                  aria-expanded={active}
                  aria-controls={answerId}
                  className="group h-auto min-h-24 w-full rounded-none px-0 py-5 text-left hover:bg-transparent"
                >
                  <span
                    className={`font-mono text-xs transition-colors ${
                      active ? 'text-blue-600' : 'text-zinc-400'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                      {faqTopics[index] ?? 'General'}
                    </span>
                    <span
                      className={`mt-1.5 block text-base leading-6 font-semibold text-wrap transition-colors ${
                        active
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      active
                        ? 'rotate-180 border-blue-600 bg-blue-600 text-white'
                        : 'border-zinc-200 text-zinc-500 group-hover:border-blue-300 group-hover:text-blue-600 dark:border-zinc-700'
                    }`}
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </span>
                </Button>

                <AnimatePresence initial={false}>
                  {active ? (
                    <motion.div
                      id={answerId}
                      role="region"
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-7 pl-7 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mt-20 hidden gap-3 lg:grid lg:grid-cols-[minmax(0,.92fr)_minmax(30rem,1.08fr)]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: 0.05 },
              },
            }}
            className="flex flex-col gap-2 rounded-[28px] bg-zinc-100/80 p-3 dark:bg-zinc-900"
          >
            {faqs.map((faq, index) => {
              const active = index === activeIndex;

              return (
                <Button
                  key={faq.question}
                  render={
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, x: reduceMotion ? 0 : -18 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
                      }}
                    />
                  }
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={active}
                  aria-controls="faq-desktop-answer"
                  className={`group relative flex h-auto min-h-[6.65rem] w-full items-center gap-4 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                    active
                      ? 'border-zinc-200 bg-white shadow-[0_8px_24px_rgba(24,24,27,.07)] hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-800'
                      : 'border-transparent bg-transparent hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-zinc-400 group-hover:text-blue-600 dark:bg-zinc-800'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                        active ? 'text-blue-600' : 'text-zinc-400'
                      }`}
                    >
                      {faqTopics[index] ?? 'General'}
                    </span>
                    <span
                      className={`mt-1.5 block max-w-lg text-[1.05rem] leading-6 font-semibold text-wrap transition-colors ${
                        active
                          ? 'text-zinc-950 dark:text-white'
                          : 'text-zinc-600 group-hover:text-zinc-950 dark:text-zinc-400 dark:group-hover:text-white'
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? '-rotate-90 bg-blue-50 text-blue-600 dark:bg-blue-950'
                        : 'text-zinc-400 group-hover:-rotate-90 group-hover:text-blue-600'
                    }`}
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </span>
                </Button>
              );
            })}
          </motion.div>

          <motion.article
            id="faq-desktop-answer"
            role="region"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease }}
            className="relative min-h-[36rem] overflow-hidden rounded-[28px] bg-[#1556d7] p-10 text-white xl:p-14"
          >
            <div
              aria-hidden
              className="absolute inset-0 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.14]"
            />
            <div
              aria-hidden
              className="absolute -right-32 -bottom-32 size-96 rounded-full border border-white/15"
            />
            <div
              aria-hidden
              className="absolute -right-10 -bottom-10 size-56 rounded-full border border-white/15"
            />

            <div className="relative flex h-full min-h-[29rem] flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.16em] text-white/65 uppercase">
                  {faqTopics[activeIndex]}
                </span>
                <span className="font-mono text-sm text-white/55">
                  {activeNumber} / {String(faqs.length).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-6 h-px overflow-hidden bg-white/15">
                <motion.div
                  className="h-full bg-white"
                  animate={{ width: `${((activeIndex + 1) / faqs.length) * 100}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq.question}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.38, ease }}
                  className="my-auto py-12"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-blue-700">
                    <Check className="size-5" strokeWidth={2.4} aria-hidden />
                  </span>
                  <h3 className="mt-9 max-w-2xl text-3xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance xl:text-5xl">
                    {activeFaq.question}
                  </h3>
                  <p className="mt-7 max-w-xl text-base leading-8 text-white/78 xl:text-lg">
                    {activeFaq.answer}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between border-t border-white/15 pt-6">
                <span className="text-xs text-white/60">Clear details before you commit</span>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-75 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Talk to our team
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </motion.article>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease }}
          className="mt-8 flex flex-col gap-4 rounded-2xl bg-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-zinc-800">
              <Headphones className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Need an answer specific to your campaign?
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Share your locations, dates, and budget with our planning team.
              </p>
            </div>
          </div>
          <Link
            href="/#contact"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 dark:bg-white dark:text-zinc-950"
          >
            Contact planning
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
