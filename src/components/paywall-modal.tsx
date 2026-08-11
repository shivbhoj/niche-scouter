"use client";

import { useState } from "react";
import { useAppUi } from "@/lib/app-ui";
import { PLANS, type PlanId } from "@/lib/stripe";

export function PaywallModal() {
  const { showPaywall, pendingReveal, me, close } = useAppUi();
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!showPaywall) return null;

  const noCreditsLeft = me.credits <= 0;

  async function buy(plan: PlanId) {
    setError(null);
    setBusyPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          marketId: pendingReveal?.marketId,
          rank: pendingReveal?.rank,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout is unavailable right now.");
        setBusyPlan(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Something went wrong starting checkout.");
      setBusyPlan(null);
    }
  }

  const eyebrow = pendingReveal && noCreditsLeft ? "Free reports used" : "Add report credits";
  const title = pendingReveal && noCreditsLeft ? "Keep going for the price of a coffee." : "Top up whenever you need more.";
  const niche =
    pendingReveal && noCreditsLeft && pendingReveal.nicheName
      ? `You're opening ${pendingReveal.nicheName}. Both free reports are already used.`
      : `${me.credits} report ${me.credits === 1 ? "credit" : "credits"} left on your account — add more below.`;

  const options: { plan: PlanId; border: string }[] = [
    { plan: "single", border: "var(--hairline)" },
    { plan: "pack5", border: "var(--ink)" },
    { plan: "pack12", border: "var(--hairline)" },
  ];

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(19,23,31,0.34)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--bg)",
          border: "1px solid var(--ink)",
          borderRadius: 6,
          padding: 38,
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
          {eyebrow}
        </div>
        <h2 className="serif" style={{ fontWeight: 400, fontSize: 34, lineHeight: 1.1, margin: "14px 0 10px" }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 26px" }}>{niche}</p>

        <div style={{ display: "grid", gap: 10 }}>
          {options.map(({ plan, border }) => {
            const info = PLANS[plan];
            return (
              <div
                key={plan}
                onClick={() => !busyPlan && buy(plan)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 16,
                  alignItems: "center",
                  padding: 20,
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  background: "#fff",
                  cursor: busyPlan ? "default" : "pointer",
                  opacity: busyPlan && busyPlan !== plan ? 0.5 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: 15 }}>{info.label}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>{info.detail}</div>
                </div>
                <div className="serif" style={{ fontSize: 26 }}>
                  {busyPlan === plan ? "…" : `$${(info.amountCents / 100).toFixed(0)}`}
                </div>
              </div>
            );
          })}
        </div>
        {error && <p style={{ fontSize: 13, color: "#b3261e", marginTop: 16 }}>{error}</p>}
        <p className="mono" style={{ fontSize: 10, color: "var(--muted)", margin: "20px 0 0" }}>
          One-time payment. Credits never expire and reports you own stay yours.
        </p>
      </div>
    </div>
  );
}
