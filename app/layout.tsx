import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Metadata Updater",
  description: "Update Solana token metadata on-chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-base-100">
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8 max-w-2xl">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
