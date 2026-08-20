"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppUi } from "@/lib/app-ui";

interface NicheTeaser {
  id: string;
  rank: number;
  name: string;
  teaser: string;
  demand: number;
  revenue: string;
  revenueNote: string;
  owned: boolean;
}

const STATUSES = [
  "Reading live search demand across 14 sources…",
  "Scanning marketplace listings for supply gaps…",
  "Weighing community chatter from the last 90 days…",
];

const GENERIC_LOCKED = ["Competition score", "Keyword clusters", "Competitor gaps", "Sourcing notes"];

const POLL_INTERVAL_MS = 900;
/**
 * Must sit beyond the server's own generation ceiling, not just above
 * the average: a measured run took 232s against an earlier 240s cap,
 * which would have shown the user a spurious timeout on a search that
 * was about to succeed.
 */
const POLL_TIMEOUT_MS = 7 * 60 * 1000;

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsView />
    </Suspense>
  );
}

function ResultsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, openAuth, openPaywall } = useAppUi();

  const qParam = searchParams.get("q");
  const marketParam = searchParams.get("market");
  const revealParam = searchParams.get("reveal");
  const paywallParam = searchParams.get("paywall");

  const [query, setQuery] = useState(qParam ?? "");
  const [inputValue, setInputValue] = useState("");
  const [marketId, setMarketId] = useState<string | null>(marketParam);
  const [status, setStatus] = useState<"pending" | "ready" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [niches, setNiches] = useState<NicheTeaser[]>([]);
  const [statusIdx, setStatusIdx] = useState(0);
  const handledReveal = useRef(false);

  // Kick off / locate the market.
  useEffect(() => {
    let cancelled = false;
    handledReveal.current = false;

    async function start() {
      if (marketParam) {
        setMarketId(marketParam);
        return;
      }
      const q = qParam?.trim() || "home coffee equipment";
      setQuery(q);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          // Includes 429 from the new-scout rate limit, whose message
          // explains that previously scouted topics still work.
          setStatus("error");
          setErrorMsg(data?.error ?? "Couldn't start this scout. Try again in a moment.");
          return;
        }
        setMarketId(data.marketId);
      } catch {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg("Couldn't reach the server. Check your connection and try again.");
      }
    }
    void start();
    return () => {
      cancelled = true;
    };
  }, [qParam, marketParam]);

  // Poll for status/niches. Bounded: a generation that never resolves
  // must not leave the tab polling this endpoint indefinitely.
  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    async function poll() {
      try {
        const res = await fetch(`/api/search/status?marketId=${marketId}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;
        setQuery(data.query);
        setStatus(data.status);
        setErrorMsg(data.errorMsg ?? null);
        setNiches(data.niches);
        if (data.status !== "pending") return;
        if (Date.now() > deadline) {
          setStatus("error");
          setErrorMsg("This scout is taking longer than expected. Search the topic again to retry.");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        // Transient network/server blip — keep trying until the deadline.
        if (Date.now() > deadline) {
          setStatus("error");
          setErrorMsg("Lost connection while scouting. Search the topic again to retry.");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [marketId]);

  // Cosmetic rotating status line while pending.
  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUSES.length - 1));
    }, 1400);
    return () => clearInterval(t);
  }, [status]);

  // Handle deep-link reveal/paywall intents once niches are loaded.
  useEffect(() => {
    if (status !== "ready" || handledReveal.current || !revealParam || !marketId) return;
    const rank = Number(revealParam);
    const niche = niches.find((n) => n.rank === rank);
    if (!niche) return;
    handledReveal.current = true;
    const pending = { marketId, rank, nicheName: niche.name };
    if (!me.signedIn) {
      openAuth(pending);
    } else if (paywallParam === "1") {
      openPaywall(pending);
    } else {
      router.push(`/report/${marketId}/${rank}`);
    }
  }, [status, niches, revealParam, paywallParam, marketId, me.signedIn, openAuth, openPaywall, router]);

  function reveal(n: NicheTeaser) {
    if (!marketId) return;
    if (n.owned) {
      router.push(`/report/${marketId}/${n.rank}`);
      return;
    }
    const pending = { marketId, rank: n.rank, nicheName: n.name };
    if (!me.signedIn) {
      openAuth(pending);
      return;
    }
    router.push(`/report/${marketId}/${n.rank}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/results?q=${encodeURIComponent(inputValue.trim() || "home coffee equipment")}`);
  }

  const statusLine =
    status === "error"
      ? errorMsg || "Something went wrong scouting this market."
      : status === "ready"
      ? `Scored ${niches.length} underserved ${niches.length === 1 ? "niche" : "niches"} · evidence attached`
      : STATUSES[statusIdx];

  const statusDot = status === "pending" ? "var(--live-dot)" : status === "error" ? "#b3261e" : "var(--ok-fg)";

  return (
    <main className="res-main" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <form
        onSubmit={submitSearch}
        className="res-searchbar"
        style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid var(--hairline)", maxWidth: 620 }}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search an industry"
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 15, padding: "10px 0" }}
        />
        <button type="submit" className="btn-hover" style={{ padding: "11px 22px", background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
          Re-scout
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, margin: "40px 0 10px" }}>
        <h1 className="serif res-title" style={{ fontWeight: 400, lineHeight: 1.1, margin: 0, letterSpacing: "-0.01em" }}>
          {query ? `Underserved corners of ${query}` : "Underserved corners"}
        </h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
          {status === "ready" ? `${niches.length} niches scored` : ""}
        </span>
      </div>
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 22, borderBottom: "1px solid var(--hairline)", fontSize: 11, color: "var(--muted)" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusDot }} />
        {statusLine}
      </div>

      <div className="res-grid" style={{ marginTop: 28 }}>
        {niches.map((n) => (
          <NicheCard key={n.id} n={n} signedIn={me.signedIn} credits={me.credits} onReveal={() => reveal(n)} />
        ))}
      </div>
    </main>
  );
}

function NicheCard({
  n, signedIn, credits, onReveal,
}: {
  n: NicheTeaser; signedIn: boolean; credits: number; onReveal: () => void;
}) {
  const revealLabel = n.owned
    ? "Open full report →"
    : signedIn
    ? credits > 0
      ? "Reveal full report · uses 1 credit"
      : "Reveal full report · $5"
    : "Sign up to reveal full report";

  return (
    <div className="card-hover res-card" style={{ display: "flex", flexDirection: "column", border: "1px solid var(--hairline)", borderRadius: 4, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
          Niche {String(n.rank).padStart(2, "0")}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 9px", borderRadius: 999,
            border: "1px solid var(--hairline)",
            color: n.owned ? "var(--ok-fg)" : "var(--muted)",
            background: n.owned ? "var(--ok-bg)" : "var(--bg)",
          }}
        >
          {n.owned ? "Unlocked" : "Preview"}
        </span>
      </div>
      <h3 className="serif" style={{ fontWeight: 400, fontSize: 29, lineHeight: 1.15, margin: "0 0 10px" }}>{n.name}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 22px" }}>{n.teaser}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "20px 0", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9 }}>Demand</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="serif" style={{ fontSize: 30, lineHeight: 1 }}>{n.demand}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>/100</span>
          </div>
          <div style={{ height: 3, background: "var(--demand-track)", marginTop: 10 }}>
            <div style={{ height: 3, background: "var(--ink)", width: `${n.demand}%` }} />
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9 }}>Revenue potential</div>
          <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>{n.revenue}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10 }}>{n.revenueNote}</div>
        </div>
      </div>

      {!n.owned && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GENERIC_LOCKED.map((l) => (
              <span key={l} className="mono" style={{ fontSize: 10, color: "var(--muted-2)", padding: "5px 9px", background: "var(--bg-alt)", borderRadius: 3 }}>
                {l} · locked
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onReveal}
        className="btn-hover"
        style={{ marginTop: 20, padding: 13, background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 999, fontSize: 13, cursor: "pointer" }}
      >
        {revealLabel}
      </button>
    </div>
  );
}
