<script lang="ts">
  export let label: string;
export let active: boolean = false;
</script>

<button 
  class="px-2 py-1.5 border rounded transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97] text-[0.65rem] font-medium uppercase tracking-wider"
  class:bg-rytm-accent={active}
  class:border-rytm-accent={active}
  class:text-white={active}
  class:bg-rytm-surface={!active}
  class:border-rytm-border={!active}
  class:text-rytm-text-primary={!active}
>
  {label}
</button>