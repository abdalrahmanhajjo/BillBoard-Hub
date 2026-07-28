import { apiRequest } from '@/client/ui/lib/api-client';
import type { Booking, PaymentStatus as BookingPaymentStatus } from '@/shared/types/booking';
import type { CheckoutVerification, Payment } from '@/shared/types/payment';

export const paymentClientService = {
  /** Create a Stripe SetupIntent for secure Visa collection in reservation Step 3. */
  createCardSetup() {
    return apiRequest<{ clientSecret: string; setupIntentId: string }>('/api/v1/payments/setup', {
      method: 'POST',
      credentials: 'include',
    });
  },

  /** Create (or reuse) a Stripe Checkout session for an approved booking. */
  createCheckoutSession(bookingId: string) {
    return apiRequest<{ url: string }>('/api/v1/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bookingId }),
    });
  },

  getByBookingId(bookingId: string) {
    return apiRequest<{ payment: Payment | null }>(
      `/api/v1/payments/${encodeURIComponent(bookingId)}`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );
  },

  verifyCheckoutSession(sessionId: string) {
    return apiRequest<CheckoutVerification>(
      `/api/v1/payments/session/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
    );
  },

  recordManualPayment(
    bookingId: string,
    input: {
      status: Extract<BookingPaymentStatus, 'paid' | 'partially_paid' | 'unpaid' | 'refunded'>;
      amountPaid?: number;
      note?: string;
    },
  ) {
    return apiRequest<{ payment: Payment; booking: Booking }>(
      `/api/v1/payments/${encodeURIComponent(bookingId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      },
    );
  },

  refundCardPayment(
    bookingId: string,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
  ) {
    return apiRequest<{ payment: Payment }>(
      `/api/v1/payments/${encodeURIComponent(bookingId)}/refund`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      },
    );
  },
};
