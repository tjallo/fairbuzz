<script lang="ts">
    import { onMount } from "svelte";
    import type { Person } from "@contracts/people";
    import { createMessage } from "@contracts/envelope";
    import { SocketConnection } from "../lib/socket.svelte";
    import type { Room } from "@contracts/room";

    let {
        onCreated,
    }: {
        onCreated: (roomCode: Room["code"]) => void;
    } = $props();

    let roomName = $state("");
    let feedback = $state("");

    const host: Person = {
        name: `Host-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
        uuid: crypto.randomUUID(),
    };

    onMount(() => {
        const unsubscribe = SocketConnection.onError(() => {
            feedback =
                "Connection error. Please check your connection and reload.";
        });

        return unsubscribe;
    });

    async function createRoom(event: SubmitEvent) {
        event.preventDefault();
        const name = roomName.trim();
        if (!name) {
            feedback = "Please enter a room name.";
            return;
        }

        try {
            const response = await SocketConnection.request(
                createMessage("room.create", { name, host }),
            );

            onCreated(response.data.roomCode);

            feedback = "Room creation requested.";
        } catch (error) {
            feedback = "Not connected. Please reload to reconnect.";

            console.error(error);
        }
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
