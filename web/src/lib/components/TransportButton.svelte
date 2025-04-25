<script lang="ts">
    export let label: string;
  export let icon: string = '';
  export let active: boolean = false;
export let bgColor: string = 'bg-rytm-surface hover:bg-rytm-surface-hover';
</script>

<button
    class="w-12 h-12 {bgColor} rounded-full flex items-center justify-center border border-rytm-border shadow-md transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97] overflow-hidden"
  class:ring-2={active}
  class:ring-green-500={active}
>
{#if icon}
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       {@html icon}
  </svg>
{:else}
    <span class="text-sm font-medium">{label}</span>
  {/if}

  <!-- Active indicator glow -->
  {#if active}
    <div class="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
  {/if}
</button>