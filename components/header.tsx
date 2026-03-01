"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export function Header() {
  return (
    <div className="navbar bg-base-200 px-4 sticky top-0 z-50">
      <div className="flex-1">
        <span className="text-xl font-bold text-primary">
          Token Metadata Updater
        </span>
      </div>
      <div className="flex-none">
        <WalletMultiButton />
      </div>
    </div>
  );
}
