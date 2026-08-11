import { NextRequest, NextResponse } from "next/server";
import { getStripe, isPlanId } from "@/lib/stripe";
import { grantCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
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
