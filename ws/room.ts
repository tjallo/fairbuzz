import type { CreateRoom, Room } from "@contracts/room.ts";

const rooms: Map<string, Room> = new Map();
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

export function handleRoomCreate(createRoom: CreateRoom): string {
  const roomCode = generateRoomCode();

  const { name, host } = createRoom.data;

  const room: Room = {
    name,
    host,
    code: roomCode,
    players: {},
  };

  rooms.set(roomCode, room);

  return roomCode;
}
