<script lang="ts">
  import { onMount } from "svelte";
  import Home from "./components/Home.svelte";
  import CreateRoom from "./components/CreateRoom.svelte";
  import JoinRoom from "./components/JoinRoom.svelte";
  import HostRoom from "./components/HostRoom.svelte";
  import PlayerRoom from "./components/PlayerRoom.svelte";

  let pathname = $state(window.location.pathname);

  function navigate(path: string): void {
    window.history.pushState(null, "", path);
    pathname = window.location.pathname;
  }

  onMount(() => {
    const onPopState = () => {
      pathname = window.location.pathname;
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  });
</script>

{#if pathname === "/"}
  <Home onCreate={() => navigate("/create")} onJoin={() => navigate("/join")} />
{:else if pathname === "/create"}
  <CreateRoom onCreated={() => navigate("/host")} />
{:else if pathname === "/join"}
  <JoinRoom />
{:else if pathname === "/host"}
  <HostRoom />
{:else if pathname === "/play"}
  <PlayerRoom />
{:else}
  <h1>Page not found</h1>
{/if}
