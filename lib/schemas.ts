import { z } from "zod";

export const mintLookupSchema = z.object({
  mintAddress: z
    .string()
    .min(32, "Invalid mint address")
    .max(44, "Invalid mint address"),
});

export type MintLookupForm = z.infer<typeof mintLookupSchema>;

const creatorSchema = z.object({
  address: z.string().min(32, "Invalid address").max(44, "Invalid address"),
  share: z.number().int().min(0, "Min 0").max(100, "Max 100"),
  verified: z.boolean(),
});

export const metadataUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(32, "Max 32 characters"),
  symbol: z.string().max(10, "Max 10 characters"),
  uri: z.string().url("Must be a valid URL").or(z.literal("")),
  sellerFeeBasisPoints: z
    .number()
    .int()
    .min(0, "Min 0")
    .max(10000, "Max 10000 (100%)"),
  creators: z.array(creatorSchema),
  isMutable: z.boolean(),
  newUpdateAuthority: z.string().max(44).optional().or(z.literal("")),
});

export type MetadataUpdateForm = z.infer<typeof metadataUpdateSchema>;
