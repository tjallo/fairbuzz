import { z } from "zod";
import { v1Envelope } from "@contracts/envelope.ts";

export const roomSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().regex(/^[A-Z]{8}$/),
  host: z.uuid(),
  players: z.record(z.uuid(), z.string().trim().min(1, "Name is required")),
});

export type Room = z.infer<typeof roomSchema>;

export const createRoomSchema = v1Envelope(
  "room.create",
  z.object({ roomName: roomSchema.shape.name }).strict(),
);

export const joinRoomSchema = v1Envelope(
  "room.join",
  z.object({
    roomCode: roomSchema.shape.code,
    playerName: roomSchema.shape.name,
  }).strict(),
);

export const roomCreatedSchema = v1Envelope(
  "room.created",
  z.object({ roomCode: roomSchema.shape.code }).strict(),
);

export const roomJoinedSchema = v1Envelope(
  "room.joined",
  z.object({ roomCode: roomSchema.shape.code }).strict(),
);

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
export type RoomCreated = z.infer<typeof roomCreatedSchema>;
export type RoomJoined = z.infer<typeof roomJoinedSchema>;
