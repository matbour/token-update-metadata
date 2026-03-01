"use client";

import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MetadataForm } from "@/components/metadata-form";
import { TokenLookup } from "@/components/token-lookup";
import { umiWithCurrentWalletAdapter } from "@/store/umi-store";

export default function Home() {
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const { publicKey: walletPublicKey } = useWallet();

  const {
    data: asset,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["digitalAsset", mintAddress],
    queryFn: async () => {
      const umi = umiWithCurrentWalletAdapter();
      if (!umi) throw new Error("Wallet not connected");
      return fetchDigitalAsset(umi, publicKey(mintAddress!));
    },
    enabled: !!mintAddress && !!walletPublicKey,
    retry: false,
  });

  let validationError: string | null = null;
  if (asset && walletPublicKey) {
    if (
      asset.metadata.updateAuthority.toString() !==
      walletPublicKey.toBase58()
    ) {
      validationError =
        "Your wallet is not the update authority for this token.";
    } else if (!asset.metadata.isMutable) {
      validationError =
        "This token's metadata is immutable and cannot be updated.";
    }
  }

  const fetchError =
    error instanceof Error
      ? error.message
      : error
        ? "Failed to fetch token"
        : null;

  return (
    <div className="space-y-6">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-bold">Token Metadata Updater</h1>
        <p className="text-base-content/70 mt-2">
          Connect your wallet and enter a token mint address to update its
          on-chain metadata.
        </p>
      </div>

      <TokenLookup
        onSubmit={(addr) => {
          setMintAddress(addr);
          setTxSignature(null);
        }}
        isLoading={isLoading || isFetching}
        error={fetchError ?? validationError}
      />

      {asset && !validationError && (
        <MetadataForm
          asset={asset}
          onSuccess={(sig) => setTxSignature(sig)}
        />
      )}

      {txSignature && (
        <div className="alert alert-success">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">
              Metadata updated successfully!
            </span>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-sm break-all"
            >
              View transaction on Solana Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
