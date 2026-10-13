<script lang="ts">
  import CreateRoom from "./components/CreateRoom.svelte";
  import type { Room } from "@contracts/room";

  let roomCode = $state<Room["code"] | null>(null);

  $effect(() => {
    console.log(roomCode);
  });
</script>

<section>
  <CreateRoom
    onCreated={(code) => {
      roomCode = code;
    }}
  />
</section>
