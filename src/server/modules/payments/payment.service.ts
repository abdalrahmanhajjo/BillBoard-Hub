import Stripe from 'stripe';
import { getStripe } from '@/server/modules/payments/stripe';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import { toBooking } from '@/server/modules/bookings/booking.utils';
import { paymentRepository } from '@/server/modules/payments/payment.repository';
import { paymentEventRepository } from '@/server/modules/payments/payment-event.repository';
import { toPayment } from '@/server/modules/payments/payment.utils';
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/http/http-error';
import {
  PAYMENT_STATUSES as BOOKING_PAYMENT_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_METHODS as BOOKING_PAYMENT_METHODS,
} from '@/shared/constants/booking';
import {
  PAYMENT_METHODS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  STRIPE_CHECKOUT_TTL_SECONDS,
} from '@/shared/constants/payment';
import { appUrl } from '@/shared/config/app-url';
import { authorizationPolicy } from '@/shared/policies';
import type { Currency } from '@/shared/types/currency';
import type { CheckoutVerification, PaymentStatus } from '@/shared/types/payment';
import type { User } from '@/shared/types/user';
import type {
  RecordManualPaymentSchemaOutput,
  RefundPaymentSchemaInput,
} from '@/shared/contracts/payments/payment.schema';

const PAYABLE_PAYMENT_STATUSES: PaymentStatus[] = [
  PAYMENT_STATUSES.UNPAID,
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.FAILED,
];

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

function fromMinorUnits(amount: number): number {
  return amount / 100;
}

function intentIdOf(session: Stripe.Checkout.Session): string | undefined {
  return typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;
}

function bookingIdOf(session: Stripe.Checkout.Session): string | undefined {
  return session.metadata?.bookingId ?? session.client_reference_id ?? undefined;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (error as { code?: number } | null)?.code === 11000;
}

async function recordProcessedEvent(event: Stripe.Event): Promise<boolean> {
  try {
    await paymentEventRepository.create(event.id, event.type);
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return false;
    }
    throw error;
  }
}

async function reconcilePaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ReturnType<typeof toPayment>> {
  const bookingId = bookingIdOf(session);
  if (!bookingId) {
    throw new Error('Stripe Checkout is missing the reservation reference.');
  }

  const payment =
    (await paymentRepository.findByStripeSessionId(session.id)) ??
    (await paymentRepository.findByBookingId(bookingId));
  if (!payment) {
    throw new NotFoundError('We could not match this Stripe payment to a reservation.');
  }

  if (payment.stripeSessionId && payment.stripeSessionId !== session.id) {
    throw new ConflictError('This checkout session is no longer active for the reservation.');
  }

  if (session.payment_status === 'unpaid') {
    return toPayment(payment);
  }

  const expectedMinorAmount = toMinorUnits(payment.amount);
  if (
    session.amount_total === null ||
    session.amount_total !== expectedMinorAmount ||
    session.currency?.toLowerCase() !== payment.currency.toLowerCase()
  ) {
    throw new ConflictError(
      'Stripe returned payment details that do not match the reservation total.',
    );
  }

  const updated = await paymentRepository.updateByBookingIdWhenStatus(
    bookingId,
    PAYABLE_PAYMENT_STATUSES,
    {
      provider: PAYMENT_PROVIDERS.STRIPE,
      stripeSessionId: session.id,
      stripePaymentIntentId: intentIdOf(session) ?? payment.stripePaymentIntentId,
      status: PAYMENT_STATUSES.PAID,
      amountPaid: fromMinorUnits(session.amount_total),
      paymentMethod: PAYMENT_METHODS.CARD,
      paidAt: new Date(),
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : payment.expiresAt,
    },
  );

  if (updated || payment.status === PAYMENT_STATUSES.PAID) {
    await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.PAID);
  }
  return toPayment(updated ?? payment);
}

async function markCheckoutFailed(
  bookingId: string,
  update: { stripeSessionId?: string; stripePaymentIntentId?: string; note?: string },
): Promise<void> {
  const updated = await paymentRepository.updateByBookingIdWhenStatus(
    bookingId,
    [PAYMENT_STATUSES.PENDING, PAYMENT_STATUSES.UNPAID],
    {
      status: PAYMENT_STATUSES.FAILED,
      amountPaid: 0,
      ...update,
    },
  );
  if (updated) {
    await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.UNPAID);
  }
}

