import { z } from "zod";
import { pingSchema } from "@contracts/ping.ts";
import { createRoomSchema, joinRoomSchema } from "@contracts/room.ts";
import { errorSchema } from "@contracts/error.ts";

export const serverMessageSchema = z.discriminatedUnion("type", [
  pingSchema,
  errorSchema,
]);

export const clientMessageSchema = z.discriminatedUnion("type", [
  createRoomSchema,
  joinRoomSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;
