import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  _stripe = new Stripe(key);
  return _stripe;
}

export const PLANS = {
  single: { label: "Single report", credits: 1, amountCents: 500, detail: "Unlock one niche, keep it forever" },
  pack5: { label: "Report pack — 5 reports", credits: 5, amountCents: 1500, detail: "$3.00 each · credits never expire" },
  pack12: { label: "Deep dive pack — 12 reports", credits: 12, amountCents: 3000, detail: "$2.50 each · PDF export, 2 teammates" },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(v: string): v is PlanId {
  return v === "single" || v === "pack5" || v === "pack12";
}
