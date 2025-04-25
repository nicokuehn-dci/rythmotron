<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let label: string = '';
  export let trackColor: string = 'text-blue-500';
  export let active: boolean = false;
  export let selected: boolean = false;
  export let glowColor: string = 'var(--glow-orange-500)';

  function handleClick() {
    dispatch('padclick');
  }
</script>

<button
  on:click={handleClick}
  class="aspect-square w-full bg-rytm-surface/80 relative border rounded-md shadow-md transition-all focus:outline-none overflow-hidden active:scale-[0.97]"
  class:border-rytm-accent={selected}
  class:border-rytm-border={!selected}
>
  <!-- Active state glow/indicator -->
  {#if active}
    <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70"></div>
    <div class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400 shadow-glow-sm shadow-green-400/70"></div>
  {/if}

  <!-- Selected state indicator -->
  {#if selected}
    <div class="absolute inset-0 border-2 border-rytm-accent rounded-md pointer-events-none"></div>
  {/if}

  <!-- Label in center -->
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="{trackColor} font-bold text-lg">{label}</span>
  </div>

  <!-- Bottom gradient for depth -->
  <div class="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent"></div>

  <!-- Glow effect -->
  {#if active}
    <div class="absolute inset-0 bg-[{glowColor}] opacity-20 pointer-events-none"></div>
  {/if}
</button>

<style>
  .shadow-glow-sm {
    box-shadow: 0 0 8px var(--tw-shadow-color);
  }
</style>
