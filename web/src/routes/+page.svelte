<script lang="ts">
  // Import all necessary components from your lib folder
  import Knob from '$lib/components/Knob.svelte';
  import Pad from '$lib/components/Pad.svelte';
  import TrigButton from '$lib/components/TrigButton.svelte';
  import TransportButton from '$lib/components/TransportButton.svelte';
  import DisplayArea from '$lib/components/DisplayArea.svelte';
  import MenuButton from '$lib/components/MenuButton.svelte';
  import ParamPageButton from '$lib/components/ParamPageButton.svelte';
  import NavButton from '$lib/components/NavButton.svelte';
  import ActionButton from '$lib/components/ActionButton.svelte';
  import SmallButton from '$lib/components/SmallButton.svelte';

  // --- Placeholder Data & Reactive State (TODO: Move to Stores) ---
  const padsData = [ /* ... Pad Daten wie zuvor ... */ ];
  const trigLabels = ["BD","SD","RS","CP","BT","LT","MT","HT","CH","OH","CY","CB","","","",""];

  const menuButtonsTopRowData = [ /* ... wie zuvor ... */ ];
  const menuButtonsBottomRowData = [ /* ... wie zuvor ... */ ];
  const paramPageButtonsData = [ /* ... wie zuvor ... */ ];
  const patternPlayModeButtonsData = [ /* ... wie zuvor ... */ ];
  const trigMuteAccentButtonsData = [ /* ... wie zuvor ... */ ];
  const copyPasteButtonsData = [ /* ... wie zuvor ... */ ];
  const songChainButtonsData = [ /* ... wie zuvor ... */ ];
  const bottomButtonsData = [ /* ... wie zuvor ... */ ];

  const navIconsData = { /* ... wie zuvor ... */ };
  const transportIconsData = { /* ... wie zuvor ... */ };

  // Beispiel reaktive Zustände (Später durch Stores ersetzen!)
  let selectedPadNr: number = 1;
  let activeSteps: number[] = [0, 4, 8, 12];
  let trigStates: boolean[] = Array(16).fill(false).map((_, i) => i % 4 === 0);
  let currentParamPage: string = 'FLTR';
  let isPlaying: boolean = true;
  let masterVolume: number = 110;
  let quickPerfAmount: number = 0;
  let knobValues: number[] = Array(8).fill(0).map(() => Math.random() * 127 | 0);

  // Später: Importiere und initialisiere deine Svelte Stores und Services (AudioEngine, MIDIService)
  // import { audioService } from '$lib/services/AudioEngineService';
  // import { transportStore } from '$lib/stores/transport';
  // import { onMount } from 'svelte';
  // onMount(() => {
  //   audioService.initialize();
  // });

</script>

<svelte:head>
  <title>ARythm-EMU 2050</title>
</svelte:head>

