type SocketMessageHandler = (event: MessageEvent) => void;
type SocketErrorHandler = (event: Event) => void;

function defaultSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

class Socket {
  #socket: WebSocket;
  #messageQueue: Array<string> = [];
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
  };

  #onMessage = (event: MessageEvent): void => {
    for (const handler of this.#messageHandlers) handler(event);
  };

  #onError = (event: Event): void => {
    for (const handler of this.#errorHandlers) handler(event);
  };

  /** Sends immediately when open, queues while connecting, and returns false if closed. */
  send(message: string): boolean {
    if (this.#socket.readyState === WebSocket.CONNECTING) {
      this.#messageQueue.push(message);
      return true;
    }

    if (this.#socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.#socket.send(message);
      return true;
    } catch {
      return false;
    }
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
  }
}

export const SocketConnection = new Socket(defaultSocketUrl());
