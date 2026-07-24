'use client';

import { useState } from 'react';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { faqs } from '@/client/features/home/data/homepage';

const ease = [0.16, 1, 0.3, 1] as const;

export function Faq() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeFaq = faqs[activeIndex];

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container className="py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-4xl"
        >
          <h2 className="max-w-3xl text-4xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-7xl">
            Questions, answered clearly.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            The practical details brands and agencies ask before launching a campaign.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-[1.05fr_.95fr]">
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
            className="overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-50 px-5 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {faqs.map((faq, index) => {
              const active = index === activeIndex;

              return (
                <motion.button
                  key={faq.question}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, x: reduceMotion ? 0 : -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
                  }}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={active}
                  aria-controls="faq-answer"
                  className={`group flex w-full items-center gap-4 border-b border-zinc-200 py-6 text-left transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:py-7 dark:border-zinc-800 ${
                    active ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-zinc-400 group-hover:text-blue-600 dark:bg-zinc-800'
                    }`}
                  >
                    <MessageCircleQuestion className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-base leading-6 font-medium sm:text-lg">
                    {faq.question}
                  </span>
                  <ArrowRight
                    className={`size-4 shrink-0 transition-transform duration-300 ${
                      active
                        ? 'translate-x-1 text-blue-600'
                        : 'text-zinc-400 group-hover:translate-x-1'
                    }`}
                    aria-hidden
                  />
                </motion.button>
              );
            })}
          </motion.div>

          <motion.article
            id="faq-answer"
            role="region"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease }}
            className="relative min-h-[430px] overflow-hidden rounded-[28px] bg-blue-600 p-7 text-white sm:min-h-[520px] sm:p-10 lg:min-h-full lg:p-12"
          >
            <div
              aria-hidden
              className="absolute -right-24 -bottom-24 size-80 rounded-full border border-white/15"
            />
            <div
              aria-hidden
              className="absolute -right-8 -bottom-8 size-48 rounded-full border border-white/15"
            />

            <div className="relative flex h-full min-h-[370px] flex-col justify-between sm:min-h-[440px]">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-blue-600">
                <MessageCircleQuestion className="size-6" aria-hidden />
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq.question}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.38, ease }}
                >
                  <h3 className="max-w-lg text-2xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                    {activeFaq.question}
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
                    {activeFaq.answer}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}
