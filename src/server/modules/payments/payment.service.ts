import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import { paymentRepository } from '@/server/modules/payments/payment.repository';
import { paymentEventRepository } from '@/server/modules/payments/payment-event.repository';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/server/http/http-error';
import { BOOKING_PAYMENT_STATUSES, BOOKING_STATUSES } from '@/shared/constants/booking';
import { PAYMENT_STATUSES } from '@/shared/constants/payment';
import { authorizationPolicy } from '@/shared/policies';
import type { User } from '@/shared/types/user';

function centsFromDollars(amount: number): number {
  return Math.round(amount * 100);
}

export const paymentService = {
  async createCheckoutSession(bookingId: string, actor: User) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found.');
    }

    if (String(booking.advertiserId) !== actor.id) {
      throw new UnauthorizedError('You can only pay for your own booking.');
    }

    if (booking.status !== BOOKING_STATUSES.APPROVED) {
      throw new ConflictError('Only approved bookings can be paid.');
    }

    if (booking.paymentStatus === BOOKING_PAYMENT_STATUSES.PAID) {
      throw new ConflictError('This booking is already paid.');
    }

    const existingPayment = await paymentRepository.findByBookingId(bookingId);
    if (existingPayment?.status === PAYMENT_STATUSES.PAID) {
      throw new ConflictError('This booking is already paid.');
    }

    const billboard = await billboardService.getPublicById(String(booking.billboardId));
    const amount = centsFromDollars(booking.pricing.total);

    if (existingPayment?.status === PAYMENT_STATUSES.PENDING) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingPayment.stripeSessionId,
      );
      if (existingSession.url) {
        return { url: existingSession.url };
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: actor.email,
      client_reference_id: bookingId,
      metadata: {
        bookingId,
        advertiserId: actor.id,
        billboardId: String(booking.billboardId),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: billboard.name,
              description: `Booking for ${billboard.location.city}`,
            },
          },
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/payment/cancel?bookingId=${bookingId}`,
      payment_intent_data: {
        metadata: {
          bookingId,
          advertiserId: actor.id,
        },
      },
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a redirect URL.');
    }

    if (existingPayment) {
      await paymentRepository.updateByBookingId(bookingId, {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : '',
        amount: booking.pricing.total,
        currency: booking.invoice.currency,
        status: PAYMENT_STATUSES.PENDING,
        paymentMethod: undefined,
        paidAt: undefined,
      });
    } else {
      await paymentRepository.create({
        bookingId,
        advertiserId: actor.id,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : '',
        amount: booking.pricing.total,
        currency: booking.invoice.currency,
        status: PAYMENT_STATUSES.PENDING,
        paymentMethod: undefined,
        paidAt: undefined,
      });
    }

    await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.PENDING);

    return { url: session.url };
  },

  async getPaymentByBookingId(bookingId: string, actor: User) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found.');
    }

    const canModerate = authorizationPolicy.booking.canModerate(actor.role);
    if (!canModerate && String(booking.advertiserId) !== actor.id) {
      throw new UnauthorizedError('You can only view your own payment.');
    }

    return paymentRepository.findByBookingId(bookingId);
  },

  async handleStripeEvent(event: Stripe.Event) {
    const alreadyProcessed = await paymentEventRepository.findByStripeEventId(event.id);
    if (alreadyProcessed) {
      return { processed: true, duplicate: true };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId ?? session.client_reference_id;

      if (!bookingId) {
        throw new Error('Missing booking metadata on Stripe session.');
      }

      const paymentBySession = await paymentRepository.findByStripeSessionId(session.id);
      const payment = paymentBySession ?? (await paymentRepository.findByBookingId(bookingId));
      if (!payment) {
        throw new NotFoundError('Payment record not found.');
      }

      if (payment.status === PAYMENT_STATUSES.PAID) {
        await paymentEventRepository.create(event.id, event.type);
        return { processed: true, duplicate: true };
      }

      const updatedPayment = await paymentRepository.updateByBookingId(bookingId, {
        status: PAYMENT_STATUSES.PAID,
        paidAt: new Date(),
        paymentMethod: session.payment_method_types?.[0],
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : payment.stripePaymentIntentId,
      });

      await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.PAID);
      await bookingRepository.updateStatus(bookingId, BOOKING_STATUSES.CONFIRMED);
      await paymentEventRepository.create(event.id, event.type);

      return { processed: true, payment: updatedPayment };
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;

      if (!bookingId) {
        throw new Error('Missing booking metadata on payment intent.');
      }

      await paymentRepository.updateByBookingId(bookingId, {
        status: PAYMENT_STATUSES.FAILED,
        stripePaymentIntentId: intent.id,
      });

      await bookingRepository.updatePaymentStatus(bookingId, BOOKING_PAYMENT_STATUSES.FAILED);
      await paymentEventRepository.create(event.id, event.type);
      return { processed: true };
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;

      if (!bookingId) {
        throw new Error('Missing booking metadata on payment intent.');
      }

      await paymentRepository.updateByBookingId(bookingId, {
        stripePaymentIntentId: intent.id,
      });

      await paymentEventRepository.create(event.id, event.type);

      return { processed: true };
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const payment = await paymentRepository.findByStripePaymentIntentId(
        String(charge.payment_intent ?? ''),
      );

      if (!payment) {
        return { processed: false };
      }

      await paymentRepository.updateByBookingId(String(payment.bookingId), {
        status: PAYMENT_STATUSES.REFUNDED,
      });
      await bookingRepository.updatePaymentStatus(
        String(payment.bookingId),
        BOOKING_PAYMENT_STATUSES.PAID,
      );
      await paymentEventRepository.create(event.id, event.type);

      return { processed: true };
    }

    await paymentEventRepository.create(event.id, event.type);
    return { processed: false };
  },
};
