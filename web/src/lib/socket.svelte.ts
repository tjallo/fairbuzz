class Socket {
  #socket: WebSocket;
  #isOpen = false;
  #messageQueue: Array<string> = [];

  #flushMessageQueue(): void {
    if (this.#messageQueue.length < 1) {
      return;
    }

    while (this.#messageQueue.length > 0) {
      const val = this.#messageQueue.shift();
      if (val === undefined) {
        return;
      }

      this.send(val);
    }
  }

  #onOpen(_event: Event) {
    this.#isOpen = true;
  }

  #onClose(_event: Event) {
    this.#isOpen = false;
  }

  #onError(_event: Event) {}

  #onMessage(_event: Event) {}

  constructor(url: string) {
    this.#socket = new WebSocket(url);

    this.#socket.onopen = this.#onOpen;
    this.#socket.onclose = this.#onClose;
    this.#socket.onmessage = this.#onMessage;
    this.#socket.onerror = this.#onError;
  }

  public send(message: string) {
    if (!this.#isOpen) {
      this.#messageQueue.push(message);
      return;
    }

    this.#socket.send(message);
  }
}

export const SocketConnection = $state(new Socket("ws://localhost:8000"));
