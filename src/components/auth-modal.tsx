"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAppUi } from "@/lib/app-ui";

export function AuthModal() {
  const { showAuth, pendingReveal, close, refreshMe } = useAppUi();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!showAuth) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (result?.error) {
      setError("Couldn't sign you in — check your email and password (6+ characters).");
      return;
    }
    await refreshMe();
    setEmail("");
    setPassword("");
    close();
    if (pendingReveal) router.push(`/report/${pendingReveal.marketId}/${pendingReveal.rank}`);
  }

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
          maxWidth: 440,
          background: "var(--bg)",
          border: "1px solid var(--ink)",
          borderRadius: 6,
          padding: 38,
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
          Create account
        </div>
        <h2 className="serif" style={{ fontWeight: 400, fontSize: 34, lineHeight: 1.1, margin: "14px 0 10px" }}>
          Your first report, on the house.
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 26px" }}>
          No card required. Keep every report you open.
        </p>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            type="email"
            required
            style={inputStyle}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            type="password"
            required
            minLength={6}
            style={inputStyle}
          />
          {error && (
            <p style={{ fontSize: 13, color: "#b3261e", margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              padding: 14,
              background: "var(--ink)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Working…" : "Create account & unlock"}
          </button>
        </form>
        <p className="mono" style={{ fontSize: 10, color: "var(--muted)", margin: "20px 0 0", lineHeight: 1.6 }}>
          Already have an account? Just sign in above with the same email and password.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  border: "1px solid var(--hairline)",
  borderRadius: 4,
  background: "#fff",
  fontSize: 14,
  outline: "none",
};
