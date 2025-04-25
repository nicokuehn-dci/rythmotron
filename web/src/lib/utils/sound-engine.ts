import * as Tone from 'tone';
import { writable, get } from 'svelte/store';

// Stores for audio parameters
export const masterVolume = writable(0); // -60 to 0 dB
export const tempo = writable(120);
export const swing = writable(0.5); // 0-1 range for Tone.js

// Effects parameters
export const filterCutoff = writable(20000);
export const filterResonance = writable(1);
export const reverbAmount = writable(0.3);
export const delayAmount = writable(0.2);
export const delayTime = writable(0.25);
export const distortionAmount = writable(0);

// Track specific parameters
export const trackVolumes = writable(Array(12).fill(0)); // -60 to 0 dB
export const trackPans = writable(Array(12).fill(0)); // -1 to 1

// Sequencer state
export const isPlaying = writable(false);
export const currentStep = writable(0);
export const totalSteps = writable(16);
export const patterns = writable(Array(12).fill(null).map(() => Array(16).fill(false)));

// Audio node references
let initialized = false;
let masterGain: Tone.Volume;
let masterLimiter: Tone.Limiter;
let masterCompressor: Tone.Compressor;
let mainReverb: Tone.Reverb;
let mainDelay: Tone.FeedbackDelay;
let mainFilter: Tone.Filter;
let distortion: Tone.Distortion;

// Samplers for each drum sound
const samplers: Record<string, Tone.Sampler> = {};

// Drum sound configs
const drumSounds = [
  { id: 'BD', name: 'Bass Drum', samples: { C2: 'BD.wav' } },
  { id: 'SD', name: 'Snare Drum', samples: { C2: 'SD.wav' } },
  { id: 'RS', name: 'Rim Shot', samples: { C2: 'RS.wav' } },
  { id: 'CP', name: 'Clap', samples: { C2: 'CP.wav' } },
  { id: 'BT', name: 'Bass Tom', samples: { C2: 'BT.wav' } },
  { id: 'LT', name: 'Low Tom', samples: { C2: 'LT.wav' } },
  { id: 'MT', name: 'Mid Tom', samples: { C2: 'MT.wav' } },
  { id: 'HT', name: 'High Tom', samples: { C2: 'HT.wav' } },
  { id: 'CH', name: 'Closed Hat', samples: { C2: 'CH.wav' } },
  { id: 'OH', name: 'Open Hat', samples: { C2: 'OH.wav' } },
  { id: 'CY', name: 'Cymbal', samples: { C2: 'CY.wav' } },
  { id: 'CB', name: 'Cowbell', samples: { C2: 'CB.wav' } },
];

// Fallback synthesizer options if samples don't load
const synthPresets = {
  BD: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.8 } },
  SD: { noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.4 } },
  CH: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 } },
  OH: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 } },
};

// Synthesizers as fallbacks
const synths: Record<string, Tone.Synth | Tone.NoiseSynth> = {};

// Transport and playback
let transportInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize the audio engine
 */
export async function initAudioEngine(): Promise<boolean> {
  // Prevent multiple initializations
  if (initialized) return true;
  
  try {
    // Start audio context
    await Tone.start();
    console.log('Audio context started');
    
    // Create master effects chain
    masterGain = new Tone.Volume(get(masterVolume)).toDestination();
    masterLimiter = new Tone.Limiter(-0.5).connect(masterGain);
    masterCompressor = new Tone.Compressor({
      threshold: -24,
      ratio: 3,
      attack: 0.003,
      release: 0.25
    }).connect(masterLimiter);
    
    // Effects
    mainFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: get(filterCutoff),
      Q: get(filterResonance)
    }).connect(masterCompressor);
    
    distortion = new Tone.Distortion({
      distortion: get(distortionAmount),
      wet: 0.3
    }).connect(mainFilter);
    
    mainDelay = new Tone.FeedbackDelay({
      delayTime: get(delayTime),
      feedback: 0.3,
      wet: get(delayAmount)
    }).connect(distortion);
    
    mainReverb = new Tone.Reverb({
      decay: 2,
      wet: get(reverbAmount)
    }).connect(mainDelay);
    
    // Create base synths as fallback while samples load
    createFallbackSynths();
    
    // Use a local folder or a CDN for drum samples
    const baseUrl = './samples/';
    
    // Create samplers for each drum sound
    for (const drum of drumSounds) {
      try {
        samplers[drum.id] = new Tone.Sampler({
          urls: drum.samples,
          baseUrl: baseUrl + drum.id + '/',
          onload: () => console.log(`${drum.name} samples loaded`),
          onerror: (e) => {
            console.warn(`Error loading ${drum.name} samples:`, e);
            // Will use fallback synth if available
          }
        }).connect(mainReverb);
      } catch (e) {
        console.error(`Failed to create sampler for ${drum.name}:`, e);
      }
    }
    
    // Set up Tone.js transport
    Tone.Transport.bpm.value = get(tempo);
    Tone.Transport.swing = get(swing);
    
    // Subscribe to store changes
    setupStoreSubscriptions();
    
    initialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize audio engine:', error);
    return false;
  }
}

