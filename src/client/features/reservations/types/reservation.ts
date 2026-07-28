export type ReservationStatus = 'pending' | 'approved' | 'running' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  billboardId: string;
  billboardName: string;
  billboardLocation: string;
  billboardImage: string;

  startDate: string;
  endDate: string;

  totalAmount: number;

  status: ReservationStatus;

  createdAt: string;
}
