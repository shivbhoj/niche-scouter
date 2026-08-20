"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Adjacency } from "@/lib/types";

/**
 * "3 adjacent industries worth scouting" — the loop that makes report #1
 * cause report #2 without buying another click.
 *
 * Each card is a one-tap re-run: it pre-fills the industry and goes
 * straight into the scout rather than dropping the reader back on the
 * landing page to retype it. `linkedFinding` is shown, not hidden — the
 * product's whole promise is that a claim traces back to something
 * specific, and a suggestion is a claim.
 */
export function AdjacencyBlock({
  items,
  fromIndustry,
}: {
  items: Adjacency[];
  fromIndustry: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (!items?.length) return null;

  function scout(item: Adjacency) {
    setBusy(item.industry);
    // Fire-and-forget: a failed metrics write must never block the
    // navigation the user actually asked for.
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "adjacency_click",
        meta: { from: fromIndustry, to: item.industry },
      }),
    }).catch(() => {});
    router.push(`/results?q=${encodeURIComponent(item.industry)}&from=adjacency`);
  }

  return (
    <section className="rpt-section" style={{ borderTop: "1px solid var(--ink)" }}>
      <div>
        <h2
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}
        >
          Scout next
        </h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", margin: "12px 0 0" }}>
          Three markets where the signals above are likely to repeat.
        </p>
      </div>

      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: 14,
          }}
        >
          {items.map((item) => (
            <button
              key={item.industry}
              onClick={() => scout(item)}
              disabled={busy !== null}
              className="card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                textAlign: "left",
                gap: 10,
                padding: 20,
                border: "1px solid var(--hairline)",
                borderRadius: 4,
                background: "#fff",
                cursor: busy ? "default" : "pointer",
                opacity: busy && busy !== item.industry ? 0.5 : 1,
                font: "inherit",
                color: "inherit",
                minWidth: 0,
                // Every string in this card comes from the model, so no
                // length is guaranteed to fit. Without this a long term
                // spills past the card and scrolls the whole page.
                overflowWrap: "anywhere",
              }}
            >
              <span className="serif" style={{ fontSize: 21, lineHeight: 1.2 }}>{item.industry}</span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)" }}>{item.reason}</span>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  lineHeight: 1.5,
                  color: "var(--muted)",
                  paddingTop: 10,
                  borderTop: "1px solid var(--hairline-soft)",
                }}
              >
                Based on: {item.linkedFinding}
              </span>
              <span
                className="mono"
                style={{ marginTop: "auto", paddingTop: 12, fontSize: 11, color: "var(--ink)" }}
              >
                {busy === item.industry ? "Scouting…" : "Scout this →"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
