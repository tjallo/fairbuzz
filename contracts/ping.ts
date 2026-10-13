import { v1Envelope } from "@contracts/envelope.ts";
import z from "zod";

export const ping = v1Envelope(
  "ping",
  z.object({
    uuid: z.uuid(),
  }),
);
