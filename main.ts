import { handleSocket } from "./ws/socket.ts";

export function handler(req: Request): Response {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  handleSocket(socket);

  return response;
}

if (import.meta.main) {
  Deno.serve(handler);
}
