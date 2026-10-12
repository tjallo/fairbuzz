<script lang="ts">
  const socketAddr = "ws://localhost:8000";
  const socket = new WebSocket(socketAddr);

  function safeSend(msg: string): boolean {
    if (!socket.OPEN) {
      return false;
    }

    socket.send(msg);
    return true;
  }

  function onOpen(ev: Event) {
    console.log("connected");
    const msg = { method: "connect" };

    safeSend(JSON.stringify(msg));
  }

  socket.onopen = onOpen;
</script>

<section></section>
