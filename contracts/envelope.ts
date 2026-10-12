import { z } from "zod";

export const v1Envelope = <Type extends string, Data extends z.ZodType>(
  type: Type,
  data: Data,
) =>
  z
    .object({
      version: z.literal("v1"),
      type: z.literal(type),
      data,
    })
    .strict();
