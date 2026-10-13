import type { ClientMessage } from "@contracts/messages";
import type { SocketMessageHandler } from "./socket.svelte";
import type { Ping, Pong } from "@contracts/ping";
import { createMessage } from "@contracts/envelope";

type SendMessage = (message: ClientMessage) => boolean;

function handlePing(ping: Ping): Pong {
    const { uuid } = ping.data;

    return createMessage("pong", { uuid }, ping.requestId);
}

export function createDefaultSocketMessageHandler(
    send: SendMessage,
): SocketMessageHandler {
    return (message) => {
        switch (message.type) {
            case "ping":
                send(handlePing(message));
                break;
            case "error":
                console.error(`Received server error: ${JSON.stringify(message)}`)

        }
    };
}
