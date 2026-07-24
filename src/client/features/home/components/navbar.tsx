'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Menu } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '@/client/ui/lib/utils';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/client/ui/components/ui/sheet';
import { Container } from '@/client/features/home/components/container';
import { navLinks, solutionsGroup, brandName } from '@/client/features/home/data/homepage';

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <path
            d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-tight text-zinc-900">{brandName}</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-zinc-200 bg-white/90 shadow-sm backdrop-blur'
          : 'border-transparent bg-white/70 backdrop-blur-sm',
      )}
    >
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <BrandMark />

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/billboards"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Billboards
            </Link>
            <Link
              href="/#how-it-works"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              How It Works
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={solutionsOpen}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {solutionsGroup.label}
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', solutionsOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>
              <AnimatePresence>
                {solutionsOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-52 pt-2"
                  >
                    <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                      {solutionsGroup.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="block px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {['Pricing', 'FAQ', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/#${label.toLowerCase()}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <Globe className="h-4 w-4" aria-hidden />
              EN
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0 p-0">
              <SheetTitle className="border-b border-zinc-200 p-4">
                <BrandMark />
              </SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {[...navLinks, ...solutionsGroup.items].map((item) => (
                  <SheetClose
                    key={item.label}
                    render={
                      <Link
                        href={item.href}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-2 flex flex-col gap-2 border-t border-zinc-200 p-4">
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className="rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-semibold text-zinc-800"
                    />
                  }
                >
                  Login
                </SheetClose>
                <SheetClose
                  render={
                    <Link
                      href="/register"
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    />
                  }
                >
                  Get Started
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
