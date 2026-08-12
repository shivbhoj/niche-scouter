import { describe, it, expect } from "vitest";
import { RateLimiter, clientKey } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  it("allows up to the limit then rejects", () => {
    const rl = new RateLimiter(3, 60_000);
    expect(rl.check("a").ok).toBe(true);
    expect(rl.check("a").ok).toBe(true);
    expect(rl.check("a").ok).toBe(true);
    expect(rl.check("a").ok).toBe(false);
  });

  it("counts each key independently", () => {
    const rl = new RateLimiter(1, 60_000);
    expect(rl.check("a").ok).toBe(true);
    expect(rl.check("a").ok).toBe(false);
    expect(rl.check("b").ok).toBe(true);
  });

  it("reports remaining budget", () => {
    const rl = new RateLimiter(3, 60_000);
    expect(rl.check("a").remaining).toBe(2);
    expect(rl.check("a").remaining).toBe(1);
    expect(rl.check("a").remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const rl = new RateLimiter(2, 1_000);
    const t0 = 1_000_000;
    expect(rl.check("a", t0).ok).toBe(true);
    expect(rl.check("a", t0).ok).toBe(true);
    expect(rl.check("a", t0).ok).toBe(false);
    expect(rl.check("a", t0 + 1_001).ok).toBe(true);
  });

  it("surfaces a sane Retry-After", () => {
    const rl = new RateLimiter(1, 60_000);
    const t0 = 1_000_000;
    rl.check("a", t0);
    const denied = rl.check("a", t0 + 10_000);
    expect(denied.ok).toBe(false);
    expect(denied.retryAfter).toBeGreaterThan(0);
    expect(denied.retryAfter).toBeLessThanOrEqual(60);
  });

  it("stays bounded — expired windows are swept", () => {
    const rl = new RateLimiter(1, 1_000);
    let t = 1_000_000;
    for (let i = 0; i < 500; i++) {
      rl.check(`key-${i}`, t);
      t += 2_000;
    }
    // @ts-expect-error reaching into private state to assert no leak
    expect(rl.windows.size).toBeLessThan(50);
  });
});

describe("clientKey", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const req = new Request("http://x/", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" },
    });
    expect(clientKey(req)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://x/", { headers: { "x-real-ip": "203.0.113.9" } });
    expect(clientKey(req)).toBe("203.0.113.9");
  });

  it("degrades to a constant rather than throwing", () => {
    expect(clientKey(new Request("http://x/"))).toBe("unknown");
  });
});
