import { z } from "zod";
import { pingSchema, pongSchema } from "@contracts/ping.ts";
import {
  createRoomSchema,
  joinRoomSchema,
  roomCreatedSchema,
  roomJoinedSchema,
} from "@contracts/room.ts";
import { errorSchema } from "@contracts/error.ts";

export const serverMessageSchema = z.discriminatedUnion("type", [
  pingSchema,
  errorSchema,
  roomCreatedSchema,
  roomJoinedSchema,
]);

export const clientMessageSchema = z.discriminatedUnion("type", [
  createRoomSchema,
  joinRoomSchema,
  pongSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;

export const requestResponseTypes = {
  "room.create": "room.created",
  "room.join": "room.joined",
} as const;

export type RequestMessage = Extract<
  ClientMessage,
  { type: keyof typeof requestResponseTypes }
>;

export type ResponseMessage<Request extends RequestMessage> = Extract<
  ServerMessage,
  { type: (typeof requestResponseTypes)[Request["type"]] }
>;
