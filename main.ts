import type { Ping } from "@contracts/ping.ts";
import { createMessage } from "@contracts/envelope.ts";
import type { ServerMessage } from "@contracts/messages.ts";

const clients = new Map<string, WebSocket>();

export function handler(req: Request): Response {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let pingSender: undefined | ReturnType<typeof setInterval> = undefined;
  const socketUuid = crypto.randomUUID();
  const messageQueue: Array<ServerMessage> = [];

  function safeSend(message: ServerMessage): boolean {
    if (socket.readyState === WebSocket.CONNECTING) {
      messageQueue.push(message);
      return true;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  }

  function flushMessageQueue() {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      if (message === undefined) {
        return;
      }

      const res = safeSend(message);
      if (!res) {
        removeClient();
        break;
      }
    }
  }

  function removeClient() {
    clients.delete(socketUuid);
    if (pingSender !== undefined) {
      clearInterval(pingSender);
      pingSender = undefined;
    }

    socket.close();
  }

  function sendPing() {
    const ping: Ping = createMessage("ping", { uuid: socketUuid });
    const res = safeSend(ping);

    if (!res) {
      removeClient();
      return;
    }
  }

  socket.addEventListener("open", () => {
    console.log(`Client ${socketUuid} connected`);
    clients.set(socketUuid, socket);

    flushMessageQueue();
    if (socket.readyState !== WebSocket.OPEN) return;

    pingSender = setInterval(sendPing, 5_000);
    sendPing();
  });

  socket.addEventListener("close", () => {
    console.log(`Client ${socketUuid} disconnected`);
    removeClient();
  });

  socket.addEventListener("error", () => {
    console.log(`Client ${socketUuid} disconnected due to error`);
    removeClient();
  });

  socket.addEventListener("message", (ev) => {
    const msg = String(ev.data);
    console.log(`Received message: ${msg}`);
  });

  return response;
}

if (import.meta.main) {
  Deno.serve(handler);
}
