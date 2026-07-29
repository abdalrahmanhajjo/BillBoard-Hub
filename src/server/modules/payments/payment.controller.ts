import { apiResponse } from '@/server/http/api-response';
import {
  handleControllerError,
  requireSession,
  validationMessage,
} from '@/server/http/controller-utils';
import { paymentService } from '@/server/modules/payments/payment.service';
import {
  createCheckoutSessionSchema,
  getPaymentByBookingSchema,
  recordManualPaymentSchema,
  refundPaymentSchema,
  verifyCheckoutSessionSchema,
  type CreateCheckoutSessionSchemaInput,
  type RecordManualPaymentSchemaInput,
  type RefundPaymentSchemaInput,
} from '@/shared/contracts/payments/payment.schema';

export const paymentController = {
  async createCheckoutSession(payload: CreateCheckoutSessionSchemaInput) {
    const parsed = createCheckoutSessionSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid booking id.'));
    }

    try {
      const session = await requireSession();
      const result = await paymentService.createCheckoutSession(
        parsed.data.bookingId,
        session.user,
      );
      return apiResponse.ok(result);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not start secure card checkout. Refresh and try again.',
      );
    }
  },

  async getByBookingId(bookingId: string) {
    const parsed = getPaymentByBookingSchema.safeParse({ bookingId });

    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid booking id.'));
    }

    try {
      const session = await requireSession();
      const payment = await paymentService.getPaymentByBookingId(
        parsed.data.bookingId,
        session.user,
      );
      return apiResponse.ok({ payment });
    } catch (error) {
      return handleControllerError(error, 'We could not load this payment. Refresh and try again.');
    }
  },

  async verifyCheckoutSession(sessionId: string) {
    const parsed = verifyCheckoutSessionSchema.safeParse({ sessionId });
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'The Stripe Checkout session is invalid.'),
      );
    }

    try {
      const session = await requireSession();
      const result = await paymentService.verifyCheckoutSession(
        parsed.data.sessionId,
        session.user,
      );
      return apiResponse.ok(result);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not verify this payment. Check your reservations before paying again.',
      );
    }
  },

  async recordManualPayment(payload: RecordManualPaymentSchemaInput) {
    const parsed = recordManualPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Review the payment details and try again.'),
      );
    }

    try {
      const session = await requireSession();
      const result = await paymentService.recordManualPayment(parsed.data, session.user);
      return apiResponse.ok(result);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not record this payment. Review the details and try again.',
      );
    }
  },

  async refundPayment(payload: RefundPaymentSchemaInput) {
    const parsed = refundPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Choose a valid payment to refund.'),
      );
    }

    try {
      const session = await requireSession();
      const payment = await paymentService.refundCardPayment(parsed.data, session.user);
      return apiResponse.ok({ payment });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not issue this refund. Check Stripe and try again.',
      );
    }
  },
};
