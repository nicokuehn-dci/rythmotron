<script lang="ts">
  export let title: string = 'MAIN DISPLAY';
  export let mode: 'default' | 'system-info' | 'params' = 'default';
</script>

<div class="bg-rytm-panel rounded-lg border border-rytm-border p-4 min-h-[200px] flex flex-col text-center justify-center shadow-inner">
  <h2 class="text-sm font-semibold text-rytm-accent mb-4 uppercase tracking-wider">{title}</h2>

  {#if mode === 'default'}
    <!-- Placeholder Content -->
    <p class="text-rytm-text-secondary text-sm">Parameter values & visualizations will appear here.</p>
    <slot /> <!-- For potential future content injection -->
  {:else if mode === 'system-info'}
    <!-- System Information Display -->
    <div class="text-left text-xs p-2">
      <div class="grid grid-cols-2 gap-2">
        <div class="text-rytm-text-secondary">System:</div>
        <div class="text-rytm-text-primary">Placeholder System Info</div>
        
        <div class="text-rytm-text-secondary">CPU:</div>
        <div class="text-rytm-text-primary">Placeholder CPU Info</div>
        
        <div class="text-rytm-text-secondary">Cores:</div>
        <div class="text-rytm-text-primary">Placeholder Cores Info</div>
        
        <div class="text-rytm-text-secondary">Memory:</div>
        <div class="text-rytm-text-primary">Placeholder Memory Info</div>
        
        <div class="text-rytm-text-secondary">Audio Buffer:</div>
        <div class="text-rytm-text-primary">Placeholder Buffer Size</div>
      </div>
      
      <div class="mt-4 p-1 border-t border-rytm-border">
        <div class="text-rytm-accent text-[0.65rem] uppercase">Performance Status: Placeholder Status</div>
      </div>
    </div>
  {:else if mode === 'params'}
    <slot />
  {/if}
</div>
