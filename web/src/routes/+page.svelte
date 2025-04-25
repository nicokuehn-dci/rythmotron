<script lang="ts">
  // Import all components
  import SectionBox from '$lib/components/SectionBox.svelte';
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
  import { getRecommendedAudioSettings } from '$lib/utils/system-info';

  // Import sound engine
  import soundEngine from '$lib/utils/sound-engine';

  // --- State Management ---
  import { writable, derived } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  
  // --- Placeholder Data & State ---
  const pads = [
    { label: 'CH', nr: 9, color: 'text-indigo-400'}, { label: 'OH', nr: 10, color: 'text-purple-500'}, { label: 'CY', nr: 11, color: 'text-fuchsia-500'}, { label: 'CB', nr: 12, color: 'text-pink-500'},
    { label: 'BT', nr: 5, color: 'text-teal-400'}, { label: 'LT', nr: 6, color: 'text-cyan-400'}, { label: 'MT', nr: 7, color: 'text-sky-500'}, { label: 'HT', nr: 8, color: 'text-blue-500'},
    { label: 'BD', nr: 1, color: 'text-orange-500'}, { label: 'SD', nr: 2, color: 'text-yellow-400'}, { label: 'RS', nr: 3, color: 'text-lime-400'}, { label: 'CP', nr: 4, color: 'text-green-500'},
  ];
   
  const menuButtons = [
    {label: 'PLAY', secondaryLabel: 'Kit'}, {label: 'MUTE', secondaryLabel: 'Sound'}, {label: 'CHRO', secondaryLabel: 'Track'},
    {label: 'SCNE', secondaryLabel: 'Pattern'}, {label: 'PERF', secondaryLabel: 'Song'}, {label: 'FX', secondaryLabel: 'Setup'}, {label: 'TAP', secondaryLabel: 'Tempo'}
  ];

  const paramPageButtons = [
    {label: 'TRIG', secondaryLabel: 'Quantize'}, {label: 'SRC', secondaryLabel: 'Delay'}, {label: 'SMPL', secondaryLabel: 'Reverb'},
    {label: 'FLTR', secondaryLabel: 'Dist'}, {label: 'AMP', secondaryLabel: 'Comp'}, {label: 'LFO', secondaryLabel: 'LFO'}
  ];

  const navIcons = {
    up: `<path d="M12 19V5M5 12l7-7 7 7"/>`,
    down: `<path d="M12 5v14M19 12l-7 7-7-7"/>`,
    left: `<path d="M19 12H5M12 19l-7-7 7-7"/>`,
    right: `<path d="M5 12h14M12 5l7 7-7 7"/>`
  }

   const transportIcons = {
    rec: `<circle cx="12" cy="12" r="10"></circle>`,
    stop: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>`,
    play: `<polygon points="5 3 19 12 5 21 5 3"></polygon>`
  }

  // Tracks data
  const tracks = [
    { name: 'BD', color: 'text-orange-500', pattern: Array(16).fill(false).map((_, i) => i % 4 === 0) },
    { name: 'SD', color: 'text-yellow-400', pattern: Array(16).fill(false).map((_, i) => i % 4 === 2) },
    { name: 'RS', color: 'text-lime-400', pattern: Array(16).fill(false).map((_, i) => i % 8 === 3) },
    { name: 'CP', color: 'text-green-500', pattern: Array(16).fill(false).map((_, i) => i % 8 === 7) },
    { name: 'BT', color: 'text-teal-400', pattern: Array(16).fill(false) },
    { name: 'LT', color: 'text-cyan-400', pattern: Array(16).fill(false) },
    { name: 'MT', color: 'text-sky-500', pattern: Array(16).fill(false).map((_, i) => i % 16 === 10) },
    { name: 'HT', color: 'text-blue-500', pattern: Array(16).fill(false) },
    { name: 'CH', color: 'text-indigo-400', pattern: Array(16).fill(false).map((_, i) => i % 2 === 1) },
    { name: 'OH', color: 'text-purple-500', pattern: Array(16).fill(false).map((_, i) => i % 4 === 0) },
    { name: 'CY', color: 'text-fuchsia-500', pattern: Array(16).fill(false) },
    { name: 'CB', color: 'text-pink-500', pattern: Array(16).fill(false) },
  ];

  // Preset patterns to cycle through
  const presetPatterns = [
    {name: 'Basic Beat', bpm: 120},
    {name: 'Techno Groove', bpm: 130},
    {name: 'Minimal House', bpm: 126},
    {name: 'Hip-Hop', bpm: 95},
    {name: 'Drum & Bass', bpm: 174},
    {name: 'Breakbeat', bpm: 140},
    {name: 'Synthwave', bpm: 110},
    {name: 'Trap', bpm: 75}
  ];

  // State Stores
  const isPlaying = writable(false);
  const isRecording = writable(false);
  const tempo = writable(120);
  const swing = writable(50);
  const selectedPattern = writable(0);
  const masterVolume = writable(100);
  const selectedPad = writable(1);
  const currentParamPage = writable('FLTR');
  const currentMenuPage = writable('PLAY');
  const trigStates = writable(Array(16).fill(false).map((_, i) => i % 4 === 0));
  const trackMutes = writable(Array(12).fill(false));
  const trackSolos = writable(Array(12).fill(false));
  const currentStep = writable(0);
  
  // Filter & Effects Parameters
  const filterCutoff = writable(64);
  const filterResonance = writable(32);
  const attack = writable(0);
  const decay = writable(64);
  const sustain = writable(0);
  const release = writable(20);
  const delay = writable(25); 
  const reverb = writable(15);
  const lfoRate = writable(50);
  const lfoDepth = writable(25);

  // Display modes
  const displayModes = ['default', 'pattern', 'track', 'kit', 'system-info', 'fx', 'params'] as const; 
  let displayMode: typeof displayModes[number] = 'default';
  
  // Audio settings based on system specs
  const audioSettings = getRecommendedAudioSettings();

  // Active steps (current playhead position)
  let activeSteps = [0, 4, 8, 12];

  // Generate PLock indicators for some steps
  let pLockedSteps = [2, 7, 10, 14];
  
  // Step sequencer interval reference
  let stepInterval: ReturnType<typeof setInterval> | null = null;
  
  // Tone.js sequence object
  let sequencer: any = null;
  
  // Calculate step duration in milliseconds based on current tempo
  function calculateStepDuration(tempo: number): number {
    // 60 seconds / tempo = duration of quarter note in seconds
    // Multiply by 1000 to get milliseconds
    // Divide by 4 to get sixteenth note (typical step sequencer resolution)
    return 60000 / tempo / 4;
  }
  
  // Initialize the audio system
  onMount(async () => {
    try {
      // Initialize the sound engine on first user interaction
      document.body.addEventListener('click', initAudio, { once: true });
      document.body.addEventListener('keydown', initAudio, { once: true });
      
      // Display welcome message
      displayMode = 'default';
    } catch (err) {
      console.error('Error initializing audio:', err);
    }
  });
  
  // Initialize audio on first interaction (to comply with browser autoplay policies)
  async function initAudio() {
    try {
      await soundEngine.initialize();
      
      // Create and configure the sequencer
      const trackPatterns = Object.fromEntries(
        tracks.map(track => [track.name, track.pattern])
      );
      
      sequencer = soundEngine.createStepSequencer(trackPatterns);
      soundEngine.setTempo($tempo);
      sequencer.start(0);
      
      // Set initial effects values
      soundEngine.setParam('FLTR', 'CUTOFF', $filterCutoff);
      soundEngine.setParam('FLTR', 'RESONANCE', $filterResonance);
      soundEngine.setParam('REVERB', 'MIX', $reverb / 127);
      soundEngine.setParam('DELAY', 'MIX', $delay / 127);
      
      console.log('Audio initialized successfully');
      displayMode = 'system-info';
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  }
  
  // Toggle play/pause
  function togglePlay() {
    $isPlaying = !$isPlaying;

    if ($isPlaying) {
      // Start Tone.js transport
      soundEngine.start();
      
      // Update UI step counter
      if (stepInterval) clearInterval(stepInterval);
      
      stepInterval = setInterval(() => {
        $currentStep = ($currentStep + 1) % 16;
      }, calculateStepDuration($tempo));
    } else {
      // Stop the sequencer
      soundEngine.stop();
      
      // Stop the UI interval
      if (stepInterval) {
        clearInterval(stepInterval);
        stepInterval = null;
      }
    }
  }
  
  // Update tempo
  $: {
    soundEngine.setTempo($tempo);
  }
  
  // Update volume
  $: {
    soundEngine.setMasterVolume($masterVolume);
  }
  
  // Update swing
  $: {
    soundEngine.setSwing($swing);
  }
  
  // Update filter parameters when knobs change
  $: {
    if ($currentParamPage === 'FLTR') {
      soundEngine.setParam('FLTR', 'CUTOFF', $filterCutoff);
      soundEngine.setParam('FLTR', 'RESONANCE', $filterResonance);
    }
  }
  
  // Update envelope parameters
  $: {
    if ($currentParamPage === 'AMP') {
      // Update ADSR parameters
      // Note: in a real implementation, we'd apply these to the currently selected track
    }
  }
  
  // Update effects parameters
  $: {
    if ($currentParamPage === 'SRC') {
      soundEngine.setParam('DELAY', 'MIX', $delay / 127);
    } else if ($currentParamPage === 'SMPL') {
      soundEngine.setParam('REVERB', 'MIX', $reverb / 127);
    }
  }
  
  function toggleRecord() {
    $isRecording = !$isRecording;
  }

  // Handle pad press to trigger sound
  function handlePadPress(padLabel: string, velocity: number = 1) {
    soundEngine.playPad(padLabel, velocity);
    $selectedPad = pads.find(p => p.label === padLabel)?.nr || 1;
    
    // Update display to show the selected sound
    displayMode = 'track';
  }
  
  // Toggle a step in the sequencer
  function toggleStep(trackIndex: number, stepIndex: number) {
    // Update pattern in our state
    tracks[trackIndex].pattern[stepIndex] = !tracks[trackIndex].pattern[stepIndex];
    
    // Update the sequencer's pattern
    const trackPatterns = Object.fromEntries(
      tracks.map(track => [track.name, track.pattern])
    );
    
    // If we had a more complex implementation, we would update the sequencer here
    // For now, we'll console log the change
    console.log(`Updated ${tracks[trackIndex].name} step ${stepIndex + 1} to ${tracks[trackIndex].pattern[stepIndex]}`);
  }
  
  // Clean up interval on component unmount
  onDestroy(() => {
    if (stepInterval) clearInterval(stepInterval);
    
    // Stop any transport if playing
    if ($isPlaying) {
      soundEngine.stop();
    }
  });
</script>

<svelte:head>
  <title>ARythm-EMU 2050 MKII Interface</title>
</svelte:head>

<div class="flex flex-col h-screen bg-rytm-base text-rytm-text-primary p-4 gap-4 overflow-hidden">

  <!-- === TOP ROW === -->
  <div class="flex-none grid grid-cols-[auto_1fr_auto] gap-4 items-center">
    <!-- Top Left Area -->
    <div class="flex items-center gap-4">
       <Knob label="MASTER VOL" value={$masterVolume} min={0} max={127} />
       <!-- Function buttons -->
       <div class="flex flex-col gap-1">
          <SmallButton label="FUNC" />
          <SmallButton label="TRK" />
       </div>
    </div>

    <!-- Top Center: Mode/Menu Buttons -->
    <div class="flex justify-center gap-1.5">
      {#each menuButtons as btn}
         <MenuButton 
label={btn.label} 
secondaryLabel={btn.secondaryLabel} 
           active={$currentMenuPage === btn.label}
           on:click={() => changeMenuPage(btn.label)}
/>
      {/each}
    </div>

    <!-- Top Right Area -->
    <div class="flex items-center gap-4">
       <Knob label="QUICK PERF" value={$swing} min={0} max={127} />
       <div class="flex gap-2">
         <TransportButton 
label="Record" 
icon={transportIcons.rec} 
bgColor="bg-red-600/80 hover:bg-red-600" 
           active={$isRecording}
           on:click={toggleRecord}
/>
         <TransportButton 
label="Stop" 
icon={transportIcons.stop} 
           on:click={() => { $isPlaying = false; soundEngine.stop(); }}
/>
         <TransportButton 
label="Play" 
icon={transportIcons.play} 
active={$isPlaying} 
           on:click={togglePlay}
/>
       </div>
    </div>
  </div>

  <!-- === MIDDLE ROW === -->
  <div class="flex-grow grid grid-cols-[1fr_auto_1fr] gap-4 min-h-0">

    <!-- Left Side: Pads -->
    <div class="flex flex-col gap-4">
        <SectionBox title="Pads">
          <div class="grid grid-cols-4 gap-2">
            {#each pads as pad (pad.nr)}
              <Pad
                label={pad.label}
                trackColor={pad.color}
                selected={pad.nr === $selectedPad}
                active={(pad.nr === $selectedPad && $isPlaying) || (tracks[pad.nr - 1]?.pattern[$currentStep])}
                on:padclick={() => handlePadPress(pad.label)}
              />
            {/each}
          </div>
        </SectionBox>
        <!-- Track Status & Functions -->
        <SectionBox title="Track Controls">
          <div class="flex flex-col gap-2">
            <div class="grid grid-cols-2 gap-2">
              <div class="text-xs flex items-center gap-1">
                <span class="font-semibold">TRACK:</span> 
                <span class="text-rytm-text-accent">{tracks[$selectedPad - 1]?.name || 'BD'}</span>
              </div>
              <div class="text-xs flex items-center gap-1">
                <span class="font-semibold">BPM:</span> 
                <span class="text-rytm-text-accent">{$tempo}</span>
              </div>
            </div>
        <div class="flex items-center gap-2 flex-wrap">
             <SmallButton label="Save Project" />
             <SmallButton label="Save Kit" />
             <SmallButton label="RTRG" active={false} />
             <SmallButton label="Metronome" active={false} />
            </div>
        </div>
</SectionBox>
    </div>

    <!-- Center: Display & Nav -->
     <div class="flex flex-col items-center justify-center gap-2">
        <DisplayArea 
title={displayMode === 'system-info' ? 'SYSTEM STATUS' : "ANALOG RYTM MKII EMU"}
          mode={displayMode}
>
           <!-- Display content varies based on mode -->
{#if displayMode === 'default'}
           <div class="text-xs text-rytm-text-secondary mt-2 flex flex-col gap-1">
               <h3 class="text-sm text-center text-rytm-text-accent">PATTERN {$selectedPattern + 1}: {presetPatterns[$selectedPattern].name}</h3>
               <div class="flex justify-between">
                 <span>BPM: {$tempo}</span>
                 <span>SWING: {$swing}%</span>
               </div>
               <div class="flex justify-between">
                 <span>KIT: ARythm Standard</span>
                 <span>STEP: {$currentStep + 1}/16</span>
               </div>
               <div class="flex justify-between">
                 <span>SCALE: Chromatic</span>
                 <span>{$isPlaying ? 'PLAYING' : 'STOPPED'}</span>
               </div>
             </div>
           {:else if displayMode === 'system-info'}
             <div class="text-xs text-rytm-text-secondary mt-2 flex flex-col gap-1">
               <div class="flex justify-between">
                 <span>AUDIO BUFFER:</span>
                 <span>{audioSettings.bufferSize} samples</span>
               </div>
               <div class="flex justify-between">
                 <span>SAMPLE RATE:</span>
                 <span>{audioSettings.sampleRate} Hz</span>
               </div>
               <div class="flex justify-between">
                 <span>LATENCY:</span>
                 <span>{audioSettings.latency} ms</span>
               </div>
               <div class="flex justify-between">
                 <span>POLYPHONY:</span>
                 <span>12 voices</span>
               </div>
               <div class="flex justify-between">
                 <span>CPU LOAD:</span>
                 <span class="text-green-400">24%</span>
               </div>
             </div>
           {:else if displayMode === 'params'}
             <div class="text-xs text-rytm-text-secondary mt-2 flex flex-col gap-1">
               <h3 class="text-sm text-center text-rytm-text-accent">{$currentParamPage} PARAMETERS</h3>
                {#if $currentParamPage === 'FLTR'}
                  <div class="flex justify-between">
                    <span>CUTOFF:</span>
                    <span>{$filterCutoff}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>RESONANCE:</span>
                    <span>{$filterResonance}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>TYPE:</span>
                    <span>LP 24dB</span>
                  </div>
                {:else if $currentParamPage === 'AMP'}
                  <div class="flex justify-between">
                    <span>ATTACK:</span>
                    <span>{$attack}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>DECAY:</span>
                    <span>{$decay}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>SUSTAIN:</span>
                    <span>{$sustain}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>RELEASE:</span>
                    <span>{$release}</span>
                  </div>
                {:else}
                  <div class="flex justify-between">
                    <span>LOADING PARAMETERS...</span>
                  </div>
                {/if}
             </div>
           {:else if displayMode === 'pattern'}
             <div class="text-xs text-rytm-text-secondary mt-2 flex flex-col gap-1">
               <h3 class="text-sm text-center text-rytm-text-accent">PATTERN BROWSER</h3>
               {#each presetPatterns as pattern, i}
                 <div class="flex justify-between {$selectedPattern === i ? 'text-rytm-text-accent' : ''}">
                   <span>{i + 1}: {pattern.name}</span>
                   <span>{pattern.bpm} BPM</span>
                 </div>
               {/each}
             </div>
{/if}
        </DisplayArea>
        <div class="grid grid-cols-3 gap-1.5 w-full max-w-[150px]">
           <div class="col-start-2"><NavButton icon={navIcons.up} /></div>
           <div><NavButton icon={navIcons.left} /></div>
           <div>
             <NavButton label="NO" on:click={toggleSystemInfo} />
</div>
           <div><NavButton icon={navIcons.right} /></div>
           <div class="col-start-2"><NavButton label="YES" /></div>
           <div class="col-start-2"><NavButton icon={navIcons.down} /></div>
        </div>
     </div>

    <!-- Right Side: Knobs & Param Buttons -->
    <div class="flex flex-col gap-4 items-center">
       <SectionBox title="Parameters">
         <div class="grid grid-cols-4 gap-x-2 gap-y-3">
<!-- Different param knobs based on the current param page -->
           {#if $currentParamPage === 'FLTR'}
             <Knob label="CUTOFF" value={$filterCutoff} on:change={e => $filterCutoff = e.detail.value} />
             <Knob label="RESONANCE" value={$filterResonance} on:change={e => $filterResonance = e.detail.value} />
             <Knob label="ENV AMT" value={50} />
             <Knob label="ENV ATT" value={0} />
             <Knob label="ENV DEC" value={64} />
             <Knob label="ENV REL" value={20} />
             <Knob label="TYPE" value={0} />
             <Knob label="DRIVE" value={0} />
           {:else if $currentParamPage === 'AMP'}
             <Knob label="ATTACK" value={$attack} on:change={e => $attack = e.detail.value} />
             <Knob label="HOLD" value={0} />
             <Knob label="DECAY" value={$decay} on:change={e => $decay = e.detail.value} />
             <Knob label="OVERDRIVE" value={0} />
             <Knob label="SUSTAIN" value={$sustain} on:change={e => $sustain = e.detail.value} />
             <Knob label="RELEASE" value={$release} on:change={e => $release = e.detail.value} />
             <Knob label="VOLUME" value={100} />
             <Knob label="PAN" value={64} />
           {:else if $currentParamPage === 'LFO'}
             <Knob label="SPEED" value={$lfoRate} on:change={e => $lfoRate = e.detail.value} />
             <Knob label="MULT" value={0} />
             <Knob label="FADE" value={0} />
             <Knob label="START" value={0} />
             <Knob label="DEPTH" value={$lfoDepth} on:change={e => $lfoDepth = e.detail.value} />
             <Knob label="DEST 1" value={0} />
             <Knob label="DEST 2" value={0} />
             <Knob label="WAVEFORM" value={0} />
           {:else}
           {#each {length: 8} as _, i}
             <Knob label={`PARAM ${String.fromCharCode(65 + i)}`} value={Math.random() * 127 | 0} />
           {/each}
{/if}
         </div>
       </SectionBox>
       <div class="flex gap-1.5">
          {#each paramPageButtons as btn}
             <ParamPageButton 
label={btn.label} 
secondaryLabel={btn.secondaryLabel} 
active={btn.label === $currentParamPage}
               on:click={() => changeParamPage(btn.label)}
/>
          {/each}
       </div>
       <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-1.5 mt-auto">
            <ActionButton label="Copy" />
            <ActionButton label="Clear" />
            <ActionButton label="Paste" />
            <ActionButton label="FX/MIDI" />
            <ActionButton label="New Chain" />
            <ActionButton label="Edit Song" />
        </div>
    </div>

  </div>

  <!-- === BOTTOM ROW: SEQUENCER === -->
  <div class="flex-none">
      <SectionBox>
        <div class="flex items-center gap-1 md:gap-1.5 overflow-x-auto">
            <div class="grid grid-cols-16 gap-1 flex-none">
              {#each { length: 16 } as _, i}
                <TrigButton
                  step={i + 1}
                  isOn={$trigStates[i]}
                  isActiveStep={$currentStep === i}
                  hasPLock={pLockedSteps.includes(i)}
                  on:click={() => toggleStep($selectedPad - 1, i)}
                />
              {/each}
            </div>
             <!-- Page/Fill Buttons -->
             <div class="flex flex-col gap-1 ml-auto pl-2">
                <SmallButton label="PAGE" />
                <SmallButton label="FILL" />
             </div>
        </div>
     </SectionBox>
  </div>

</div>

<!-- Basic styling -->
<style>
    :global(.grid-cols-16) {
     grid-template-columns: repeat(16, minmax(0, 1fr));
  }
</style>