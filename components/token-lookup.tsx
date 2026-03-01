"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm } from "react-hook-form";
import { mintLookupSchema, type MintLookupForm } from "@/lib/schemas";

interface TokenLookupProps {
  onSubmit: (mintAddress: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function TokenLookup({ onSubmit, isLoading, error }: TokenLookupProps) {
  const { connected } = useWallet();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MintLookupForm>({
    resolver: zodResolver(mintLookupSchema),
  });

  if (!connected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center py-16">
          <h2 className="card-title text-2xl mb-2">Update Token Metadata</h2>
          <p className="text-base-content/70">
            Connect your wallet to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">Look Up Token</h2>
        <form
          onSubmit={handleSubmit((data) => onSubmit(data.mintAddress))}
          className="space-y-4"
        >
          <div className="form-control">
            <label className="label" htmlFor="mintAddress">
              <span className="label-text">Token Mint Address</span>
            </label>
            <input
              id="mintAddress"
              type="text"
              className="input input-bordered font-mono"
              placeholder="Enter token mint address..."
              {...register("mintAddress")}
            />
            {errors.mintAddress && (
              <span className="text-error text-sm mt-1">
                {errors.mintAddress.message}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Fetch Metadata"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
