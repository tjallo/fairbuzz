import {
  type ClientMessage,
  type RequestMessage,
  type ResponseMessage,
  type ServerMessage,
  serverMessageSchema,
} from "@contracts/messages";
import { createDefaultSocketMessageHandler } from "./defaultSocketMessageHandler";
import { Requests } from "./request";

export type SocketMessageHandler = (message: ServerMessage) => void;
type SocketErrorHandler = (event: Event) => void;

function defaultSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

class Socket {
  #socket: WebSocket;
  #requests = new Requests();
  #messageQueue: Array<ClientMessage> = [];
  #messageHandlers = new Set<SocketMessageHandler>();
  #errorHandlers = new Set<SocketErrorHandler>();

  isOpen = $state(false);

  constructor(url: string) {
    this.#socket = new WebSocket(url);
    this.#socket.addEventListener("open", this.#onOpen);
    this.#socket.addEventListener("close", this.#onClose);
    this.#socket.addEventListener("message", this.#onMessage);
    this.#socket.addEventListener("error", this.#onError);
  }

  #onOpen = (): void => {
    this.isOpen = true;
    while (
      this.#messageQueue.length > 0 &&
      this.#socket.readyState === WebSocket.OPEN
    ) {
      const message = this.#messageQueue.shift();
      if (message !== undefined) this.send(message);
    }
  };

  #onClose = (): void => {
    this.isOpen = false;
    this.#requests.clear(new Error("Socket disconnected"));
  };

  #onMessage = (event: MessageEvent): void => {
    if (typeof event.data !== "string") return;

    let raw: unknown;
    try {
      raw = JSON.parse(event.data);
    } catch {
      console.warn("Invalid socket JSON");
      return;
    }

    const result = serverMessageSchema.safeParse(raw);
    if (!result.success) {
      console.error("Invalid socket message", result.error);
      return;
    }

    this.#requests.handle(result.data);
    for (const handler of this.#messageHandlers) handler(result.data);
  };

  #onError = (event: Event): void => {
    this.#requests.clear(new Error("Socket error"));
    for (const handler of this.#errorHandlers) handler(event);
  };

  /** Sends immediately when open, queues while connecting, and returns false if closed. */
  send(message: ClientMessage): boolean {
    if (this.#socket.readyState === WebSocket.CONNECTING) {
      this.#messageQueue.push(message);
      return true;
    }

    if (this.#socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.#socket.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  }

  request<Request extends RequestMessage>(
    message: Request,
    timeoutMs = 5_000,
  ): Promise<ResponseMessage<Request>> {
    if (this.#socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Socket is not open"));
    }

    return this.#requests.request(
      message,
      (request) => this.send(request),
      timeoutMs,
    );
  }

  onMessage(handler: SocketMessageHandler): () => void {
    this.#messageHandlers.add(handler);
    return () => this.#messageHandlers.delete(handler);
  }

  onError(handler: SocketErrorHandler): () => void {
    this.#errorHandlers.add(handler);
    return () => this.#errorHandlers.delete(handler);
  }

  close(code?: number, reason?: string): void {
    this.#socket.close(code, reason);
    this.#requests.clear(new Error("Socket closed"));
  }
}

export const SocketConnection = new Socket(defaultSocketUrl());
SocketConnection.onMessage(
  createDefaultSocketMessageHandler((message) => SocketConnection.send(message)),
);
