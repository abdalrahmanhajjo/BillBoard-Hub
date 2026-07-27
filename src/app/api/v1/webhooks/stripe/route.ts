import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { paymentService } from '@/server/modules/payments/payment.service';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';

function jsonResponse(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const rateKey = `stripe-webhook:${requestClientKey(request)}`;
  const limit = checkRateLimit(rateKey, 120, 60_000);
  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error: 'Too many webhook requests.',
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      429,
    );
  }

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
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    await paymentService.handleStripeEvent(event);

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : 'Webhook failed.' },
      400,
    );
  }
}
