async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

export const paymentClientService = {
  async createCheckoutSession(bookingId: string) {
    const response = await fetch('/api/v1/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bookingId }),
    });

    return parseResponse(response);
  },

  async getByBookingId(bookingId: string) {
    const response = await fetch(`/api/v1/payments/${encodeURIComponent(bookingId)}`, {
      method: 'GET',
      credentials: 'include',
    });

    return parseResponse(response);
  },
};
