import {
  clientMessageSchema,
  type ServerMessage,
} from "@contracts/messages.ts";
import { startHeartbeat } from "./heartbeat.ts";
import { handleRoomCreate } from "./room.ts";

const clients = new Map<string, WebSocket>();

export function handleSocket(socket: WebSocket): void {
  const socketUuid = crypto.randomUUID();
  let heartbeat: ReturnType<typeof startHeartbeat> | undefined;
  let disconnected = false;

  function removeClient(): void {
    if (disconnected) return;
    disconnected = true;

    clients.delete(socketUuid);
    heartbeat?.stop();
    socket.close();
  }

  function safeSend(message: ServerMessage): boolean {
    if (socket.readyState !== WebSocket.OPEN) return false;

    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch {
      removeClient();
      return false;
    }
  }

  socket.addEventListener("open", () => {
    console.log(`Client ${socketUuid} connected`);
    clients.set(socketUuid, socket);
    heartbeat = startHeartbeat(socket, socketUuid);
  });

  socket.addEventListener("close", () => {
    console.log(`Client ${socketUuid} disconnected`);
    removeClient();
  });

  socket.addEventListener("error", () => {
    console.log(`Client ${socketUuid} disconnected due to error`);
    removeClient();
  });

  socket.addEventListener("message", (event) => {
    if (typeof event.data !== "string") return;

    let raw: unknown;
    try {
      raw = JSON.parse(event.data);
    } catch {
      console.warn(`Invalid socket JSON from ${socketUuid}`);
      return;
    }

    const result = clientMessageSchema.safeParse(raw);
    if (!result.success) {
      console.warn(`Invalid socket message from ${socketUuid}`, result.error);
      return;
    }

    const message = result.data;
    switch (message.type) {
      case "pong":
        heartbeat?.handlePong(message);
        break;
      case "room.create":
        safeSend(handleRoomCreate(message, socketUuid));
        break;

      case "room.join":
        // Join room and send room.joined or error.
        break;
      default:
        console.log("Received message:", message);
    }
  });
}