<!-- ================================================================ -->
<!-- === HIER KOMMT DAS GESAMTE GRID-LAYOUT FÜR DIE INTERFACE HIN === -->
<!-- === Kopiere den Inhalt von <div class="interface-layout">...</div> -->
<!-- === aus dem vorherigen Beispiel hierher.                      === -->
<!-- ================================================================ -->
<div class="interface-layout">

  <!-- Area: Top Left (Master Vol, QPerf, Func/Trk) -->
  <div class="area-top-left">
    <Knob label="MASTER VOL" bind:value={masterVolume} min={0} max={127} />
    <div class="qperf-stack">
        <SmallButton label="QPER" />
        <Knob label="" bind:value={quickPerfAmount} min={0} max={127} size="sm"/>
    </div>
    <div class="func-stack">
        <SmallButton label="FUNC" bgColor="bg-zinc-600" textColor="text-white"/>
        <SmallButton label="TRK" />
    </div>
    <div class="save-stack">
        <SmallButton label="Save Project" />
        <SmallButton label="Save Kit" />
    </div>
     <div class="misc-stack">
        <SmallButton label="RTRG" />
        <SmallButton label="Metronome" />
    </div>
    <SmallButton label="Direct" />
  </div>

  <!-- Area: Top Center/Right (Modes & Transport) -->
  <div class="area-top-right">
    <div class="mode-buttons-container">
        <div class="button-group">
          {#each menuButtonsTopRowData as btn}
              <MenuButton label={btn.label} secondaryLabel={btn.secondaryLabel} />
          {/each}
        </div>
        <div class="button-group">
          {#each menuButtonsBottomRowData as btn}
              <MenuButton label={btn.label} secondaryLabel={btn.secondaryLabel} />
          {/each}
        </div>
    </div>
    <div class="transport-controls">
        <TransportButton label="Record" icon={transportIconsData.rec} bgColor="bg-red-600/80 hover:bg-red-600" />
        <TransportButton label="Stop" icon={transportIconsData.stop} />
        <TransportButton label="Play" icon={transportIconsData.play} bind:active={isPlaying} />
    </div>
  </div>

  <!-- Area: Pads -->
  <div class="area-pads">
    <div class="pad-grid">
      {#each padsData as pad (pad.nr)}
        <Pad
          label={pad.label}
          trackColorClass={pad.colorClass}
          selected={pad.nr === selectedPadNr}
          active={(pad.nr === 2 || pad.nr === 6)} <!-- Example -->
          on:padclick={() => selectedPadNr = pad.nr}
        />
      {/each}
    </div>
  </div>

  <!-- Area: Display & Controls -->
  <div class="area-display-controls">
    <div class="display-nav-group">
        <DisplayArea title={`PARAMS: ${currentParamPage}`}>
            <p class="text-xs text-rytm-text-secondary mt-4">Screen Content Area</p>
            <p class="text-xs text-rytm-text-secondary mt-1">Pad {selectedPadNr} selected</p>
        </DisplayArea>
        <div class="nav-controls">
            <div class="col-start-2"><NavButton icon={navIconsData.up} /></div>
            <div><NavButton icon={navIconsData.left} /></div>
            <div><NavButton label="NO" /></div>
            <div><NavButton icon={navIconsData.right} /></div>
            <div class="col-start-2"><NavButton label="YES" /></div>
            <div class="col-start-2"><NavButton icon={navIconsData.down} /></div>
        </div>
    </div>
    <div class="knobs-params-group">
        <div class="knob-grid">
            {#each {length: 8} as _, i}
                <Knob label={`${String.fromCharCode(65 + i)}`} bind:value={knobValues[i]} />
            {/each}
        </div>
        <div class="button-group param-pages">
            {#each paramPageButtonsData as btn}
                <ParamPageButton
                    label={btn.label}
                    secondaryLabel={btn.secondaryLabel}
                    active={btn.id === currentParamPage}
                    on:click={() => currentParamPage = btn.id}
                />
            {/each}
        </div>
    </div>
  </div>

  <!-- Area: Bottom Left Controls -->
  <div class="area-bottom-left">
       <div class="button-group">
          {#each patternPlayModeButtonsData as btn}
               <ActionButton label={btn.label} />
          {/each}
       </div>
        <div class="button-group">
          {#each trigMuteAccentButtonsData as btn}
               <ActionButton label={btn.label} />
          {/each}
       </div>
  </div>

  <!-- Area: Sequencer & Bottom Right Controls Combined -->
  <div class="area-sequencer-bottom-right">
      <!-- Sequencer Buttons -->
      <div class="area-sequencer">
          <div class="sequencer-grid">
            {#each { length: 16 } as _, i}
              <TrigButton
                bind:isOn={trigStates[i]}
                isActiveStep={activeSteps.includes(i)}
                hasPLock={i === 2 || i === 10} <!-- Example -->
                label={trigLabels[i]}
              />
            {/each}
          </div>
      </div>
       <!-- Right Side Bottom Buttons -->
       <div class="area-bottom-right">
           <div class="button-group">
             {#each copyPasteButtonsData as btn}
                 <ActionButton label={btn.label} />
             {/each}
           </div>
           <div class="button-group">
             {#each songChainButtonsData as btn}
                 <ActionButton label={btn.label} />
             {/each}
             <ActionButton label="FX/MIDI" />
           </div>
           <div class="sequencer-page-controls">
              <div class="led-indicators">
                  <div class="led-page active"></div> <div class="led-page"></div> <div class="led-page"></div> <div class="led-page"></div>
              </div>
              {#each bottomButtonsData as btn}
                  <MenuButton label={btn.label} secondaryLabel={btn.secondaryLabel} />
              {/each}
           </div>
       </div>
  </div>

</div>

<!-- Stelle sicher, dass der Style-Block aus dem vorherigen Beispiel auch hier vorhanden ist -->
<style>
/* Kopiere den gesamten <style>-Block aus dem vorherigen Svelte-Beispiel hierher */
.interface-layout {
  display: grid;
  height: 100vh; /* Nimmt die volle Höhe ein */
  max-height: 100vh; /* Verhindert übermäßiges Wachstum */
  padding: clamp(0.5rem, 1.5vmin, 1rem); /* Responsives Padding */
  gap: clamp(0.5rem, 1.5vmin, 1rem) clamp(0.75rem, 2.5vmin, 1.5rem); /* Responsive Gaps */
  grid-template-columns: minmax(auto, 40%) 1fr; /* Linke Spalte flexibel, aber max 40%, rechte füllt */
  grid-template-rows: auto 1fr auto; /* Top, Middle (stretch), Bottom */
  grid-template-areas:
    "top-left         top-right"
    "pads             display-controls"
    "bottom-left      sequencer-bottom-right";
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: sans-serif;
  overflow: hidden; /* Wichtig: Verhindert Scrollen der Hauptseite */
}

/* --- Area Styling & Alignment --- */
.area-top-left { grid-area: top-left; display: flex; align-items: flex-end; gap: clamp(0.5rem, 2vmin, 1rem); padding-bottom: 0.25rem; }
.area-top-right { grid-area: top-right; display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; padding-bottom: 0.25rem; }
.area-pads { grid-area: pads; display: flex; justify-content: center; align-items: center; min-height: 0; padding: clamp(0.5rem, 2vmin, 1rem); }
.area-display-controls { grid-area: display-controls; display: flex; flex-direction: column; gap: clamp(0.75rem, 2vmin, 1.5rem); min-height: 0; padding-top: clamp(0.5rem, 2vmin, 1rem); }
.area-bottom-left { grid-area: bottom-left; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; gap: 0.5rem; padding-bottom: 0.25rem; }
.area-sequencer-bottom-right { grid-area: sequencer-bottom-right; display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: flex-end; padding-top: 0.5rem; }
.area-sequencer { grid-column: 1 / 2; overflow-x: auto; /* Falls Sequencer breiter als Platz */ }
.area-bottom-right { grid-column: 2 / 3; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 0.5rem; padding-bottom: 0.25rem;}

.qperf-stack, .func-stack, .save-stack, .misc-stack { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.mode-buttons-container { display: flex; flex-direction: column; align-items: flex-start; gap: 0.375rem; }
.transport-controls { display: flex; gap: 0.5rem; }
.pad-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(0.5rem, 2vmin, 0.75rem); width: 100%; max-width: 360px; /* Angepasste max. Breite */ }
.display-nav-group { display: flex; align-items: center; justify-content: center; gap: clamp(1rem, 4vmin, 2rem); margin-bottom: auto; /* Drückt nach oben */ }
.nav-controls { display: grid; grid-template-columns: repeat(3, auto); grid-template-rows: repeat(4, auto); gap: 0.375rem; justify-items: center; }
.knobs-params-group { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: auto; /* Drückt nach unten */ }
.knob-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem 0.5rem; }
.param-pages { display: flex; gap: 0.375rem; flex-wrap: wrap; justify-content: center; }
.sequencer-grid { display: grid; grid-template-columns: repeat(16, minmax(var(--trig-min-width, 30px), 1fr)); gap: 0.25rem; padding-bottom: 0.25rem; /* Platz für Labels */ }
.sequencer-page-controls { display: flex; align-items: center; gap: 0.5rem; }
.led-indicators { display: flex; gap: 3px; align-items: center; }
.led-page { width: 6px; height: 6px; border-radius: 50%; background-color: var(--border-color); transition: background-color 0.2s; }
.led-page.active { background-color: var(--accent); }

:root { --trig-min-width: 28px; } /* Minimale Breite für Trig Buttons */

:global(.knob-container label) { font-size: 0.6rem; }
:global(.knob-container output) { font-size: 0.55rem; }
:global(.pad) { font-size: 0.6rem; }
:global(.trig-button .trig-label) { font-size: 0.45rem; }
:global(.menu-button .lbl-main) { font-size: 0.55rem;}
:global(.menu-button .lbl-sub) { font-size: 0.45rem;}
:global(.param-page-button .lbl-main) { font-size: 0.5rem;}
:global(.param-page-button .lbl-sub) { font-size: 0.4rem;}
:global(.nav-button) { width: 2rem; height: 1.75rem; font-size: 0.65rem;}
:global(.nav-button svg) { width: 12px; height: 12px; }
:global(.transport-button) { width: 2.25rem; height: 2.25rem;}
:global(.transport-button svg) { width: 16px; height: 16px;}
:global(.action-button) { height: 2rem; font-size: 0.65rem;}
:global(.small-button) { height: 1.5rem; font-size: 0.55rem;}

@media (max-width: 1024px) {
  .interface-layout {
    grid-template-columns: 1fr; /* Single column on smaller screens */
    grid-template-rows: auto auto 1fr auto auto; /* Adjust rows */
    grid-template-areas:
      "top-left"
      "top-right"
      "display-controls" /* Display/knobs might come before pads */
      "pads"
      "sequencer-bottom-right"; /* Combined bottom area */
    height: auto; /* Allow content height */
    overflow-y: auto; /* Allow scrolling if needed */
  }
  .area-bottom-left { display: none; } /* Hide less critical buttons maybe */
  .area-sequencer-bottom-right { grid-template-columns: 1fr; gap: 0.5rem; } /* Stack sequencer and buttons */
  .area-bottom-right { align-items: center; }
  .pad-grid { max-width: none; }
  .knob-grid { grid-template-columns: repeat(4, 1fr); } /* Ensure knobs stay in 4 columns */
  .display-nav-group { flex-direction: column; gap: 0.5rem; }
}

</style>
