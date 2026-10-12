const clients = new Map<string, WebSocket>();

export function handler(req: Request): Response {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const socketId = crypto.randomUUID();

  socket.addEventListener("open", (_ev) => {
    console.log(`Client ${socketId} connected`);
    clients.set(socketId, socket);
  });

  socket.addEventListener("close", () => {
    console.log(`Client ${socketId} disconnected`);
    clients.delete(socketId);
  });

  socket.addEventListener("error", () => {
    console.log(`Client ${socketId} disconnected due to error`);
    clients.delete(socketId);
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
