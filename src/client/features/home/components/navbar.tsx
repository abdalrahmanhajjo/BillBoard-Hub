'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, LayoutDashboard, LogOut, Menu, UserRound } from 'lucide-react';
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
import { Button } from '@/client/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/client/ui/components/ui/dropdown-menu';
import { useLogout } from '@/client/features/auth/hooks/use-logout';

type NavbarViewer = {
  firstName: string;
  lastName: string;
  email: string;
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

export function Navbar({ viewer }: { viewer?: NavbarViewer | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const { scrollY } = useScroll();
  const router = useRouter();
  const logoutMutation = useLogout();
  const displayName = [viewer?.firstName, viewer?.lastName].filter(Boolean).join(' ');
  const initials =
    `${viewer?.firstName?.[0] ?? ''}${viewer?.lastName?.[0] ?? ''}`.toUpperCase() || 'A';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/');
      router.refresh();
    } catch {}
  };

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
            {viewer ? (
              <>
                <Link
                  href="/user/advertiser/bookings"
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  My bookings
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-2 rounded-xl border-zinc-200 bg-white px-2.5 pr-3 text-zinc-800 shadow-sm hover:bg-zinc-50"
                      />
                    }
                  >
                    <span className="flex size-6 items-center justify-center rounded-lg bg-blue-600 text-[0.65rem] font-bold text-white">
                      {initials}
                    </span>
                    <span className="max-w-28 truncate">{viewer.firstName || 'Account'}</span>
                    <ChevronDown className="size-3.5 text-zinc-400" aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-2 py-2 font-normal">
                        <span className="block truncate text-sm font-semibold text-zinc-950">
                          {displayName || 'Advertiser account'}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-zinc-500">
                          {viewer.email}
                        </span>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem render={<Link href="/user/advertiser" />}>
                        <LayoutDashboard aria-hidden />
                        Advertiser workspace
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/user/advertiser/bookings" />}>
                        <CalendarDays aria-hidden />
                        My bookings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={logoutMutation.isPending}
                      onClick={() => handleLogout()}
                    >
                      <LogOut aria-hidden />
                      {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
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
                {viewer ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                        {initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-zinc-950">
                          {displayName || 'Advertiser account'}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">{viewer.email}</span>
                      </span>
                    </div>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/user/advertiser"
                          className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-semibold text-zinc-800"
                        />
                      }
                    >
                      <LayoutDashboard className="size-4" aria-hidden />
                      Advertiser workspace
                    </SheetClose>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/user/advertiser/bookings"
                          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        />
                      }
                    >
                      <CalendarDays className="size-4" aria-hidden />
                      My bookings
                    </SheetClose>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={logoutMutation.isPending}
                      onClick={() => handleLogout()}
                      className="min-h-12 gap-2 rounded-lg text-zinc-600"
                    >
                      <LogOut className="size-4" aria-hidden />
                      {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
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
