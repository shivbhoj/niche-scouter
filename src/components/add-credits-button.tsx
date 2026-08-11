"use client";

import { useAppUi } from "@/lib/app-ui";

export function AddCreditsButton() {
  const { openPaywall } = useAppUi();
  return (
    <button
      onClick={() => openPaywall()}
      className="btn-hover"
      style={{ padding: "12px 22px", background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 999, fontSize: 13, cursor: "pointer" }}
    >
      Add report credits
    </button>
  );
}
