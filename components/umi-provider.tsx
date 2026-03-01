"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { type ReactNode, useEffect } from "react";
import { useUmiStore } from "@/store/umi-store";

export function UmiProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const updateSigner = useUmiStore((s) => s.updateSigner);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      updateSigner(wallet as unknown as WalletAdapter);
    }
  }, [wallet.connected, wallet.publicKey, updateSigner, wallet]);

  return <>{children}</>;
}
