import type { Envelope } from "./envelope.ts";

export type CreateRoom = Envelope<"v1", "room.create", { roomName: string }>;

export type JoinRoom = Envelope<"v1", "room.join", { roomCode: string }>;
