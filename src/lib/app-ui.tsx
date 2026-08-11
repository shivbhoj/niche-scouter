"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export interface PendingReveal {
  marketId: string;
  rank: number;
  nicheName?: string;
}

interface Me {
  signedIn: boolean;
  email: string | null;
  credits: number;
}

interface AppUiState {
  me: Me;
  loadingMe: boolean;
  refreshMe: () => Promise<void>;
  showAuth: boolean;
  showPaywall: boolean;
  pendingReveal: PendingReveal | null;
  openAuth: (pending?: PendingReveal) => void;
  openPaywall: (pending?: PendingReveal) => void;
  close: () => void;
}

const AppUiContext = createContext<AppUiState | null>(null);

export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [me, setMe] = useState<Me>({ signedIn: false, email: null, credits: 0 });
  const [loadingMe, setLoadingMe] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<PendingReveal | null>(null);

  const refreshMe = useCallback(async () => {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setMe(
        data.signedIn
          ? { signedIn: true, email: data.email, credits: data.credits }
          : { signedIn: false, email: null, credits: 0 }
      );
    } finally {
      setLoadingMe(false);
    }
  }, []);

  useEffect(() => {
    // Fetching our own session-derived state on mount/session-change; the
    // setState calls happen asynchronously after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status !== "loading") void refreshMe();
  }, [status, refreshMe]);

  const openAuth = useCallback((pending?: PendingReveal) => {
    setPendingReveal(pending ?? null);
    setShowAuth(true);
    setShowPaywall(false);
  }, []);

  const openPaywall = useCallback((pending?: PendingReveal) => {
    setPendingReveal(pending ?? null);
    setShowPaywall(true);
    setShowAuth(false);
  }, []);

  const close = useCallback(() => {
    setShowAuth(false);
    setShowPaywall(false);
  }, []);

  return (
    <AppUiContext.Provider
      value={{ me, loadingMe, refreshMe, showAuth, showPaywall, pendingReveal, openAuth, openPaywall, close }}
    >
      {children}
    </AppUiContext.Provider>
  );
}

export function useAppUi() {
  const ctx = useContext(AppUiContext);
  if (!ctx) throw new Error("useAppUi must be used within AppUiProvider");
  return ctx;
}
