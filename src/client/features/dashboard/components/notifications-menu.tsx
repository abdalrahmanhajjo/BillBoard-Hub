'use client';

import { BellIcon } from 'lucide-react';

import { Button } from '@/client/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/client/ui/components/ui/dropdown-menu';

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Notifications" />}
      >
        <BellIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <p className="text-muted-foreground px-2 py-3 text-sm">
          You&apos;re all caught up — no new notifications.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
