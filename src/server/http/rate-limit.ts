type Hit = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Hit>();

/**
 * Minimal fixed-window in-memory rate limiter. Suitable for single-instance
 * abuse control (e.g. Stripe checkout/webhook routes). Not shared across
 * server instances — swap for a durable store if the app scales horizontally.
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function requestClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'unknown';
}
