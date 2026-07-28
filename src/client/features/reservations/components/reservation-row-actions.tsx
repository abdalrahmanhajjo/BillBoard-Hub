'use client';

import { Button } from '@/client/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/client/ui/components/ui/dropdown-menu';
import type { Reservation } from '../types/reservation';
import { DownloadIcon, EyeIcon, LifeBuoyIcon, MoreHorizontalIcon } from 'lucide-react';

interface ReservationRowActionsProps {
  reservation: Reservation;
}

export function ReservationRowActions({ reservation }: ReservationRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuLabel>{reservation.id}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // TODO: Navigate to reservation details
            console.log('View details:', reservation.id);
          }}
        >
          <EyeIcon className="size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // TODO: Download invoice
            console.log('Download invoice:', reservation.id);
          }}
        >
          <DownloadIcon className="size-4" />
          Download Invoice
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // TODO: Open contact support
            console.log('Contact support for:', reservation.id);
          }}
        >
          <LifeBuoyIcon className="size-4" />
          Contact Support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
