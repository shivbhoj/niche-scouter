import { NextRequest, NextResponse } from "next/server";
import { getStripe, isPlanId } from "@/lib/stripe";
import { grantCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  // A missing secret is our misconfiguration; a missing signature is a
  // bad request from the caller. Distinct causes deserve distinct codes,
  // so that alerting on 5xx means "we broke something" rather than
  // "someone probed the endpoint".
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set — cannot verify deliveries");
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing stripe-signature header" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `signature verification failed: ${err}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata ?? {};
    if (session.payment_status === "paid" && meta.userId && meta.plan && isPlanId(meta.plan)) {
      await grantCredits(meta.userId, Number(meta.credits ?? 0), `purchase:${meta.plan}`, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
