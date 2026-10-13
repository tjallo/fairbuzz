import {
  requestResponseTypes,
  type RequestMessage,
  type ResponseMessage,
  type ServerMessage,
} from "@contracts/messages";
import type { WSError } from "@contracts/error";

export class RequestError extends Error {
  readonly code: WSError["data"]["code"];
  readonly requestId: string;

  constructor(message: WSError) {
    super(message.data.message);
    this.name = "RequestError";
    this.code = message.data.code;
    this.requestId = message.requestId;
  }
}

type PendingRequest = {
  responseType: string;
  resolve: (message: ServerMessage) => void;
  reject: (error: Error) => void;
};

export class Requests {
  #pending = new Map<string, PendingRequest>();

  request<Request extends RequestMessage>(
    message: Request,
    send: (message: RequestMessage) => boolean,
    timeoutMs = 5_000,
  ): Promise<ResponseMessage<Request>> {
    if (this.#pending.has(message.requestId)) {
      return Promise.reject(new Error("Request ID is already pending"));
    }

    return new Promise<ResponseMessage<Request>>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        this.#pending.delete(message.requestId);
      };

      const pending: PendingRequest = {
        responseType: requestResponseTypes[message.type],
        resolve: (response) => {
          cleanup();
          // handle() checks the response type before resolving.
          resolve(response as ResponseMessage<Request>);
        },
        reject: (error) => {
          cleanup();
          reject(error);
        },
      };

      const timeout = setTimeout(() => {
        pending.reject(new Error("Request timed out"));
      }, timeoutMs);

      this.#pending.set(message.requestId, pending);
      if (!send(message)) {
        pending.reject(new Error("Request send failed"));
      }
    });
  }

  handle(message: ServerMessage): void {
    const pending = this.#pending.get(message.requestId);
    if (!pending) return;

    if (message.type === "error") {
      pending.reject(new RequestError(message));
    } else if (message.type === pending.responseType) {
      pending.resolve(message);
    }
  }

  clear(error: Error): void {
    for (const pending of this.#pending.values()) {
      pending.reject(error);
    }
  }
}
