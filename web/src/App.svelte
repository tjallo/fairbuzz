<script>
  const socketAddr = "ws://localhost:8000";
  const socket = new WebSocket(socketAddr);

  socket.onopen = (ev) => {
    console.log("connection!", ev);
  };
</script>

<section></section>
