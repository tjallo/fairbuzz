import { v1Envelope } from "@contracts/envelope.ts";
import z from "zod";

export const pingSchema = v1Envelope(
  "ping",
  z.object({
    uuid: z.uuid(),
  }),
);

export type Ping = z.infer<typeof pingSchema>;
