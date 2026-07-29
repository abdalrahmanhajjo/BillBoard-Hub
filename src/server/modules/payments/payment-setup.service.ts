import { getStripe } from '@/server/modules/payments/stripe';
import { BadRequestError, ConflictError } from '@/shared/http/http-error';
import { authorizationPolicy } from '@/shared/policies';
import type { User } from '@/shared/types/user';

const VISA_BRAND = 'visa';

async function findOrCreateStripeCustomer(actor: User): Promise<string> {
  const stripe = getStripe();
  const candidates = await stripe.customers.list({ email: actor.email, limit: 20 });
  const existing = candidates.data.find((customer) => customer.metadata.advertiserId === actor.id);

  if (existing) return existing.id;

  const customer = await stripe.customers.create({
    email: actor.email,
    name: `${actor.firstName} ${actor.lastName}`.trim() || undefined,
    metadata: { advertiserId: actor.id },
  });

  return customer.id;
}

export const paymentSetupService = {
  /**
   * Creates a SetupIntent so Stripe Elements can validate and save Visa details
   * without charging the advertiser before the reservation is approved.
   */
  async createCardSetup(actor: User) {
    authorizationPolicy.payment.assertCanCreate(actor);

    const stripe = getStripe();
    const customerId = await findOrCreateStripeCustomer(actor);
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card'],
      metadata: { advertiserId: actor.id },
    });

    if (!setupIntent.client_secret) {
      throw new Error('Stripe did not return a secure card setup token.');
    }

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  },

  /**
   * Treats the browser-provided SetupIntent id as untrusted. Stripe is the
   * authority for ownership, completion state, card network, and references.
   */
  async verifyVisaSetup(setupIntentId: string, actor: User) {
    authorizationPolicy.payment.assertCanCreate(actor);

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.metadata?.advertiserId !== actor.id) {
      throw new BadRequestError('This Stripe card verification belongs to another account.');
    }
    if (setupIntent.status !== 'succeeded') {
      throw new ConflictError('Complete the Visa verification before submitting the reservation.');
    }
    if (
      typeof setupIntent.customer !== 'string' ||
      typeof setupIntent.payment_method !== 'string'
    ) {
      throw new BadRequestError('Stripe did not return complete Visa verification details.');
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(setupIntent.payment_method);
    if (paymentMethod.type !== 'card' || paymentMethod.card?.brand !== VISA_BRAND) {
      await stripe.paymentMethods.detach(paymentMethod.id);
      throw new BadRequestError('Only Visa cards are accepted for online payment.');
    }

    await Promise.all([
      stripe.paymentMethods.update(paymentMethod.id, { allow_redisplay: 'always' }),
      stripe.customers.update(setupIntent.customer, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      }),
    ]);

    return {
      stripeCustomerId: setupIntent.customer,
      stripeSetupIntentId: setupIntent.id,
      stripePaymentMethodId: paymentMethod.id,
    };
  },
};
