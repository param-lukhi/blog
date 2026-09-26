// In-memory sliding window rate limiter for Next.js App Router routes

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const tracker = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetAt) {
        tracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = tracker.get(key);

  if (!record || now > record.resetAt) {
    tracker.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }

  if (record.count >= maxRequests) {
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
  return { allowed: true, remaining: maxRequests - record.count, resetInSeconds };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
