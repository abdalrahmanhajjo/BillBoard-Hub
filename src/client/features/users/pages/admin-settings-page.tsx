'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  Coins,
  KeyRound,
  LogOut,
  MonitorPlay,
  Palette,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { WorkspacePage } from '@/client/features/dashboard/components/workspace-page';
import { SettingsRow } from '@/client/features/dashboard/components/settings-row';
import { ThemeModeToggle } from '@/client/layouts/components/theme-mode-toggle';
import { useLogout } from '@/client/features/auth/hooks/use-logout';
import {
  BOOKING_CURRENCIES,
  BOOKING_SERVICE_FEE_RATE,
  BOOKING_VAT_RATE,
  DIGITAL_RESERVATION_DAILY_LIMIT,
  STATIC_RESERVATION_DAILY_LIMIT,
} from '@/shared/constants/booking';
import { MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed((rate * 100) % 1 === 0 ? 0 : 1)}%`;
}

/**
 * Platform values that reservations and playback are priced and constrained by.
 * They are build-time constants rather than stored configuration, so they are
 * reported here read-only — changing one is a code change, not a settings edit.
 */
const PLATFORM_VALUES = [
  {
    icon: Coins,
    title: 'Reservation pricing',
    description: `Service fee ${formatRate(BOOKING_SERVICE_FEE_RATE)} · VAT ${formatRate(BOOKING_VAT_RATE)} applied to every quote.`,
  },
  {
    icon: Coins,
    title: 'Accepted currencies',
    description: `Invoices may be issued in ${BOOKING_CURRENCIES.join(', ')}.`,
  },
  {
    icon: MonitorPlay,
    title: 'Daily reservation capacity',
    description: `${STATIC_RESERVATION_DAILY_LIMIT} per static face, up to ${DIGITAL_RESERVATION_DAILY_LIMIT} per digital screen.`,
  },
  {
    icon: MonitorPlay,
    title: 'Creative limits',
    description: `Video creatives must run shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
  },
] as const;

export function AdminSettingsFeaturePage() {
  const { data: session } = useSession();
  const logout = useLogout();
  const user = session?.user;

  const signedInAs = user
    ? `${[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}${user.email ? ` · ${user.email}` : ''}`
    : 'Loading your account...';

  return (
    <WorkspacePage
      title="Settings"
      description="Account, security, and platform options for your admin workspace."
    >
      <div className="max-w-xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Account
          </h2>

          <SettingsRow icon={UserRound} title="Signed in as" description={signedInAs} />

          <SettingsRow
            icon={ShieldCheck}
            title="Access level"
            description={
              user
                ? `Role ${user.role} · ${user.isActive ? 'active' : 'deactivated'}. Admin permissions are granted by role and cannot be edited here.`
                : 'Admin permissions are granted by role and cannot be edited here.'
            }
          />

          <SettingsRow
            icon={KeyRound}
            title="Password"
            description="Reset your password by email from the sign-in screen."
            action={
              <Button
                variant="outline"
                render={<Link href="/forgot-password" />}
                nativeButton={false}
                className="h-10"
              >
                Reset password
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            }
          />

          <SettingsRow
            icon={Palette}
            title="Appearance"
            description="Switch this device between the light and dark theme."
            action={<ThemeModeToggle />}
          />

          <SettingsRow
            icon={LogOut}
            title="Sign out"
            description="End this session on the current device."
            action={
              <Button
                variant="outline"
                className="h-10"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
              >
                {logout.isPending ? 'Signing out...' : 'Sign out'}
              </Button>
            }
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Platform
          </h2>

          {PLATFORM_VALUES.map((value) => (
            <SettingsRow
              key={value.title}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}

          <p className="text-muted-foreground text-xs">
            These values are set in code and apply platform-wide. Changing one requires a deploy, so
            they are shown here for reference rather than as editable fields.
          </p>
        </section>
      </div>
    </WorkspacePage>
  );
}
