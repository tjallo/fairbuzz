<script lang="ts">
    let { onCreate, onJoin }: {
        onCreate: () => void;
        onJoin: () => void;
    } = $props();
</script>

<section>
    <button onclick={onJoin}>Join Room</button>
    <button onclick={onCreate}>Create Room</button>
</section>
