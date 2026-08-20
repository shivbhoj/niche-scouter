import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  _stripe = new Stripe(key);
  return _stripe;
}

/**
 * Deliberate decoy structure: the single credit sits close enough to the
 * 5-pack that buying one report reads as poor value, which is what makes
 * the 5-pack the obvious choice. Credits never expire — that promise is
 * the positioning, so nothing here may quietly introduce an expiry.
 */
export const PLANS = {
  single: { label: "1 report", credits: 1, amountCents: 900, detail: "One full report, kept forever" },
  pack5: { label: "5 reports", credits: 5, amountCents: 2900, detail: "$5.80 each · most founders start here" },
  pack15: { label: "15 reports", credits: 15, amountCents: 6900, detail: "$4.60 each · for agencies and heavy scouting" },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(v: string): v is PlanId {
  return v === "single" || v === "pack5" || v === "pack15";
}
