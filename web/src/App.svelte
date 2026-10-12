<script lang="ts">
  import { SocketConnection } from "./lib/socket.svelte";
  import { CreateRoom } from "@contracts/room";

  let roomName = $state("");

  function createRoom() {
    const message: CreateRoom = {};

    SocketConnection.send(message);
  }
</script>

<section>
  <input type="text" bind:value={roomName} />
  <button onclick={createRoom}>Create Room</button>
</section>
