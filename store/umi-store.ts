import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  createNoopSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { create } from "zustand";

const DEFAULT_ENDPOINT = "https://api.devnet.solana.com";

function createBaseUmi(endpoint: string) {
  return createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(
      signerIdentity(
        createNoopSigner(publicKey("11111111111111111111111111111111"))
      )
    );
}

interface UmiStore {
  umi: ReturnType<typeof createBaseUmi>;
  signer: ReturnType<typeof createSignerFromWalletAdapter> | null;
  updateSigner: (wallet: WalletAdapter) => void;
  setEndpoint: (endpoint: string) => void;
}

export const useUmiStore = create<UmiStore>((set) => ({
  umi: createBaseUmi(DEFAULT_ENDPOINT),
  signer: null,

  updateSigner: (wallet: WalletAdapter) => {
    const signer = createSignerFromWalletAdapter(wallet);
    set({ signer });
  },

  setEndpoint: (endpoint: string) => {
    set({ umi: createBaseUmi(endpoint) });
  },
}));

export function umiWithCurrentWalletAdapter() {
  const { umi, signer } = useUmiStore.getState();
  if (!signer) return null;
  return umi.use(signerIdentity(signer));
}