function assertPaymentOwner(actor: User, advertiserId: unknown, action: 'pay for' | 'view'): void {
  if (!authorizationPolicy.booking.canModerate(actor.role) && String(advertiserId) !== actor.id) {
    throw new ForbiddenError(`You can only ${action} your own reservations.`);
  }
}

function manualPaymentStatus(status: RecordManualPaymentSchemaOutput['status']): PaymentStatus {
  switch (status) {
    case BOOKING_PAYMENT_STATUSES.PAID:
      return PAYMENT_STATUSES.PAID;
    case BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID:
      return PAYMENT_STATUSES.PARTIALLY_PAID;
    case BOOKING_PAYMENT_STATUSES.REFUNDED:
      return PAYMENT_STATUSES.REFUNDED;
    default:
      return PAYMENT_STATUSES.UNPAID;
  }
}

export const paymentService = {
  /**
   * Creates or reuses a short-lived Stripe-hosted Checkout session.
   * Only approved card reservations can be charged, preventing two pending
   * requests for the same placement from both being paid.
   */
  async createCheckoutSession(bookingId: string, actor: User) {
    authorizationPolicy.payment.assertCanCreate(actor);

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('We could not find this reservation. It may have been removed.');
    }
    assertPaymentOwner(actor, booking.advertiserId, 'pay for');

    if (booking.paymentMethod !== BOOKING_PAYMENT_METHODS.CARD) {
      throw new ConflictError(
        'This reservation uses an offline payment method. Follow the instructions from our team.',
      );
    }
    if (booking.status !== BOOKING_STATUSES.APPROVED) {
      throw new ConflictError(
        'Payment becomes available after the reservation is approved and its dates are confirmed.',
      );
    }
    if (booking.paymentStatus === BOOKING_PAYMENT_STATUSES.PAID) {
      throw new ConflictError('This reservation is already paid.');
    }
    if (
      booking.paymentStatus === BOOKING_PAYMENT_STATUSES.REFUND_PENDING ||
      booking.paymentStatus === BOOKING_PAYMENT_STATUSES.REFUNDED
    ) {
      throw new ConflictError('This reservation cannot be charged while its refund is processing.');
    }

    const stripe = getStripe();
    const existingPayment = await paymentRepository.findByBookingId(bookingId);
    if (existingPayment?.status === PAYMENT_STATUSES.PAID) {
      throw new ConflictError('This reservation is already paid.');
    }

    if (existingPayment?.status === PAYMENT_STATUSES.PENDING && existingPayment.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          existingPayment.stripeSessionId,
        );
        if (existingSession.status === 'open' && existingSession.url) {
          return { url: existingSession.url, sessionId: existingSession.id };
        }
      } catch (error) {
        if (!(error instanceof Stripe.errors.StripeInvalidRequestError)) {
          throw error;
        }
      }
    }

    const billboard = await billboardService.getPublicById(String(booking.billboardId));
    const currency = booking.invoice.currency.toLowerCase() as Currency;
    const checkoutAttempt = (existingPayment?.checkoutAttempt ?? 0) + 1;
    const expiresAt = Math.floor(Date.now() / 1000) + STRIPE_CHECKOUT_TTL_SECONDS;
    const baseUrl = appUrl();

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        ...(booking.stripeCustomerId
          ? { customer: booking.stripeCustomerId }
          : { customer_email: actor.email }),
        client_reference_id: bookingId,
        billing_address_collection: 'auto',
        payment_method_options: {
          card: {
            restrictions: {
              brands_blocked: ['american_express', 'discover_global_network', 'mastercard'],
            },
          },
        },
        expires_at: expiresAt,
        metadata: {
          bookingId,
          bookingReference: `BR-${bookingId.slice(-6).toUpperCase()}`,
          advertiserId: actor.id,
          billboardId: String(booking.billboardId),
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: toMinorUnits(booking.pricing.total),
              product_data: {
                name: billboard.name,
                description: `${booking.campaignName} · ${billboard.location.city} · ${booking.startDate.toISOString().slice(0, 10)} to ${booking.endDate.toISOString().slice(0, 10)}`,
              },
            },
          },
        ],
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel?bookingId=${bookingId}`,
        payment_intent_data: {
          receipt_email: booking.invoice.email,
          metadata: {
            bookingId,
            advertiserId: actor.id,
          },
        },
      },
      {
        idempotencyKey: `booking-${bookingId}-checkout-${checkoutAttempt}`,
      },
    );

    if (!session.url) {
      throw new Error('Stripe did not return a secure checkout link. Please try again.');
    }

    const record = {
      advertiserId: String(booking.advertiserId),
      provider: PAYMENT_PROVIDERS.STRIPE,
      stripeSessionId: session.id,
      stripePaymentIntentId: intentIdOf(session),
      stripeRefundId: undefined,
      amount: booking.pricing.total,
      amountPaid: 0,
      currency,
      status: PAYMENT_STATUSES.PENDING,
      paymentMethod: PAYMENT_METHODS.CARD,
      checkoutAttempt,
      refundAttempt: existingPayment?.refundAttempt ?? 0,
      note: undefined,
      recordedBy: undefined,
      expiresAt: new Date(expiresAt * 1000),
      paidAt: undefined,
      refundedAt: undefined,
    } as const;

    if (existingPayment) {
      await paymentRepository.updateByBookingId(bookingId, record);
    } else {
      await paymentRepository.create({ bookingId, ...record });
    }

    await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.PENDING);

    return { url: session.url, sessionId: session.id };
  },

  async getPaymentByBookingId(bookingId: string, actor: User) {
    authorizationPolicy.payment.assertCanRead(actor);

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('We could not find this reservation. It may have been removed.');
    }
    assertPaymentOwner(actor, booking.advertiserId, 'view');

    const payment = await paymentRepository.findByBookingId(bookingId);
    return payment ? toPayment(payment) : null;
  },

  /**
   * Verifies the return from Stripe server-side and performs the same
   * idempotent reconciliation used by the webhook. The success screen never
   * trusts the query string alone.
   */
  async verifyCheckoutSession(sessionId: string, actor: User): Promise<CheckoutVerification> {
    authorizationPolicy.payment.assertCanRead(actor);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = bookingIdOf(session);
    if (!bookingId) {
      throw new NotFoundError('We could not match this checkout to a reservation.');
    }

    const bookingDocument = await bookingRepository.findById(bookingId);
    if (!bookingDocument) {
      throw new NotFoundError('We could not find the reservation for this payment.');
    }
    assertPaymentOwner(actor, bookingDocument.advertiserId, 'view');

    const storedPayment = await paymentRepository.findByBookingId(bookingId);
    if (!storedPayment || storedPayment.stripeSessionId !== session.id) {
      throw new ConflictError('This checkout session does not belong to the reservation.');
    }

    if (session.status === 'expired' && storedPayment.status === PAYMENT_STATUSES.PENDING) {
      await markCheckoutFailed(bookingId, {
        stripeSessionId: session.id,
        note: 'Stripe Checkout session expired before payment.',
      });
    }
    const refreshedPayment = (await paymentRepository.findByBookingId(bookingId)) ?? storedPayment;
    const payment =
      session.payment_status === 'unpaid'
        ? toPayment(refreshedPayment)
        : await reconcilePaidCheckoutSession(session);
    const refreshedBooking = (await bookingRepository.findById(bookingId)) ?? bookingDocument;
    const booking = toBooking(refreshedBooking);

    return {
      payment,
      booking: {
        id: booking.id,
        reference: booking.reference,
        campaignName: booking.campaignName,
        paymentStatus: booking.paymentStatus,
      },
    };
  },

  async recordManualPayment(input: RecordManualPaymentSchemaOutput, actor: User) {
    authorizationPolicy.payment.assertCanReconcile(actor);

    const bookingDocument = await bookingRepository.findById(input.bookingId);
    if (!bookingDocument) {
      throw new NotFoundError('We could not find this reservation. It may have been removed.');
    }
    if (bookingDocument.paymentMethod === BOOKING_PAYMENT_METHODS.CARD) {
      throw new ConflictError('Card payment status is updated automatically by Stripe.');
    }
    if (
      (input.status === BOOKING_PAYMENT_STATUSES.PAID ||
        input.status === BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID) &&
      bookingDocument.status !== BOOKING_STATUSES.APPROVED
    ) {
      throw new ConflictError(
        'Approve the reservation and confirm its dates before recording money received.',
      );
    }

    const existingPayment = await paymentRepository.findByBookingId(input.bookingId);
    if (
      input.status === BOOKING_PAYMENT_STATUSES.REFUNDED &&
      !existingPayment?.amountPaid &&
      bookingDocument.paymentStatus !== BOOKING_PAYMENT_STATUSES.PAID &&
      bookingDocument.paymentStatus !== BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID
    ) {
      throw new ConflictError('Record a received payment before marking it as refunded.');
    }

    const total = bookingDocument.pricing.total;
    const amountPaid =
      input.status === BOOKING_PAYMENT_STATUSES.PAID
        ? total
        : input.status === BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID
          ? (input.amountPaid ?? 0)
          : 0;
    if (amountPaid > total) {
      throw new ConflictError('The received amount cannot be greater than the reservation total.');
    }
    if (input.status === BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID && amountPaid >= total) {
      throw new ConflictError('Use Paid when the full reservation total has been received.');
    }

    const status = manualPaymentStatus(input.status);
    const paymentDocument = await paymentRepository.upsertByBookingId(input.bookingId, {
      advertiserId: String(bookingDocument.advertiserId),
      provider: PAYMENT_PROVIDERS.MANUAL,
      stripeSessionId: undefined,
      stripePaymentIntentId: undefined,
      stripeRefundId: undefined,
      amount: total,
      amountPaid,
      currency: bookingDocument.invoice.currency.toLowerCase() as Currency,
      status,
      paymentMethod: bookingDocument.paymentMethod,
      checkoutAttempt: 0,
      refundAttempt: 0,
      note: input.note,
      recordedBy: actor.id,
      expiresAt: undefined,
      paidAt:
        input.status === BOOKING_PAYMENT_STATUSES.PAID ||
        input.status === BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID
          ? new Date()
          : undefined,
      refundedAt: input.status === BOOKING_PAYMENT_STATUSES.REFUNDED ? new Date() : undefined,
    });

    await bookingRepository.updatePaymentStatus(input.bookingId, input.status);
    if (input.status === BOOKING_PAYMENT_STATUSES.REFUNDED) {
      await bookingRepository.updateStatus(input.bookingId, BOOKING_STATUSES.CANCELLED);
    }

    const refreshedBooking = await bookingRepository.findById(input.bookingId);
    return {
      payment: toPayment(paymentDocument),
      booking: refreshedBooking ? toBooking(refreshedBooking) : toBooking(bookingDocument),
    };
  },

  async refundCardPayment(input: RefundPaymentSchemaInput, actor: User) {
    authorizationPolicy.payment.assertCanRefund(actor);

    const bookingDocument = await bookingRepository.findById(input.bookingId);
    if (!bookingDocument) {
      throw new NotFoundError('We could not find this reservation. It may have been removed.');
    }
    const paymentDocument = await paymentRepository.findByBookingId(input.bookingId);
    if (
      !paymentDocument ||
      paymentDocument.status !== PAYMENT_STATUSES.PAID ||
      !paymentDocument.stripePaymentIntentId
    ) {
      throw new ConflictError('Only a completed Stripe card payment can be refunded here.');
    }

    const stripe = getStripe();
    const refundAttempt = (paymentDocument.refundAttempt ?? 0) + 1;
    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentDocument.stripePaymentIntentId,
        reason: input.reason,
        metadata: {
          bookingId: input.bookingId,
          paymentId: String(paymentDocument._id),
        },
      },
      { idempotencyKey: `booking-${input.bookingId}-full-refund-${refundAttempt}` },
    );

    const refundSucceeded = refund.status === 'succeeded';
    const payment = await paymentRepository.updateByBookingId(input.bookingId, {
      stripeRefundId: refund.id,
      refundAttempt,
      status: refundSucceeded ? PAYMENT_STATUSES.REFUNDED : PAYMENT_STATUSES.REFUND_PENDING,
      amountPaid: refundSucceeded ? 0 : paymentDocument.amountPaid,
      refundedAt: refundSucceeded ? new Date() : undefined,
    });
    await bookingRepository.updatePaymentStatus(
      input.bookingId,
      refundSucceeded ? BOOKING_PAYMENT_STATUSES.REFUNDED : BOOKING_PAYMENT_STATUSES.REFUND_PENDING,
    );
    if (refundSucceeded) {
      await bookingRepository.updateStatus(input.bookingId, BOOKING_STATUSES.CANCELLED);
    }

    return payment ? toPayment(payment) : toPayment(paymentDocument);
  },

  async handleStripeEvent(event: Stripe.Event) {
    const alreadyProcessed = await paymentEventRepository.findByStripeEventId(event.id);
    if (alreadyProcessed) {
      return { processed: true, duplicate: true };
    }

    let result: Record<string, unknown> = { processed: false };

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await reconcilePaidCheckoutSession(session);
      result = { processed: true, payment };
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = bookingIdOf(session);
      if (bookingId) {
        await markCheckoutFailed(bookingId, {
          stripeSessionId: session.id,
          stripePaymentIntentId: intentIdOf(session),
          note:
            event.type === 'checkout.session.expired'
              ? 'Stripe Checkout session expired before payment.'
              : 'Stripe reported that the delayed payment failed.',
        });
        result = { processed: true };
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        await markCheckoutFailed(bookingId, {
          stripePaymentIntentId: intent.id,
          note: intent.last_payment_error?.message ?? 'The card payment failed.',
        });
        result = { processed: true };
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        await paymentRepository.updateByBookingId(bookingId, {
          stripePaymentIntentId: intent.id,
        });
        result = { processed: true };
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const payment = await paymentRepository.findByStripePaymentIntentId(
        String(charge.payment_intent ?? ''),
      );
      if (payment) {
        const fullyRefunded = charge.refunded;
        const remainingAmount = Math.max(
          0,
          payment.amount - fromMinorUnits(charge.amount_refunded),
        );
        await paymentRepository.updateByBookingId(String(payment.bookingId), {
          status: fullyRefunded ? PAYMENT_STATUSES.REFUNDED : PAYMENT_STATUSES.PARTIALLY_PAID,
          amountPaid: remainingAmount,
          refundedAt: fullyRefunded ? new Date() : undefined,
        });
        await bookingRepository.updatePaymentStatus(
          String(payment.bookingId),
          fullyRefunded
            ? BOOKING_PAYMENT_STATUSES.REFUNDED
            : BOOKING_PAYMENT_STATUSES.PARTIALLY_PAID,
        );
        if (fullyRefunded) {
          await bookingRepository.updateStatus(
            String(payment.bookingId),
            BOOKING_STATUSES.CANCELLED,
          );
        }
        result = { processed: true };
      }
    } else if (event.type === 'refund.updated') {
      const refund = event.data.object as Stripe.Refund;
      const bookingId = refund.metadata?.bookingId;
      if (bookingId) {
        const succeeded = refund.status === 'succeeded';
        const failed = refund.status === 'failed' || refund.status === 'canceled';
        await paymentRepository.updateByBookingId(bookingId, {
          stripeRefundId: refund.id,
          status: succeeded
            ? PAYMENT_STATUSES.REFUNDED
            : failed
              ? PAYMENT_STATUSES.PAID
              : PAYMENT_STATUSES.REFUND_PENDING,
          amountPaid: succeeded ? 0 : undefined,
          refundedAt: succeeded ? new Date() : undefined,
          note: failed
            ? (refund.failure_reason ?? 'Stripe could not complete the refund.')
            : undefined,
        });
        await bookingRepository.updatePaymentStatus(
          bookingId,
          succeeded
            ? BOOKING_PAYMENT_STATUSES.REFUNDED
            : failed
              ? BOOKING_PAYMENT_STATUSES.PAID
              : BOOKING_PAYMENT_STATUSES.REFUND_PENDING,
        );
        if (succeeded) {
          await bookingRepository.updateStatus(bookingId, BOOKING_STATUSES.CANCELLED);
        }
        result = { processed: true };
      }
    }

    const recorded = await recordProcessedEvent(event);
    return recorded ? result : { processed: true, duplicate: true };
  },
};
