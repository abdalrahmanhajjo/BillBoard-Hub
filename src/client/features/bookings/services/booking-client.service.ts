import type { CreateBookingSchemaInput } from '@/shared/contracts/booking/booking.schema';
import type { BookingStatus } from '@/shared/types/booking';
import { apiRequest } from '@/client/lib/response-utils';

type BookingListFilter = {
  billboardId?: string;
  status?: BookingStatus;
};

export const bookingClientService = {
  async create(payload: CreateBookingSchemaInput) {
    return apiRequest('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async list(filter: BookingListFilter = {}) {
    const params = new URLSearchParams();
    if (filter.billboardId) params.set('billboardId', filter.billboardId);
    if (filter.status) params.set('status', filter.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/v1/bookings${query}`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  async cancel(bookingId: string) {
    return apiRequest(`/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async updateStatus(bookingId: string, status: Extract<BookingStatus, 'approved' | 'rejected'>) {
    return apiRequest(`/api/v1/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
  },
};
