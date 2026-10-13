<script lang="ts">
  import CreateRoom from "./components/CreateRoom.svelte";
  import type { Room } from "@contracts/room";

  let roomCode = $state<Room["code"] | null>(null);

  $effect(() => {
    console.log(roomCode);
  });
</script>

<section>
  {#if roomCode === null}
    <CreateRoom
      onCreated={(code) => {
        roomCode = code;
      }}
    />
  {:else}
    <h1>Roomcode: {roomCode}</h1>
  {/if}
</section>
