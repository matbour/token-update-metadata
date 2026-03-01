"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { AppWalletProvider } from "@/components/wallet-provider";
import { UmiProvider } from "@/components/umi-provider";

const ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppWalletProvider endpoint={ENDPOINT}>
        <UmiProvider>{children}</UmiProvider>
      </AppWalletProvider>
    </QueryClientProvider>
  );
}
