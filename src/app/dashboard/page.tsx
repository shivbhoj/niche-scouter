import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { AddCreditsButton } from "@/components/add-credits-button";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const unlocks = await db.unlock.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { niche: { include: { market: true } } },
  });

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 110px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, paddingBottom: 28, borderBottom: "1px solid var(--ink)" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>Account</div>
          <h1 className="serif" style={{ fontWeight: 400, fontSize: 48, lineHeight: 1.05, margin: "16px 0 0", letterSpacing: "-0.01em" }}>{user.email}</h1>
        </div>
        <AddCreditsButton />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ background: "var(--bg)", padding: "26px 0" }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Report credits left</div>
          <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 10 }}>{user.credits}</div>
        </div>
        <div style={{ background: "var(--bg)", padding: "26px 0 26px 26px" }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Reports opened</div>
          <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 10 }}>{unlocks.length}</div>
        </div>
        <div style={{ background: "var(--bg)", padding: "26px 0 26px 26px" }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Billing</div>
          <div className="serif" style={{ fontSize: 30, lineHeight: 1.1, marginTop: 14 }}>Pay per report</div>
        </div>
      </div>

      <h2 className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", margin: "44px 0 18px" }}>Unlocked reports</h2>

      {unlocks.length > 0 ? (
        <div style={{ display: "grid", gap: 1, background: "var(--hairline)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
          {unlocks.map((u) => (
            <Link
              key={u.id}
              href={`/report/${u.niche.marketId}/${u.niche.rank}`}
              className="row-hover"
              style={{ background: "var(--bg)", display: "grid", gridTemplateColumns: "1fr 200px 130px 90px", gap: 20, alignItems: "center", padding: "22px 0", cursor: "pointer" }}
            >
              <span className="serif" style={{ fontSize: 24 }}>{u.niche.name}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{u.niche.market.query}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{formatDate(u.createdAt)}</span>
              <span className="mono" style={{ fontSize: 11, textAlign: "right" }}>Open →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ padding: 56, border: "1px solid var(--hairline)", borderRadius: 4, textAlign: "center", background: "#fff" }}>
          <p style={{ fontSize: 15, color: "var(--muted)", margin: "0 0 20px" }}>Nothing unlocked yet. Your two free reports are waiting.</p>
          <Link href="/" className="btn-hover" style={{ display: "inline-block", padding: "12px 22px", background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 999, fontSize: 13 }}>
            Scout a market
          </Link>
        </div>
      )}
    </main>
  );
}
