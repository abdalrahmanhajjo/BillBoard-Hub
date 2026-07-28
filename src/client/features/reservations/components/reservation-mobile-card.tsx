'use client';

import { Badge } from '@/client/ui/components/ui/badge';
import { Card, CardContent } from '@/client/ui/components/ui/card';
import type { Reservation } from '../types/reservation';
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_VARIANT,
  formatCurrency,
  formatDate,
} from '../utils/reservation-status';

interface ReservationMobileCardProps {
  reservation: Reservation;
  onSelect: (reservation: Reservation) => void;
}

export function ReservationMobileCard({ reservation, onSelect }: ReservationMobileCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(reservation)}
      className="focus-visible:ring-ring w-full text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Card className="md:hidden">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-lg">
              {reservation.billboardImage && (
                <img
                  src={reservation.billboardImage}
                  alt={reservation.billboardName}
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{reservation.billboardName}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {reservation.billboardLocation}
                  </p>
                </div>
                <Badge
                  variant={RESERVATION_STATUS_VARIANT[reservation.status]}
                  className="shrink-0"
                >
                  {RESERVATION_STATUS_LABEL[reservation.status]}
                </Badge>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(reservation.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
