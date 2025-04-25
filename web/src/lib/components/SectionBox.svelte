<script lang="ts">
  export let title: string = '';
</script>

<div class="bg-rytm-surface rounded-lg border border-rytm-border p-3 md:p-4 shadow-sm">
  {#if title}
    <h3 class="text-xs font-semibold text-rytm-text-secondary mb-3 uppercase tracking-wider px-1">
      {title}
    </h3>
  {/if}
  <slot />
</div>