/**
 * Create fallback synthesizers for each drum type
 */
function createFallbackSynths() {
  // Bass Drum
  synths.BD = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 5,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
      attackCurve: 'exponential'
    }
  }).connect(mainReverb);
  
  // Snare
  synths.SD = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    }
  }).connect(mainReverb);
  
  // Closed Hat
  synths.CH = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.03
    }
  }).connect(mainReverb);
  
  // Open Hat
  synths.OH = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.1,
      release: 0.3
    }
  }).connect(mainReverb);
  
  // Other drums will use similar synths as fallbacks
  const defaultSynth = {
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
  };
  
  ['RS', 'CP', 'CY', 'CB'].forEach(id => {
    synths[id] = new Tone.NoiseSynth(defaultSynth).connect(mainReverb);
  });
  
  // Toms
  const tomSynthSettings = {
    pitchDecay: 0.05,
    octaves: 1,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    }
  };
  
  synths.BT = new Tone.MembraneSynth({
    ...tomSynthSettings,
    pitchDecay: 0.1,
    octaves: 2
  }).connect(mainReverb);
  
  synths.LT = new Tone.MembraneSynth(tomSynthSettings).connect(mainReverb);
  synths.MT = new Tone.MembraneSynth(tomSynthSettings).connect(mainReverb);
  synths.HT = new Tone.MembraneSynth(tomSynthSettings).connect(mainReverb);
}

/**
 * Set up subscriptions to Svelte stores to update audio parameters
 */
function setupStoreSubscriptions() {
  // Master volume
  masterVolume.subscribe(value => {
    if (masterGain) {
      masterGain.volume.value = value;
    }
  });
  
  // Tempo
  tempo.subscribe(value => {
    Tone.Transport.bpm.value = value;
  });
  
  // Swing
  swing.subscribe(value => {
    Tone.Transport.swing = value / 100;
  });
  
  // Filter
  filterCutoff.subscribe(value => {
    if (mainFilter) {
      mainFilter.frequency.value = value;
    }
  });
  
  filterResonance.subscribe(value => {
    if (mainFilter) {
      mainFilter.Q.value = value;
    }
  });
  
  // Effects
  reverbAmount.subscribe(value => {
    if (mainReverb) {
      mainReverb.wet.value = value;
    }
  });
  
  delayAmount.subscribe(value => {
    if (mainDelay) {
      mainDelay.wet.value = value;
    }
  });
  
  delayTime.subscribe(value => {
    if (mainDelay) {
      mainDelay.delayTime.value = value;
    }
  });
  
  distortionAmount.subscribe(value => {
    if (distortion) {
      distortion.distortion = value;
    }
  });
  
  // Play state
  isPlaying.subscribe(value => {
    if (value) {
      startSequencer();
    } else {
      stopSequencer();
    }
  });
}

/**
 * Play a drum sound
 * @param drumId The ID of the drum to play (BD, SD, etc.)
 * @param velocity Velocity (0-1)
 */
export function playDrum(drumId: string, velocity = 0.7) {
  if (!initialized) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  // Volume based on velocity
  const volume = Math.max(-30, Math.log10(velocity) * 20);
  
  try {
    // Try to use sampler first
    if (samplers[drumId] && samplers[drumId].loaded) {
      samplers[drumId].triggerAttackRelease('C2', '8n', Tone.now(), velocity);
    } 
    // Fall back to synth if sampler not available
    else if (synths[drumId]) {
      if (drumId === 'BD' || drumId === 'LT' || drumId === 'MT' || drumId === 'HT' || drumId === 'BT') {
        // For membrane synths (drums)
        const pitch = {
          'BD': 'C1',
          'BT': 'G1',
          'LT': 'A1',
          'MT': 'C2',
          'HT': 'E2'
        }[drumId] || 'C2';
        
        (synths[drumId] as Tone.MembraneSynth).triggerAttackRelease(
          pitch, '8n', Tone.now(), velocity
        );
      } else {
        // For noise synths (hats, etc)
        (synths[drumId] as Tone.NoiseSynth).triggerAttackRelease('8n', Tone.now(), velocity);
      }
    } else {
      console.warn(`No sound available for ${drumId}`);
    }
  } catch (e) {
    console.error(`Error playing ${drumId}:`, e);
  }
}

