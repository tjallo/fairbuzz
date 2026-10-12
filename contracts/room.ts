import { z } from "zod";
import { v1Envelope } from "./envelope.ts";

export const createRoomSchema = v1Envelope(
  "room.create",
  z.object({ roomName: z.string() }).strict(),
);

export const joinRoomSchema = v1Envelope(
  "room.join",
  z.object({ roomCode: z.string() }).strict(),
);

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
