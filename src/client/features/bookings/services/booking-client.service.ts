import type { CreateBookingSchemaInput } from '@/shared/contracts/booking/booking.schema';

async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

type BookingListFilter = {
  billboardId?: string;
  status?: string;
};

export const bookingClientService = {
  async create(payload: CreateBookingSchemaInput) {
    const response = await fetch('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async list(filter: BookingListFilter = {}) {
    const params = new URLSearchParams();
    if (filter.billboardId) params.set('billboardId', filter.billboardId);
    if (filter.status) params.set('status', filter.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/v1/bookings${query}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },

  async cancel(bookingId: string) {
    const response = await fetch(`/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
