"use client";

import type React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </SessionProvider>
  );
}
