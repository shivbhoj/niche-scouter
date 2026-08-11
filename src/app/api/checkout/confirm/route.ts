import { NextRequest, NextResponse } from "next/server";
import { getStripe, isPlanId } from "@/lib/stripe";
import { grantCredits, unlockNiche } from "@/lib/credits";
import { db } from "@/lib/db";

// Best-effort synchronous confirmation for the redirect-back UX. The
// Stripe webhook is the source of truth (works even if the user closes
// the tab before this route runs); both paths grant credits idempotently
// keyed on the Stripe checkout session id.
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${appUrl}/dashboard`);

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const meta = session.metadata ?? {};
  const userId = meta.userId;
  const plan = meta.plan;

  if (session.payment_status === "paid" && userId && plan && isPlanId(plan)) {
    const credits = Number(meta.credits ?? 0);
    await grantCredits(userId, credits, `purchase:${plan}`, sessionId);

    if (meta.marketId && meta.rank) {
      const niche = await db.niche.findUnique({
        where: { marketId_rank: { marketId: meta.marketId, rank: Number(meta.rank) } },
      });
      if (niche) {
        await unlockNiche(userId, niche.id);
        return NextResponse.redirect(`${appUrl}/report/${meta.marketId}/${meta.rank}`);
      }
    }
  }

  return NextResponse.redirect(`${appUrl}/dashboard`);
}
