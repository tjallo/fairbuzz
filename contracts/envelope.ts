import { z } from "zod";

export const v1Envelope = <Type extends string, Data extends z.ZodType>(
  type: Type,
  data: Data,
) =>
  z
    .object({
      version: z.literal("v1"),
      requestId: z.uuid(),
      type: z.literal(type),
      data,
    })
    .strict();

export function createMessage<Type extends string, Data>(
  type: Type,
  data: Data,
  requestId = crypto.randomUUID(),
) {
  return {
    version: "v1" as const,
    requestId,
    type,
    data,
  };
}
