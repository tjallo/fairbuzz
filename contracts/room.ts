import { z } from "zod";
import { personSchema } from "@contracts/people.ts";
import { v1Envelope } from "@contracts/envelope.ts";

export const roomSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().regex(/^[A-Z]{8}$/),
  host: personSchema,
  players: z.record(z.uuid(), personSchema),
});

export type Room = z.infer<typeof roomSchema>;

export const createRoomSchema = v1Envelope(
  "room.create",
  roomSchema.pick({ name: true, host: true }).strict(),
);

export const joinRoomSchema = v1Envelope(
  "room.join",
  z.object({
    roomCode: roomSchema.shape.code,
    player: personSchema,
  }).strict(),
);

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
