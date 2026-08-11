import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getStripe, PLANS, isPlanId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan = String(body?.plan ?? "");
  if (!isPlanId(plan)) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

  const marketId = typeof body?.marketId === "string" ? body.marketId : undefined;
  const rank = typeof body?.rank === "number" || typeof body?.rank === "string" ? String(body.rank) : undefined;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const info = PLANS[plan];

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Set STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 }
    );
  }

  const cancelUrl =
    marketId && rank
      ? `${appUrl}/results?market=${marketId}&reveal=${rank}&paywall=1`
      : `${appUrl}/dashboard`;

  const successUrl = `${appUrl}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: info.amountCents,
          product_data: { name: `Niche Scouter — ${info.label}`, description: info.detail },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      plan,
      credits: String(info.credits),
      ...(marketId ? { marketId } : {}),
      ...(rank ? { rank } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}
