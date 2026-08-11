"use client";

import { SessionProvider } from "next-auth/react";
import { AppUiProvider } from "@/lib/app-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppUiProvider>{children}</AppUiProvider>
    </SessionProvider>
  );
}
