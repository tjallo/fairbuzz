import { v1Envelope } from "@contracts/envelope.ts";
import z from "zod";

export const errorSchema = v1Envelope(
  "error",
  z.object({
    code: z.enum([
      "INVALID_MESSAGE",
      "ROOM_NOT_FOUND",
      "INTERNAL_ERROR",
    ]),
    message: z.string(),
  }).strict(),
);

export type WSError = z.infer<typeof errorSchema>;
