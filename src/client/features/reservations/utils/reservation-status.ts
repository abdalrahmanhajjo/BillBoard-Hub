import type { Reservation, ReservationStatus } from '../types/reservation';

export const RESERVATION_STATUS_VARIANT: Record<
  ReservationStatus,
  'default' | 'secondary' | 'success' | 'outline' | 'destructive'
> = {
  pending: 'default',
  approved: 'secondary',
  running: 'success',
  completed: 'outline',
  cancelled: 'destructive',
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  running: 'Running',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function getReservationProgress(reservation: Reservation): number {
  const start = new Date(reservation.startDate).getTime();
  const end = new Date(reservation.endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const total = end - start;
  const elapsed = now - start;

  return Math.round((elapsed / total) * 100);
}

export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}
