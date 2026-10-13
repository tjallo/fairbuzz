<script lang="ts">
    import { roomSchema, type Room } from "@contracts/room";
    import { SocketConnection } from "../lib/socket.svelte";
    import { createMessage } from "@contracts/envelope";

    let roomCode: Room["code"] = $state("");
    let playerName: Room["name"] = $state("");
    let feedback = $state("");

    $effect(() => {
        roomCode = roomCode.toUpperCase();
    });

    let validRoomCode = $derived(
        roomSchema.shape.code.safeParse(roomCode).success,
    );

    let validPlayerName = $derived(
        roomSchema.shape.name.safeParse(playerName).success,
    );

    let socketReady = $derived(SocketConnection.isOpen);
    let mayJoin = $derived(validRoomCode && validPlayerName && socketReady);

    async function joinRoom(event: SubmitEvent) {
        event.preventDefault();

        if (!mayJoin) {
            return;
        }

        try {
            await SocketConnection.request(
                createMessage("room.join", { roomCode, playerName }),
            );
        } catch (error) {
            feedback = error instanceof Error ? error.message : "Join failed";
        }
    }
</script>

<section>
    <h1>Join a room</h1>
    <p>{SocketConnection.isOpen ? "Connected" : "Not connected"}</p>

    <form onsubmit={joinRoom}>
        <label for="player-name">Player Name</label>
        <input id="player-name" type="text" bind:value={playerName} required />
        <label for="room-code">Room code</label>
        <input id="room-code" type="text" bind:value={roomCode} required />
        <button type="submit" disabled={!mayJoin}> Join Room </button>
    </form>

    <p role="status">{feedback}</p>
</section>
