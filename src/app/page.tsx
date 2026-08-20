"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppUi } from "@/lib/app-ui";
import { EXAMPLE_MARKETS } from "@/lib/ai/seed-data";
import { PLANS } from "@/lib/stripe";

// Every figure here is measured against the real research pipeline —
// see `npm run validate:ai`. Don't add a stat the product can't back.
const STATS = [
  { value: "10", label: "Live web searches per scout — read fresh at the moment you ask, not recalled" },
  { value: "4", label: "Niches scored per market, ranked by how underserved each one is" },
  { value: "~4min", label: "A full research run, from a broad topic to evidence-linked niches" },
  { value: "$0", label: "Your first report — no card, no subscription, nothing renews" },
];

const STEPS = [
  { num: "01", title: "You give a broad topic", body: `An industry, a hobby, a category — "home coffee equipment" is enough. No keyword lists to prepare.` },
  { num: "02", title: "We search live, not from memory", body: "Competitor listings, community threads and demand signals are searched fresh at the moment you ask — not recalled from training data." },
  { num: "03", title: "You get scored niches with receipts", body: "Each one carries demand, competition and revenue potential — plus the keyword, competitor and sourcing evidence behind the score." },
];

export default function LandingPage() {
  const router = useRouter();
  const { openAuth, openPaywall } = useAppUi();
  const [query, setQuery] = useState("");

  function search(q: string) {
    const trimmed = q.trim() || EXAMPLE_MARKETS[0];
    router.push(`/results?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main>
      <section className="lp-hero" style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 32 }}>
          Live market reconnaissance
        </div>
        <h1 className="serif" style={{ fontWeight: 400, fontSize: "clamp(40px, 9vw, 78px)", lineHeight: 1.04, letterSpacing: "-0.02em", margin: "0 0 26px" }}>
          Proof before you build.
        </h1>
        <p style={{ maxWidth: 560, margin: "0 auto 44px", fontSize: 17, lineHeight: 1.6, color: "var(--ink-soft)" }}>
          Enter an industry. Get underserved segments, demand signals and competitor blind spots — every claim
          linked to a real source.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          style={{ maxWidth: 640, margin: "0 auto" }}
        >
          <div
            className="lp-searchbar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#fff",
              border: "1px solid var(--ink)",
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. home coffee equipment"
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "var(--ink)", padding: "12px 0" }}
            />
            <button
              type="submit"
              className="btn-hover"
              style={{ padding: "13px 26px", background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 999, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Run my first report free
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 18 }}>
            {EXAMPLE_MARKETS.map((label) => (
              <span
                key={label}
                onClick={() => {
                  setQuery(label);
                  search(label);
                }}
                className="mono chip-hover"
                style={{ padding: "7px 14px", border: "1px solid var(--hairline)", borderRadius: 999, fontSize: 11, color: "var(--muted)", cursor: "pointer", background: "#fff" }}
              >
                {label}
              </span>
            ))}
          </div>
        </form>
      </section>

      <section style={{ borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", background: "var(--bg-alt)" }}>
        <div className="lp-stats" style={{ maxWidth: 1180, margin: "0 auto" }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="serif" style={{ fontSize: 38, lineHeight: 1 }}>{s.value}</div>
              <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-method-sec" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="lp-method">
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
              Method
            </div>
            <h2 className="serif" style={{ fontWeight: 400, fontSize: 40, lineHeight: 1.1, margin: "18px 0 0", letterSpacing: "-0.01em" }}>
              Three passes, one report
            </h2>
          </div>
          <div style={{ display: "grid", gap: 1, background: "var(--hairline)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
            {STEPS.map((st) => (
              <div key={st.num} className="lp-step" style={{ background: "var(--bg)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", paddingTop: 4 }}>{st.num}</div>
                <div className="serif" style={{ fontSize: 24, lineHeight: 1.2 }}>{st.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)" }}>{st.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ borderTop: "1px solid var(--hairline)", background: "#fff" }}>
        <div className="lp-pricing" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
              Pricing
            </div>
            <h2 className="serif" style={{ fontWeight: 400, fontSize: 44, lineHeight: 1.1, margin: "16px 0 12px", letterSpacing: "-0.01em" }}>
              Buy reports, not a subscription.
            </h2>
            <p style={{ fontSize: 15, color: "var(--muted)", margin: "0 0 10px" }}>
              One wasted niche costs around $1,500 and six months. One report costs less than lunch.
            </p>
            <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>
              Searching and scoring are always free, and credits never expire — come back whenever the next idea does.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 16, alignItems: "stretch" }}>
            <PlanCard
              name="Free" tag="start here" price="$0" period="first report" reports="1 full report included"
              features={["Search and score any market", "1 full report, kept forever", "Evidence and source links", "No card required"]}
              cta="Run your first report free" btnBg="transparent" btnFg="var(--ink)"
              onClick={() => openAuth()}
            />
            <PlanCard
              name="1 report" tag="one-off" price={`$${PLANS.single.amountCents / 100}`} period="one report" reports="$9.00 each"
              features={["One full report, kept forever", "Every section and source link", "No commitment"]}
              cta="Buy 1 report" btnBg="transparent" btnFg="var(--ink)"
              onClick={() => openPaywall()}
            />
            <PlanCard
              name="5 reports" tag="most founders start here" price={`$${PLANS.pack5.amountCents / 100}`} period="5 reports" reports="$5.80 each"
              features={["5 credits, never expire", "Enough to compare markets properly", "Unlock history in your dashboard", "Nothing renews"]}
              cta="Buy 5 reports" btnBg="var(--ink)" btnFg="var(--bg)"
              onClick={() => openPaywall()}
            />
            <PlanCard
              name="15 reports" tag="agencies & power users" price={`$${PLANS.pack15.amountCents / 100}`} period="15 reports" reports="$4.60 each"
              features={["15 credits, never expire", "Lowest price per report", "Built for scouting a whole category", "Nothing renews"]}
              cta="Buy 15 reports" btnBg="transparent" btnFg="var(--ink)"
              onClick={() => openPaywall()}
            />
          </div>
        </div>
      </section>

      <footer className="mono lp-footer" style={{ borderTop: "1px solid var(--hairline)", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Nichescouter.com</span>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Evidence-linked market reports</span>
      </footer>
    </main>
  );
}

function PlanCard({
  name, tag, price, period, reports, features, cta, btnBg, btnFg, onClick,
}: {
  name: string; tag: string; price: string; period: string; reports: string;
  features: string[]; cta: string; btnBg: string; btnFg: string; onClick: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 26, border: "1px solid var(--hairline)", borderRadius: 4, background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>{name}</span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>{tag}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "22px 0 4px" }}>
        <span className="serif" style={{ fontSize: 42, lineHeight: 1 }}>{price}</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{period}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>{reports}</div>
      <div style={{ display: "grid", gap: 10, paddingTop: 22, borderTop: "1px solid var(--hairline)", marginBottom: 28 }}>
        {features.map((f) => (
          <div key={f} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, fontSize: 13, lineHeight: 1.5, color: "var(--ink-soft)" }}>
            <span className="mono" style={{ color: "var(--muted)" }}>/</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClick}
        className="btn-hover"
        style={{ marginTop: "auto", padding: 13, borderRadius: 999, fontSize: 13, cursor: "pointer", border: "1px solid var(--ink)", background: btnBg, color: btnFg }}
      >
        {cta}
      </button>
    </div>
  );
}
