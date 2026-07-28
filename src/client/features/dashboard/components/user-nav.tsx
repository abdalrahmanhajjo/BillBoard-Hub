'use client';

import { LogOutIcon, SettingsIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/client/ui/components/ui/avatar';
import { Button } from '@/client/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/client/ui/components/ui/dropdown-menu';
import type { DashboardUser } from '@/client/features/dashboard/types/dashboard-user';

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'U';
}

async function handleSignOut() {
  await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}

export function UserNav({ user }: { user: DashboardUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full" />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{`${user.firstName} ${user.lastName}`}</DropdownMenuLabel>
        <p className="text-muted-foreground truncate px-2 pb-1.5 text-xs">{user.email}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="/dashboard/advertiser/settings" />}>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
