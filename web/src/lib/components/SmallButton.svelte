<script lang="ts">
  export let label: string;
  export let bgColor: string = 'bg-rytm-surface';
  export let textColor: string = 'text-rytm-text-primary';
  export let active: boolean = false;
</script>

<button 
class="px-2 py-1 h-7 {active ? 'bg-rytm-accent/80 text-black' : bgColor} hover:brightness-110 border {active ? 'border-rytm-accent' : 'border-rytm-border'} rounded {active ? '' : textColor} text-[0.6rem] font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97]"
  on:click
>
  {label}
</button>
