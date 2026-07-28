import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

/**
 * Returns the server-only Stripe SDK singleton.
 *
 * Configuration is checked when a payment operation runs instead of during
 * module evaluation. This keeps builds and non-payment routes available while
 * still failing securely if Stripe is not configured.
 */
export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Payments are not configured. Add STRIPE_SECRET_KEY and try again.');
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  });

  return stripeClient;
}
