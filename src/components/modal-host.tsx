"use client";

import { AuthModal } from "@/components/auth-modal";
import { PaywallModal } from "@/components/paywall-modal";

export function ModalHost() {
  return (
    <>
      <AuthModal />
      <PaywallModal />
    </>
  );
}
