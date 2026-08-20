"use client";

import Link from "next/link";
import { useAppUi } from "@/lib/app-ui";

export function Header() {
  const { me, openAuth } = useAppUi();

  return (
    <header
      className="site-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        background: "rgba(246,247,249,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Link href="/" className="site-logo" style={{ display: "flex", alignItems: "baseline", gap: 9, cursor: "pointer" }}>
        <span className="serif site-logo-text" style={{ letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
          Niche Scouter
        </span>
        <span
          className="mono nav-beta"
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
      <nav className="site-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* Marketing links are the first thing to go on a phone — the
            credit count and the sign-up button are what the header is
            actually for, and both are reachable from the page itself. */}
        <Link href="/" className="nav-marketing" style={{ fontSize: 13, color: "var(--muted)" }}>
          How it works
        </Link>
        <Link href="/#pricing" className="nav-marketing" style={{ fontSize: 13, color: "var(--muted)" }}>
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
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink)", flex: "none" }} />
              {/* "report" is dropped on a phone; the pill sits next to the
                  word "credit" either way, so nothing is lost. */}
              <span>
                {me.credits}
                <span className="nav-marketing"> report</span>{" "}
                {me.credits === 1 ? "credit" : "credits"}
              </span>
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
