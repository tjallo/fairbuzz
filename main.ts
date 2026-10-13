import { Ping } from "@contracts/ping.ts";
import { createMessage } from "@contracts/envelope.ts";

const clients = new Map<string, WebSocket>();

export function handler(req: Request): Response {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let pingSender: undefined | ReturnType<typeof setInterval> = undefined;
  const socketUuid = crypto.randomUUID();
  const messageQueue: Array<string> = [];

  function safeSend(message: string): boolean {
    if (socket.readyState === WebSocket.CONNECTING) {
      messageQueue.push(message);
      return true;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(message);
      return true;
    } catch {
      return false;
    }
  }

  function flushMessageQueue() {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      if (!message) {
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
    if (pingSender) {
      clearInterval(pingSender);
    }

    socket.close();
  }

  function sendPing() {
    const ping: Ping = createMessage("ping", { uuid: socketUuid });
    const res = safeSend(JSON.stringify(ping));

    if (!res) {
      removeClient();
      return;
    }
  }

  socket.addEventListener("open", (_ev) => {
    console.log(`Client ${socketUuid} connected`);
    clients.set(socketUuid, socket);
    flushMessageQueue();
    sendPing();
    pingSender = setInterval(sendPing, 5 * 1_000);
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
