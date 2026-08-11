"use client";

import Link from "next/link";
import { useAppUi } from "@/lib/app-ui";

export function Header() {
  const { me, openAuth } = useAppUi();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "18px 40px",
        background: "rgba(246,247,249,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 9, cursor: "pointer" }}>
        <span className="serif" style={{ fontSize: 22, letterSpacing: "-0.01em" }}>
          Niche Scouter
        </span>
        <span
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          beta
        </span>
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--muted)" }}>
          How it works
        </Link>
        <Link href="/#pricing" style={{ fontSize: 13, color: "var(--muted)" }}>
          Pricing
        </Link>
        {me.signedIn ? (
          <>
            <Link href="/dashboard" style={{ fontSize: 13, color: "var(--muted)" }}>
              Dashboard
            </Link>
            <span
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 11px",
                border: "1px solid var(--hairline)",
                borderRadius: 999,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink)" }} />
              {me.credits} report {me.credits === 1 ? "credit" : "credits"}
            </span>
          </>
        ) : (
          <button
            onClick={() => openAuth()}
            style={{
              padding: "9px 17px",
              background: "var(--ink)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 999,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign up free
          </button>
        )}
      </nav>
    </header>
  );
}
