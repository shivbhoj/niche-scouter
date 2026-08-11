import Link from "next/link";
import type { NicheReport } from "@/lib/types";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ReportView({ report, query, marketId }: { report: NicheReport; query: string; marketId: string }) {
  const trendMax = Math.max(...report.trend);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "44px 40px 110px" }}>
      <Link href={`/results?market=${marketId}`} className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
        ← Back to results
      </Link>

      <div style={{ marginTop: 32, paddingBottom: 34, borderBottom: "1px solid var(--ink)" }}>
        <div className="mono" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
          <span>Full report</span><span>·</span><span>{formatDate(new Date())}</span><span>·</span><span>{query}</span>
        </div>
        <h1 className="serif" style={{ fontWeight: 400, fontSize: 60, lineHeight: 1.06, letterSpacing: "-0.02em", margin: "20px 0 18px" }}>
          {report.name}
        </h1>
        <p style={{ maxWidth: 660, fontSize: 18, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>{report.thesis}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        {report.metrics.map((m) => (
          <div key={m.label} style={{ background: "var(--bg)", padding: "24px 0" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>{m.label}</div>
            <div className="serif" style={{ fontSize: 34, lineHeight: 1, marginTop: 10 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <Section title="Demand trend">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130, paddingBottom: 12, borderBottom: "1px solid var(--hairline)" }}>
          {report.trend.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ background: "var(--ink)", height: `${Math.round((v / trendMax) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, color: "var(--muted)" }}>
          <span>{report.trendStart}</span><span>{report.trendNote}</span><span>{report.trendEnd}</span>
        </div>
      </Section>

      <Section title="Audience profile">
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 24px" }}>{report.audience}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--hairline)" }}>
          {report.audienceFacts.map((a) => (
            <div key={a.k} style={{ background: "var(--bg)", padding: "18px 18px 18px 0" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>{a.k}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>{a.v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Keyword clusters">
        <div style={{ display: "grid", gap: 14 }}>
          {report.keywords.map((k) => (
            <div key={k.term} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 70px", gap: 16, alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--hairline-soft)" }}>
              <span style={{ fontSize: 15 }}>{k.term}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{k.vol}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{k.kd}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>{k.growth}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Competitor breakdown">
        <div style={{ display: "grid", gap: 18 }}>
          {report.competitors.map((c) => (
            <div key={c.name} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, paddingBottom: 18, borderBottom: "1px solid var(--hairline-soft)" }}>
              <div>
                <div style={{ fontSize: 15 }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>{c.scale}</div>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>{c.gap}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Monetization playbook">
        <div style={{ display: "grid", gap: 1, background: "var(--hairline)" }}>
          {report.playbook.map((p) => (
            <div key={p.num} style={{ background: "var(--bg)", display: "grid", gridTemplateColumns: "34px 190px 1fr 110px", gap: 20, padding: "20px 0", alignItems: "start" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{p.num}</span>
              <span style={{ fontSize: 15, lineHeight: 1.35 }}>{p.title}</span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>{p.body}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink)", textAlign: "right" }}>{p.margin}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Product & content ideas">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {report.ideas.map((i) => (
            <div key={i} style={{ padding: 18, border: "1px solid var(--hairline)", borderRadius: 3, background: "#fff", fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
              {i}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sourcing notes">
        <div style={{ display: "grid", gap: 12 }}>
          {report.sourcing.map((s) => (
            <div key={s} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 12, fontSize: 15, lineHeight: 1.65, color: "var(--ink)" }}>
              <span className="mono" style={{ color: "var(--muted)" }}>/</span><span>{s}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Risk factors">
        <div style={{ display: "grid", gap: 16 }}>
          {report.risks.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 20, paddingBottom: 16, borderBottom: "1px solid var(--hairline-soft)" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>{r.level}</span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>{r.body}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sources" noBorder>
        <div style={{ display: "grid", gap: 10 }}>
          {report.sources.map((s, i) => (
            <div key={i} className="mono" style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 16, paddingBottom: 10, borderBottom: "1px solid var(--hairline-soft)", fontSize: 11, color: "var(--ink-soft)" }}>
              <span>{s.title}</span><span style={{ color: "var(--muted)", textAlign: "right" }}>{s.when}</span>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children, noBorder }: { title: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 48, padding: "44px 0", borderBottom: noBorder ? undefined : "1px solid var(--hairline)" }}>
      <h2 className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
