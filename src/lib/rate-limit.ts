/**
 * Fixed-window rate limiter.
 *
 * NOTE ON SCOPE: this is in-process memory. It correctly protects a
 * single server instance, which is what a small deployment runs. If you
 * scale to multiple instances or a serverless platform that spins up
 * many isolates, each one keeps its own counter and the effective limit
 * multiplies by the instance count — move the same interface to Redis
 * (or Upstash / Vercel KV) at that point. The call sites don't change.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

interface Window {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private windows = new Map<string, Window>();
  private lastSweep = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    this.sweep(now);

    const existing = this.windows.get(key);
    if (!existing || now >= existing.resetAt) {
      this.windows.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true, remaining: this.limit - 1, retryAfter: 0 };
    }

    existing.count += 1;
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    if (existing.count > this.limit) {
      return { ok: false, remaining: 0, retryAfter };
    }
    return { ok: true, remaining: this.limit - existing.count, retryAfter };
  }

  /** Drop expired windows so the map can't grow without bound. */
  private sweep(now: number) {
    if (now - this.lastSweep < this.windowMs) return;
    this.lastSweep = now;
    for (const [key, win] of this.windows) {
      if (now >= win.resetAt) this.windows.delete(key);
    }
  }

  /** Testing helper. */
  reset() {
    this.windows.clear();
    this.lastSweep = 0;
  }
}

/**
 * Best-effort client identity. Trusts x-forwarded-for only because the
 * app is expected to sit behind a proxy that sets it; a direct-to-node
 * deployment should strip and re-set that header at the edge.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// A scout is a billable AI call with live web search, so this is
// deliberately tight for anonymous callers.
export const searchLimiter = new RateLimiter(10, 60 * 60 * 1000);
export const authLimiter = new RateLimiter(10, 15 * 60 * 1000);
export const checkoutLimiter = new RateLimiter(20, 60 * 60 * 1000);
// Telemetry writes are cheap, but the endpoint is open — keep it from
// being usable as a way to flood the table.
export const eventLimiter = new RateLimiter(120, 60 * 60 * 1000);
