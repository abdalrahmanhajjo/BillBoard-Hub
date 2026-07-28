'use client';

import { Badge } from '@/client/ui/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import type { Reservation } from '../types/reservation';
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_VARIANT,
  formatCurrency,
  formatDate,
  getReservationProgress,
} from '../utils/reservation-status';
import { ReservationProgress } from './reservation-progress';
import { ReservationRowActions } from './reservation-row-actions';

interface ReservationTableProps {
  reservations: Reservation[];
  onSelect: (reservation: Reservation) => void;
}

export function ReservationTable({ reservations, onSelect }: ReservationTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reservation</TableHead>
            <TableHead>Billboard</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow
              key={reservation.id}
              className="cursor-pointer"
              onClick={() => onSelect(reservation)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{reservation.id}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(reservation.createdAt)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{reservation.billboardName}</span>
                  <span className="text-muted-foreground text-xs">
                    {reservation.billboardLocation}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs">
                    {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={RESERVATION_STATUS_VARIANT[reservation.status]}>
                  {RESERVATION_STATUS_LABEL[reservation.status]}
                </Badge>
              </TableCell>
              <TableCell className="min-w-[120px]">
                <ReservationProgress value={getReservationProgress(reservation)} />
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(reservation.totalAmount)}
              </TableCell>
              <TableCell>
                <div onClick={(e) => e.stopPropagation()}>
                  <ReservationRowActions reservation={reservation} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
