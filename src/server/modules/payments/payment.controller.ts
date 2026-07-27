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
  type CreateCheckoutSessionSchemaInput,
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
      return handleControllerError(error, 'Payment checkout failed.');
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
      return handleControllerError(error, 'Getting payment failed.');
    }
  },
};
