'use client';

import { BadgeCheck, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/client/ui/components/ui/input';
import { Button } from '@/client/ui/components/ui/button';
import { Container } from '@/client/features/home/components/container';
import { fadeUp, viewportOnce } from '@/client/features/home/lib/animations';

export function Cta() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-white">
      <Container className="pb-24 lg:pb-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/60 p-10 lg:flex-row lg:items-center lg:justify-between lg:p-16"
        >
          {/* Subtle animated background blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-12 h-60 w-60 rounded-full bg-blue-200/40 blur-3xl"
            animate={{ y: [0, 24, 0], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-indigo-200/40 blur-3xl"
            animate={{ y: [0, -22, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-start gap-5">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm sm:flex">
              <ClipboardList className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">
                Ready to get your brand seen?
              </h2>
              <p className="mt-3 max-w-lg text-base text-zinc-600 lg:text-lg">
                Tell us your goals and we&apos;ll help you plan the perfect out of home campaign.
              </p>
            </div>
          </div>

          <form
            action="/register"
            method="get"
            className="relative flex w-full max-w-md flex-col gap-2.5 lg:w-auto"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <label htmlFor="cta-email" className="sr-only">
                Your work email
              </label>
              <Input
                id="cta-email"
                name="email"
                type="email"
                placeholder="Your work email"
                className="h-12 bg-white text-base sm:w-72"
              />
              <Button
                type="submit"
                className="h-12 rounded-xl bg-blue-600 px-7 text-base font-semibold text-white hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
              <BadgeCheck className="h-4 w-4 text-emerald-500" aria-hidden />
              No spam ever. Unsubscribe anytime.
            </p>
          </form>
        </motion.div>
      </Container>
    </section>
  );
}
