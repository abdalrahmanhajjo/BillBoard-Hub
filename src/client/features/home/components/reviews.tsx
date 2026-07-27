'use client';

import { Quote, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { reviews } from '@/client/features/home/data/homepage';
import type { Review } from '@/client/features/home/home.types';

const ease = [0.16, 1, 0.3, 1] as const;

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-sky-500 to-cyan-500',
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function gradientFor(name: string): string {
  let hash = 0;
  for (const char of name) hash += char.charCodeAt(0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${
            index < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="mr-5 flex w-80 shrink-0 flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-800 ${gradientFor(
            review.author,
          )}`}
        >
          {initials(review.author)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {review.author}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{review.role}</p>
        </div>
        <Quote className="ml-auto size-7 shrink-0 text-zinc-100 dark:text-zinc-700" aria-hidden />
      </div>
      <Stars rating={review.rating} className="mt-4" />
      <blockquote className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        “{review.quote}”
      </blockquote>
    </figure>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Review[]; reverse?: boolean }) {
  const animation = reverse
    ? 'motion-safe:animate-[marquee-reverse_46s_linear_infinite]'
    : 'motion-safe:animate-[marquee_46s_linear_infinite]';
  return (
    <div className="group flex overflow-hidden">
      <div className={`flex shrink-0 ${animation} group-hover:paused`}>
        {[...items, ...items].map((review, index) => (
          <ReviewCard key={`${review.author}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export function Reviews() {
  const reduceMotion = useReducedMotion();
  const topRow = reviews;
  const bottomRow = [...reviews].reverse();

  return (
    <section
      id="reviews"
      className="scroll-mt-24 overflow-hidden border-y border-zinc-200 bg-white py-20 text-zinc-950 sm:py-24 lg:py-32 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.65, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
            <span className="h-px w-8 bg-blue-600" aria-hidden />
            Reviews
            <span className="h-px w-8 bg-blue-600" aria-hidden />
          </div>
          <h2 className="text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            Loved by advertisers across Lebanon.
          </h2>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Stars rating={5} />
            <span className="font-semibold">4.9/5</span>
            <span className="text-zinc-500 dark:text-zinc-400">from 300+ campaigns launched</span>
          </div>
        </motion.div>
      </Container>

      {/* Edge-to-edge marquee wall — two rows drifting in opposite directions,
          each pausing on hover so a card can be read. */}
      <div className="relative mt-12 space-y-5 mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:mt-16">
        <MarqueeRow items={topRow} />
        <MarqueeRow items={bottomRow} reverse />
      </div>
    </section>
  );
}
