'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserRound } from 'lucide-react';
import { signOut } from 'next-auth/react';
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
import { BrandLogo } from '@/client/features/home/components/brand-logo';
import { navLinks, exploreGroup, brandName } from '@/client/features/home/data/homepage';
import type { UserRole } from '@/shared/types/user';
import { Button } from '@/client/ui/components/ui/button';

type NavbarUser = {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
};

type NavbarProps = {
  user: NavbarUser | null;
};

function BrandMark() {
  return (
    <Link
      href="/"
      aria-label={`${brandName} home`}
      className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <BrandLogo />
    </Link>
  );
}

function displayName(user: NavbarUser): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.name ||
    user.email?.split('@')[0] ||
    'Account'
  );
}

function initials(user: NavbarUser): string {
  const value = displayName(user)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return value.toUpperCase();
}

function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Advertiser';
}

export function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <BrandMark />

          <nav className="hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <Link
                href="/billboards"
                aria-expanded={exploreOpen}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {exploreGroup.label}
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', exploreOpen && 'rotate-180')}
                  aria-hidden
                />
              </Link>
              <AnimatePresence>
                {exploreOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-72 pt-2"
                  >
                    <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                      {exploreGroup.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="block rounded-lg px-3 py-2 transition-colors hover:bg-zinc-50"
                          >
                            <span className="block text-sm font-medium text-zinc-900">
                              {item.label}
                            </span>
                            {item.description ? (
                              <span className="mt-0.5 block text-xs text-zinc-500">
                                {item.description}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pr-3 pl-1.5 text-left shadow-sm transition-colors hover:border-zinc-300"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {initials(user)}
                  </span>
                  <span className="max-w-28 truncate text-sm font-semibold text-zinc-800">
                    {displayName(user)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 text-zinc-400 transition-transform',
                      accountOpen && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </Button>

                <AnimatePresence>
                  {accountOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full right-0 w-64 pt-2"
                    >
                      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10">
                        <div className="border-b border-zinc-100 px-3 py-3">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {displayName(user)}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">{roleLabel(user.role)}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          <LayoutDashboard className="size-4 text-zinc-400" aria-hidden />
                          Open dashboard
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => signOut({ redirectTo: '/' })}
                          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="size-4" aria-hidden />
                          Sign out
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(22rem,calc(100vw-1rem))] gap-0 overflow-y-auto p-0 pb-[env(safe-area-inset-bottom)]"
            >
              <SheetTitle className="border-b border-zinc-200 p-4">
                <BrandMark />
              </SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {[...exploreGroup.items, ...navLinks].map((item) => (
                  <SheetClose
                    key={item.label}
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        className="flex min-h-12 items-center rounded-lg px-3 py-2.5 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-2 flex flex-col gap-2 border-t border-zinc-200 p-4">
                {user ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {initials(user)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {displayName(user)}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{roleLabel(user.role)}</p>
                      </div>
                    </div>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/dashboard"
                          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        />
                      }
                    >
                      <LayoutDashboard className="size-4" aria-hidden />
                      Open Dashboard
                    </SheetClose>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signOut({ redirectTo: '/' })}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700"
                    >
                      <LogOut className="size-4" aria-hidden />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/login"
                          className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-semibold text-zinc-800"
                        />
                      }
                    >
                      <UserRound className="size-4" aria-hidden />
                      Login
                    </SheetClose>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/register"
                          className="flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        />
                      }
                    >
                      Get Started
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
