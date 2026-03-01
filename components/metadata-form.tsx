"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import {
  fetchMetadataFromSeeds,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { none, publicKey, some } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  metadataUpdateSchema,
  type MetadataUpdateForm,
} from "@/lib/schemas";
import { umiWithCurrentWalletAdapter } from "@/store/umi-store";

interface MetadataFormProps {
  asset: DigitalAsset;
  onSuccess: (signature: string) => void;
}

export function MetadataForm({ asset, onSuccess }: MetadataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MetadataUpdateForm>({
    resolver: zodResolver(metadataUpdateSchema),
  });

  const {
    fields: creatorFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "creators",
  });

  const isMutableValue = watch("isMutable");

  useEffect(() => {
    const metadata = asset.metadata;
    reset({
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators:
        metadata.creators.__option === "Some"
          ? metadata.creators.value.map((c) => ({
              address: c.address.toString(),
              share: c.share,
              verified: c.verified,
            }))
          : [],
      isMutable: metadata.isMutable,
      newUpdateAuthority: "",
    });
  }, [asset, reset]);

  const onSubmit = async (data: MetadataUpdateForm) => {
    setIsSubmitting(true);
    setTxError(null);

    try {
      const umi = umiWithCurrentWalletAdapter();
      if (!umi) throw new Error("Wallet not connected");

      const mint = publicKey(asset.mint.publicKey.toString());
      const initialMetadata = await fetchMetadataFromSeeds(umi, { mint });

      const creatorsOption =
        data.creators.length > 0
          ? some(
              data.creators.map((c) => ({
                address: publicKey(c.address),
                share: c.share,
                verified: c.verified,
              }))
            )
          : none();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateArgs: any = {
        mint,
        authority: umi.identity,
        data: some({
          ...initialMetadata,
          name: data.name,
          symbol: data.symbol,
          uri: data.uri,
          sellerFeeBasisPoints: data.sellerFeeBasisPoints,
          creators: creatorsOption,
        }),
        isMutable: some(data.isMutable),
      };

      if (data.newUpdateAuthority && data.newUpdateAuthority.length >= 32) {
        updateArgs.newUpdateAuthority = some(
          publicKey(data.newUpdateAuthority)
        );
      }

      const result = await updateV1(umi, updateArgs).sendAndConfirm(umi);
      const sig = base58.deserialize(result.signature)[0];
      onSuccess(sig);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl mt-6">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">Edit Metadata</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text">Name</span>
            </label>
            <input
              id="name"
              type="text"
              className="input input-bordered"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-error text-sm mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Symbol */}
          <div className="form-control">
            <label className="label" htmlFor="symbol">
              <span className="label-text">Symbol (Ticker)</span>
            </label>
            <input
              id="symbol"
              type="text"
              className="input input-bordered"
              {...register("symbol")}
            />
            {errors.symbol && (
              <span className="text-error text-sm mt-1">
                {errors.symbol.message}
              </span>
            )}
          </div>

          {/* URI */}
          <div className="form-control">
            <label className="label" htmlFor="uri">
              <span className="label-text">Metadata URI</span>
            </label>
            <input
              id="uri"
              type="text"
              className="input input-bordered font-mono text-sm"
              {...register("uri")}
            />
            {errors.uri && (
              <span className="text-error text-sm mt-1">
                {errors.uri.message}
              </span>
            )}
          </div>

          {/* Seller Fee Basis Points */}
          <div className="form-control">
            <label className="label" htmlFor="sfbp">
              <span className="label-text">Seller Fee Basis Points</span>
              <span className="label-text-alt text-base-content/50">
                0-10000 (100 = 1%)
              </span>
            </label>
            <input
              id="sfbp"
              type="number"
              className="input input-bordered"
              {...register("sellerFeeBasisPoints", { valueAsNumber: true })}
            />
            {errors.sellerFeeBasisPoints && (
              <span className="text-error text-sm mt-1">
                {errors.sellerFeeBasisPoints.message}
              </span>
            )}
          </div>

          {/* Creators */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Creators</span>
            </label>
            <div className="space-y-3">
              {creatorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start flex-wrap sm:flex-nowrap"
                >
                  <input
                    type="text"
                    className="input input-bordered input-sm font-mono flex-1 min-w-0"
                    placeholder="Address"
                    {...register(`creators.${index}.address`)}
                  />
                  <input
                    type="number"
                    className="input input-bordered input-sm w-20"
                    placeholder="Share"
                    {...register(`creators.${index}.share`, {
                      valueAsNumber: true,
                    })}
                  />
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      {...register(`creators.${index}.verified`)}
                    />
                    <span className="label-text text-sm">Verified</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-square btn-sm btn-ghost text-error"
                    onClick={() => remove(index)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  append({ address: "", share: 0, verified: false })
                }
              >
                + Add Creator
              </button>
            </div>
          </div>

          {/* Is Mutable */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...register("isMutable")}
              />
              <span className="label-text">Token is Mutable</span>
            </label>
            {isMutableValue === false && (
              <div className="alert alert-warning mt-2">
                <span className="text-sm font-semibold">
                  Warning: Unchecking this will permanently lock the token
                  metadata. This action cannot be undone.
                </span>
              </div>
            )}
          </div>

          {/* New Update Authority */}
          <div className="form-control">
            <label className="label" htmlFor="newAuthority">
              <span className="label-text">Transfer Update Authority</span>
              <span className="label-text-alt text-base-content/50">
                Optional
              </span>
            </label>
            <input
              id="newAuthority"
              type="text"
              className="input input-bordered font-mono text-sm"
              placeholder="Leave empty to keep current authority"
              {...register("newUpdateAuthority")}
            />
          </div>

          {txError && (
            <div className="alert alert-error">
              <span>{txError}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner" />
            ) : (
              "Update Metadata"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
