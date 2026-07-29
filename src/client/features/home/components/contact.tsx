'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { contactInfo, reviews } from '@/client/features/home/data/homepage';

const ease = [0.16, 1, 0.3, 1] as const;

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  contactInfo.location,
)}`;

const channels = [
  {
    icon: Mail,
    label: 'Email us',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
  },
  {
    icon: Phone,
    label: 'Call us',
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
  },
  {
    icon: MapPin,
    label: 'Visit us',
    value: contactInfo.location,
    href: directionsUrl,
  },
  {
    icon: Clock,
    label: 'Support hours',
    value: 'Mon–Fri, 9:00–18:00 (GMT+2)',
    href: undefined,
  },
];

export function Contact() {
  const reduceMotion = useReducedMotion();
  const clientAvatars = reviews.slice(0, 5);

  return (
    <section id="contact" className="scroll-mt-24 bg-white dark:bg-zinc-950">
      <Container className="py-20 sm:py-24 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
          className="grid overflow-hidden rounded-[28px] border border-zinc-200 shadow-[0_30px_80px_-40px_rgba(24,24,27,0.35)] lg:grid-cols-2 dark:border-zinc-800"
        >
          {/* Left — accent panel with the client avatar cluster. */}
          <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 p-8 text-white sm:p-10 lg:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.16em] text-blue-100 uppercase">
                Contact
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
                Let&apos;s plan your campaign.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-blue-50/90">
                Tell us your goals and dates — a real person on our Beirut team will help you pick
                the right placements and get you live.
              </p>

              <div className="mt-9 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {clientAvatars.map((review, index) => (
                    <span
                      key={review.author}
                      className={`flex size-11 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ring-2 ring-blue-600 ${
                        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                      }`}
                    >
                      {initials(review.author)}
                    </span>
                  ))}
                  <span className="flex size-11 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white ring-2 ring-blue-600 backdrop-blur-sm">
                    +295
                  </span>
                </div>
                <p className="text-sm font-medium text-blue-50">
                  Trusted by 300+ advertisers
                  <span className="block text-xs text-blue-100/80">across Lebanon</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right — contact channels + CTA. */}
          <div className="flex flex-col justify-between gap-8 bg-white p-8 sm:p-10 lg:p-12 dark:bg-zinc-900">
            <ul className="space-y-2">
              {channels.map((channel) => {
                const body = (
                  <span className="flex items-center gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15">
                      <channel.icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-zinc-400">
                        {channel.label}
                      </span>
                      <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {channel.value}
                      </span>
                    </span>
                  </span>
                );
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="-mx-3 block rounded-xl px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="-mx-3 rounded-xl px-3 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <Link
              href="/billboards"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start your reservation
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
