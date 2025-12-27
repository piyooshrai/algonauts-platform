"use client";

/**
 * App Providers
 * Combines all client-side providers: NextAuth, tRPC, React Query
 */

import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/lib/trpc/provider";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
