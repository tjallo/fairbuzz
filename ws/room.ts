import type { CreateRoom, Room, RoomCreated } from "@contracts/room.ts";
import { createMessage } from "@contracts/envelope.ts";

export const rooms: Map<Room["code"], Room> = new Map();
const CODE_LEN = 8;

function generateRoomCode(): string {
  let code: string;
  do {
    code = "";
    while (code.length < CODE_LEN) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      for (const byte of bytes) {
        // Reject to avoid bias when mapping bytes to 26 letters.
        if (byte >= 234) continue;

        code += String.fromCharCode(65 + byte % 26);
        if (code.length === CODE_LEN) break;
      }
    }
  } while (rooms.has(code));

  return code;
}

export function handleRoomCreate(
  createRoom: CreateRoom,
  socketId: string,
): RoomCreated {
  const roomCode = generateRoomCode();

  const room: Room = {
    name: createRoom.data.roomName,
    host: socketId,
    code: roomCode,
    players: {},
  };

  rooms.set(roomCode, room);

  return createMessage("room.created", {
    roomCode,
  }, createRoom.requestId);
}
