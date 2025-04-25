<script lang="ts">
  export let label: string = '';
  export let icon: string = ''; // SVG path data
  export let active: boolean = false;
</script>

<button 
class="w-8 h-8 bg-rytm-surface hover:brightness-110 border border-rytm-border rounded flex items-center justify-center transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97]"
  class:bg-rytm-accent={active}
  class:border-rytm-accent={active}
>
  {#if icon}
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="text-rytm-text-primary {active ? 'text-white' : ''}">
      {@html icon}
    </svg>
  {:else}
    <span class="text-[0.65rem] font-bold uppercase tracking-wider {active ? 'text-white' : 'text-rytm-text-primary'}">
{label}
</span>
  {/if}
</button>