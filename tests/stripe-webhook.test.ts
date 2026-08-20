import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import Stripe from "stripe";
import { db, resetDb, makeUser } from "./helpers";

/**
 * The webhook is the money path: if it silently fails, a customer is
 * charged and receives nothing. These tests exercise the real route
 * handler with payloads signed using Stripe's own signature algorithm,
 * so signature verification is genuinely under test — no Stripe account
 * or network access required.
 */

const WEBHOOK_SECRET = "whsec_test_secret_for_signature_verification";

vi.mock("@/lib/db", async () => {
  const { db } = await import("./helpers");
  return { db };
});

let POST: (req: Request) => Promise<Response>;
let stripe: Stripe;

beforeAll(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  // Never used to make a network call here — verification is local HMAC —
  // but the client refuses to construct without it.
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy_key_never_used_for_network";

  const mod = await import("@/app/api/stripe/webhook/route");
  POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
});

beforeEach(resetDb);
afterAll(async () => {
  await db.$disconnect();
});

function checkoutCompleted(opts: {
  sessionId: string;
  userId: string;
  plan?: string;
  credits?: number;
  paymentStatus?: string;
}) {
  return JSON.stringify({
    id: "evt_test_" + opts.sessionId,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: opts.sessionId,
        object: "checkout.session",
        payment_status: opts.paymentStatus ?? "paid",
        metadata: {
          userId: opts.userId,
          plan: opts.plan ?? "pack5",
          credits: String(opts.credits ?? 5),
        },
      },
    },
  });
}

function post(payload: string, signature: string | null) {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature) headers.set("stripe-signature", signature);
  return POST(new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers,
    body: payload,
  }));
}

/** A genuine Stripe signature header for this payload + secret. */
function sign(payload: string) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
}

describe("POST /api/stripe/webhook", () => {
  it("grants the purchased credits on a paid checkout", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({ sessionId: "cs_grant_1", userId: user.id, credits: 5 });

    const res = await post(payload, sign(payload));

    expect(res.status).toBe(200);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(5);
  });

  /**
   * Stripe retries deliveries, and the redirect-back confirm route can
   * process the same payment too. Neither may credit twice.
   */
  it("does not double-grant when the same event is redelivered", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({ sessionId: "cs_replay", userId: user.id, credits: 12 });
    const signature = sign(payload);

    await post(payload, signature);
    await post(payload, signature);
    await post(payload, signature);

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(12);
    expect(await db.creditTxn.count({ where: { stripeSessionId: "cs_replay" } })).toBe(1);
  });

  /**
   * Without signature verification anyone who knows the URL could mint
   * themselves credits by POSTing a forged payload.
   */
  it("rejects a forged payload and grants nothing", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({ sessionId: "cs_forged", userId: user.id, credits: 9999 });

    const res = await post(payload, "t=1,v1=deadbeef");

    expect(res.status).toBe(400);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });

  it("rejects a payload tampered with after signing", async () => {
    const user = await makeUser(0);
    const honest = checkoutCompleted({ sessionId: "cs_tamper", userId: user.id, credits: 1 });
    const signature = sign(honest);
    const tampered = honest.replace('"credits":"1"', '"credits":"500"');

    const res = await post(tampered, signature);

    expect(res.status).toBe(400);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });

  it("rejects an unsigned request as a bad request, not a server error", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({ sessionId: "cs_nosig", userId: user.id });

    const res = await post(payload, null);

    // 400, not 5xx — an unsigned POST is someone probing the endpoint,
    // and must not read as an outage to whatever watches error rates.
    expect(res.status).toBe(400);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });

  it("reports a missing webhook secret as a server misconfiguration", async () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const payload = checkoutCompleted({ sessionId: "cs_nosecret", userId: "irrelevant" });
      const res = await post(payload, "t=1,v1=whatever");
      expect(res.status).toBe(503);
    } finally {
      process.env.STRIPE_WEBHOOK_SECRET = original;
    }
  });

  it("ignores a session that was not actually paid", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({
      sessionId: "cs_unpaid",
      userId: user.id,
      credits: 5,
      paymentStatus: "unpaid",
    });

    const res = await post(payload, sign(payload));

    expect(res.status).toBe(200);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });

  it("ignores an unrecognized plan rather than crediting a guessed amount", async () => {
    const user = await makeUser(0);
    const payload = checkoutCompleted({
      sessionId: "cs_badplan",
      userId: user.id,
      plan: "pack_free_money",
      credits: 9999,
    });

    const res = await post(payload, sign(payload));

    expect(res.status).toBe(200);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });
});
