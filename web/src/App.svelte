<script lang="ts">
  import { onMount } from "svelte";
  import { SocketConnection } from "./lib/socket.svelte";
  import type { CreateRoom } from "@contracts/room";
  import type { Person } from "@contracts/people";

  let roomName = $state("");
  let feedback = $state("");

  const host: Person = {
    name: "henkjan",
    uuid: crypto.randomUUID(),
  };

  onMount(() => {
    const unsubscribe = SocketConnection.onError(() => {
      feedback = "Connection error. Please check your connection and reload.";
    });

    return unsubscribe;
  });

  function createRoom(event: SubmitEvent) {
    event.preventDefault();
    const name = roomName.trim();
    if (!name) {
      feedback = "Please enter a room name.";
      return;
    }

    const message: CreateRoom = {
      version: "v1",
      requestId: crypto.randomUUID(),
      type: "room.create",
      data: { name, host },
    };

    feedback = SocketConnection.send(JSON.stringify(message))
      ? "Room creation requested."
      : "Not connected. Please reload to reconnect.";
  }
</script>

<section>
  <h1>Create a room</h1>
  <p>{SocketConnection.isOpen ? "Connected" : "Not connected"}</p>

  <form onsubmit={createRoom}>
    <label for="room-name">Room name</label>
    <input id="room-name" type="text" bind:value={roomName} required />
    <button
      type="submit"
      disabled={!SocketConnection.isOpen || !roomName.trim()}
    >
      Create Room
    </button>
  </form>

  <p role="status">{feedback}</p>
</section>
