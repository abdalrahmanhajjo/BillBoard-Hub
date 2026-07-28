import Link from 'next/link';
import { ArrowLeft, MonitorPlay } from 'lucide-react';
import type { PublicBillboard } from '@/shared/types/billboard';
import { BillboardStage } from '@/client/features/auth/components/billboard-stage';

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Real catalogue boards shown beside the form on large screens. */
  boards: PublicBillboard[];
};

/**
 * Shared frame for every auth screen: photographs of real inventory on the left
 * (large screens only) and a single measured column for the form on the right,
 * so the fields keep a comfortable reading width no matter the viewport.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  boards,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
      <BillboardStage boards={boards} />

      <main className="bg-background flex flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto flex w-full max-w-104 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:outline-none lg:hidden"
          >
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <MonitorPlay className="size-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">Boardly</span>
          </Link>

          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 ml-auto inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-104 flex-1 flex-col justify-center py-10">
          <header className="mb-7">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2rem]">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{description}</p>
          </header>

          {children}

          {footer ? <div className="mt-7">{footer}</div> : null}
        </div>

        <p className="text-muted-foreground mx-auto w-full max-w-104 text-xs">
          By continuing you agree to the{' '}
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
