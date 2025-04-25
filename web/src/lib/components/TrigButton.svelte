<script lang="ts">
  export let step: number;
  export let isOn: boolean = false;
  export let isActiveStep: boolean = false;
  export let hasPLock: boolean = false;
  export let color: string = 'bg-rytm-accent';
</script>

<button 
  class="w-full aspect-square border rounded flex flex-col items-center justify-center transition-all focus:outline-none focus:ring-1 focus:ring-rytm-accent active:scale-[0.97] relative overflow-hidden"
  class:bg-rytm-surface={!isOn}
  class:border-rytm-border={!isOn}
  class:bg-rytm-accent-surface={isOn}
  class:border-rytm-accent={isOn}
  on:click
>
  <!-- Step number -->
  <span class="text-[0.65rem] font-medium opacity-80" class:text-rytm-accent={isActiveStep && !isOn}>
    {step}
  </span>
  
  <!-- P-lock indicator -->
  {#if hasPLock}
    <div class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
  {/if}
    
  <!-- Active step indicator -->
  {#if isActiveStep}
    <div class="absolute bottom-1 w-2 h-0.5 bg-rytm-accent"></div>
    <div class="absolute inset-0 bg-rytm-accent opacity-20 animate-pulse-fast pointer-events-none"></div>
  {/if}
    
  <!-- Glow effect when on -->
  {#if isOn}
    <div class="absolute inset-0 bg-rytm-accent opacity-20"></div>
  {/if}
</button>

<style>
  @keyframes pulse-fast {
    0%, 100% {
      opacity: 0.05;
    }
    50% {
      opacity: 0.3;
    }
  }
  
  :global(.animate-pulse-fast) {
    animation: pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
