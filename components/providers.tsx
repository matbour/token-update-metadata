"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { AppWalletProvider } from "@/components/wallet-provider";
import { UmiProvider } from "@/components/umi-provider";
import { RPC_ENDPOINT } from "@/lib/constants";

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
      <AppWalletProvider endpoint={RPC_ENDPOINT}>
        <UmiProvider>{children}</UmiProvider>
      </AppWalletProvider>
    </QueryClientProvider>
  );
}
