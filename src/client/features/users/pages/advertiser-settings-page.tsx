'use client';

import Link from 'next/link';
import { ArrowRight, KeyRound, LogOut, UserRound } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { WorkspacePage } from '@/client/features/dashboard/components/workspace-page';
import { SettingsRow } from '@/client/features/dashboard/components/settings-row';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { useLogout } from '@/client/features/auth/hooks/use-logout';

export function AdvertiserSettingsFeaturePage() {
  const logout = useLogout();

  return (
    <WorkspacePage
      title="Settings"
      description="Account and security options for your advertiser workspace."
    >
      <div className="max-w-xl space-y-4">
        <SettingsRow
          icon={UserRound}
          title="Profile details"
          description="Update the name and email shown on reservations and invoices."
          action={
            <Button
              variant="outline"
              render={<Link href={ADVERTISER_ROUTES.PROFILE} />}
              nativeButton={false}
              className="h-10"
            >
              Edit profile
              <ArrowRight className="size-4" aria-hidden />
            </Button>
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
      </div>
    </WorkspacePage>
  );
}
