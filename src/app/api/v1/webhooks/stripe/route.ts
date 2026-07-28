import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getStripe } from '@/server/modules/payments/stripe';
import { paymentService } from '@/server/modules/payments/payment.service';

function jsonResponse(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return jsonResponse({ ok: false, error: 'Webhook secret is not configured.' }, 500);
  }

  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return jsonResponse({ ok: false, error: 'Missing Stripe signature.' }, 400);
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret, 300);

    await paymentService.handleStripeEvent(event);

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          error instanceof Stripe.errors.StripeSignatureVerificationError
            ? 'The Stripe signature is invalid.'
            : 'Stripe could not process this event and should retry it.',
      },
      400,
    );
  }
}
