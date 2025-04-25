<script lang="ts">
  export let label: string;
  export let secondaryLabel: string = '';
  export let active: boolean = false;
</script>

<button 
class="flex flex-col items-center justify-center px-2 py-1.5 border rounded transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97]"
        class:bg-rytm-accent={active}
        class:border-rytm-accent={active}
        class:bg-rytm-surface={!active}
  class:border-rytm-border={!active}
>
  <span class="text-[0.65rem] font-bold uppercase tracking-wider {active ? 'text-white' : 'text-rytm-text-primary'}">
{label}
</span>
  {#if secondaryLabel}
    <span class="text-[0.5rem] uppercase tracking-wider text-rytm-text-secondary">
{secondaryLabel}
</span>
  {/if}
</button>
