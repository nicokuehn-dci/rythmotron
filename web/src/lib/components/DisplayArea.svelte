<script lang="ts">
import { getSystemStats } from '$lib/utils/system-info';
  
  export let title: string = 'MAIN DISPLAY';
export let mode: 'default' | 'system-info' | 'params' = 'default';
  
  // Systeminformationen abrufen
  const systemInfo = getSystemStats();
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
         <div class="text-rytm-text-primary">{systemInfo.platform} ({systemInfo.osArch})</div>
         
         <div class="text-rytm-text-secondary">CPU:</div>
         <div class="text-rytm-text-primary">{systemInfo.cpuModel}</div>
         
         <div class="text-rytm-text-secondary">Cores:</div>
         <div class="text-rytm-text-primary">{systemInfo.cpuCores}</div>
         
         <div class="text-rytm-text-secondary">Memory:</div>
         <div class="text-rytm-text-primary">
           {systemInfo.freeMemoryGB} GB free / {systemInfo.totalMemoryGB} GB total
         </div>
         
         <div class="text-rytm-text-secondary">Audio Buffer:</div>
         <div class="text-rytm-text-primary">{getBufferSize()}ms</div>
       </div>
       
       <div class="mt-4 p-1 border-t border-rytm-border">
         <div class="text-rytm-accent text-[0.65rem] uppercase">Performance Status: {getPerformanceStatus()}</div>
       </div>
     </div>
   {:else if mode === 'params'}
     <slot />
   {/if}
</div>

<script context="module" lang="ts">
  // Hilfsfunktionen für die Anzeige
  function getBufferSize() {
    // In einer echten Anwendung würde dies aus dem Audio-Kontext abgerufen
    return 256;
  }
  
  function getPerformanceStatus() {
    const systemInfo = getSystemStats();
    const memUsage = parseFloat(systemInfo.memoryUsagePercent);
    
    if (memUsage > 85) {
      return 'CRITICAL';
    } else if (memUsage > 70) {
      return 'WARNING';
    } else {
      return 'OPTIMAL';
    }
  }
</script>