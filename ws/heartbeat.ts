import { createMessage } from "@contracts/envelope.ts";
import type { Pong } from "@contracts/ping.ts";
import { setTimeout as delay } from "node:timers/promises";

export function startHeartbeat(socket: WebSocket, socketUuid: string) {
  const controller = new AbortController();
  let pendingPong: {
    requestId: string;
    resolve: (received: boolean) => void;
    reject: (error: Error) => void;
  } | undefined;

  function pingOnce(): Promise<boolean> {
    const ping = createMessage("ping", { uuid: socketUuid });

    return new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingPong?.resolve(false);
      }, 5_000);

      pendingPong = {
        requestId: ping.requestId,
        resolve: (received) => {
          clearTimeout(timeout);
          pendingPong = undefined;
          resolve(received);
        },
        reject: (error) => {
          clearTimeout(timeout);
          pendingPong = undefined;
          reject(error);
        },
      };

      try {
        if (socket.readyState !== WebSocket.OPEN) {
          throw new Error("Socket is not open");
        }
        socket.send(JSON.stringify(ping));
      } catch (error) {
        pendingPong.reject(
          error instanceof Error ? error : new Error("Ping send failed"),
        );
      }
    });
  }

  async function run(): Promise<void> {
    let missedPongs = 0;

    try {
      while (!controller.signal.aborted) {
        const received = await pingOnce();
        if (!received) {
          missedPongs++;
          if (missedPongs >= 3) {
            throw new Error("Three consecutive pongs missed");
          }
          continue;
        }

        missedPongs = 0;
        await delay(5_000, undefined, { signal: controller.signal });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn(`Heartbeat failed for ${socketUuid}:`, error);
        stop();
        socket.close();
      }
    }
  }

  function handlePong(pong: Pong): void {
    if (!pendingPong || pong.requestId !== pendingPong.requestId) {
      stop();
      socket.close(1008, "Unexpected pong requestId");
      return;
    }

    if (pong.data.uuid === socketUuid) {
      pendingPong.resolve(true);
    }
  }

  function stop(): void {
    controller.abort();
    pendingPong?.reject(new Error("Socket disconnected"));
  }

  void run();
  return { handlePong, stop };
}