/**
 * Start the sequencer
 */
function startSequencer() {
  if (transportInterval) {
    clearInterval(transportInterval);
  }
  
  const stepDuration = (60 / get(tempo)) / 4 * 1000; // in ms
  
  transportInterval = setInterval(() => {
    const patternData = get(patterns);
    const currentStepValue = get(currentStep);
    
    // Play active steps for current position
    drumSounds.forEach((drum, i) => {
      if (patternData[i] && patternData[i][currentStepValue]) {
        playDrum(drum.id, 0.7);
      }
    });
    
    // Advance step
    currentStep.update(step => (step + 1) % get(totalSteps));
  }, stepDuration);
}

/**
 * Stop the sequencer
 */
function stopSequencer() {
  if (transportInterval) {
    clearInterval(transportInterval);
    transportInterval = null;
  }
  currentStep.set(0);
}

/**
 * Set pattern step state
 */
export function setPatternStep(drumIndex: number, stepIndex: number, active: boolean) {
  patterns.update(p => {
    const newPatterns = [...p];
    if (!newPatterns[drumIndex]) {
      newPatterns[drumIndex] = Array(16).fill(false);
    }
    newPatterns[drumIndex] = [...newPatterns[drumIndex]];
    newPatterns[drumIndex][stepIndex] = active;
    return newPatterns;
  });
}

/**
 * Toggle pattern step
 */
export function togglePatternStep(drumIndex: number, stepIndex: number) {
  patterns.update(p => {
    const newPatterns = [...p];
    if (!newPatterns[drumIndex]) {
      newPatterns[drumIndex] = Array(16).fill(false);
    }
    newPatterns[drumIndex] = [...newPatterns[drumIndex]];
    newPatterns[drumIndex][stepIndex] = !newPatterns[drumIndex][stepIndex];
    return newPatterns;
  });
}

/**
 * Set a predefined pattern
 */
export function setPresetPattern(preset: 'basic' | 'techno' | 'hiphop') {
  const newPattern = Array(12).fill(null).map(() => Array(16).fill(false));
  
  switch (preset) {
    case 'basic':
      // Bass drum on 1, 5, 9, 13
      newPattern[0] = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
      // Snare on 5, 13
      newPattern[1] = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
      // Closed hat on every other step
      newPattern[8] = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
      break;
      
    case 'techno':
      // Bass drum on 1, 5, 9, 13
      newPattern[0] = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
      // Snare/Clap on 5, 13
      newPattern[3] = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
      // Closed hat on every step
      newPattern[8] = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
      // Open hat on offbeats
      newPattern[9] = [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false];
      break;
      
    case 'hiphop':
      // Bass drum on 1, 10
      newPattern[0] = [true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false];
      // Snare on 5, 13
      newPattern[1] = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
      // Closed hat pattern
      newPattern[8] = [true, false, true, false, true, false, true, true, false, false, true, false, true, false, true, false];
      break;
  }
  
  patterns.set(newPattern);
}

/**
 * Connect a new effect to the master chain
 * @param effect The Tone.js effect to add
 */
export function addEffect(effect: Tone.ToneAudioNode) {
  mainReverb.disconnect();
  mainReverb.connect(effect);
  effect.connect(mainDelay);
}

/**
 * Clean up audio resources
 */
export function cleanupAudio() {
  if (transportInterval) {
    clearInterval(transportInterval);
  }
  
  // Dispose of Tone.js nodes
  Object.values(samplers).forEach(sampler => sampler.dispose());
  Object.values(synths).forEach(synth => synth.dispose());
  
  if (mainReverb) mainReverb.dispose();
  if (mainDelay) mainDelay.dispose();
  if (mainFilter) mainFilter.dispose();
  if (distortion) distortion.dispose();
  if (masterCompressor) masterCompressor.dispose();
  if (masterLimiter) masterLimiter.dispose();
  if (masterGain) masterGain.dispose();
  
  initialized = false;
}

// Export the audio parameter converters
export function normalizedToFrequency(normalized: number): number {
  // Convert 0-127 to frequency range (20 Hz - 20,000 Hz)
  return Math.pow(10, normalized / 127 * 3) * 20;
}

export function normalizedToDecibels(normalized: number): number {
  // Convert 0-127 to dB (-60 to 0)
  return (normalized / 127 * 60) - 60;
}

export function normalizedToSeconds(normalized: number): number {
  // Convert 0-127 to seconds (0 to 2 seconds, exponential)
  return Math.pow(normalized / 127, 2) * 2;
}
