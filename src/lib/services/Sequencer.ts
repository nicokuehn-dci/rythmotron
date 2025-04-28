/**
 * Sequencer.ts
 * Handles pattern sequencing and playback for Rythmotron
 */

import audioEngine from './AudioEngine';
import midiService from './MIDIService';
import { EventEmitter } from '../utils/EventEmitter';

export interface SequencerStep {
  active: boolean;
  velocity: number;
  probability?: number;
  pitch?: number;
  decay?: number;
  tone?: number;
  // Parameter für 808/909-style Drumsynth
  attack?: number;     // Stärke des Attack-Transienten/Click
  tuning?: number;     // Grundtonhöhe des Oszillators 
  snappy?: number;     // Für Snare: Verhältnis zwischen Oszillator und Rauschanteil
  color?: number;      // Spektrale Charakteristik (Filter-Cutoff/Resonanz)
  // Added parameters for more expressive sequencing
  accent?: boolean;    // Step accent for dynamic emphasis
  flam?: boolean;      // Add flam (double hit with very short delay)
  roll?: number;       // Number of repeats for roll effect (2, 3, 4 for rolls)
  midiNote?: number;   // Specific MIDI note to trigger (for external devices)
}

export interface SequencerTrack {
  id: number;
  name: string;
  sound: string;
  
  // DrumSynth-spezifische Parameter
  synthType: DrumSynthType;       // Art des Drum-Synthesizers (808, 909, Analog, FM, etc.)
  oscillatorType?: OscillatorType; // Art des Oszillators (für tonal-basierte Drums)
  
  steps: SequencerStep[];
  mute: boolean;
  solo: boolean;
  
  // Added parameters for more control
  volume: number;     // 0-100 track volume
  pan: number;        // -100 to 100 (left to right)
  midiChannel?: number; // MIDI channel for external control (1-16)
  sendFX?: number[];  // Array of send effect levels (0-100)
  filterCutoff?: number; // Filter cutoff frequency (0-100)
  filterResonance?: number; // Filter resonance (0-100)
}

// Mögliche Drum-Synth-Typen basierend auf der drumsynthese.md
export enum DrumSynthType {
  SAMPLE = 'sample',            // Einfache Sample-Wiedergabe
  TR808_KICK = 'tr808_kick',      // 808-Style Kick mit Bridged-T-Oszillator
  TR808_SNARE = 'tr808_snare',    // 808-Style Snare (Oszillator + Rauschen)
  TR808_HAT = 'tr808_hat',        // 808-Style Hi-Hats (6 Rechteck-Oszillatoren)
  TR808_TOM = 'tr808_tom',        // 808-Style Toms
  TR808_CLAP = 'tr808_clap',      // 808-Style Clap (gefiltertes Rauschen mit Multi-Envelope)
  TR909_KICK = 'tr909_kick',      // 909-Style Kick (VCO + Click-Generator)
  TR909_SNARE = 'tr909_snare',    // 909-Style Snare (2 VCOs + Rauschen)
  TR909_TOM = 'tr909_tom',        // 909-Style Toms
  NOISE = 'noise_drum',              // Reiner Rauschgenerator mit Filter
  FM_DRUM = 'fm_drum',          // FM-Synthese (für metallische Percussion)
  ANALOG = 'analog_drum',            // Allgemeiner analoger Drumsynth
}

// Oszillator-Typen für die tonalen Komponenten
export enum OscillatorType {
  SINE = 'sine',
  TRIANGLE = 'triangle',
  SAWTOOTH = 'sawtooth',
  SQUARE = 'square',
  NOISE_WHITE = 'noise_white',
  NOISE_PINK = 'noise_pink',
  PULSE = 'pulse',
  BRIDGED_T = 'bridged_t',      // 808-Style Resonanzfilter-Oszillator
}

// New enum for playback modes
export enum PlayMode {
  LOOP,            // Loop a single pattern
  ONESHOT,         // Play a pattern once and stop
  CHAIN,           // Play a sequence of patterns
}

export type SequencerPattern = {
  id: string;
  name: string;
  tracks: SequencerTrack[];
  stepCount: number;
  swing: number;
  // Additional pattern properties
  tempo?: number;   // Pattern-specific tempo (overrides global)
  shuffle?: number; // Shuffle amount (0-100)
  timeSignature?: { numerator: number, denominator: number }; // e.g., 4/4, 3/4
  scale?: number[]; // Array of MIDI note values for scale quantization
};

export interface SequencerEvents {
  step: (step: number) => void;
  playStateChange: (isPlaying: boolean) => void;
  trackTrigger: (trackId: number, step: number, velocity: number) => void;
  patternChange: (patternId: string) => void;
  tempoChange: (bpm: number) => void;
  midiClock: (pulse: number) => void;
}

class Sequencer extends EventEmitter<SequencerEvents> {
  private patterns = new Map<string, SequencerPattern>();
  private currentPatternId: string = '';
  private currentStep: number = 0;
  private isPlaying = false;
  private tempo = 120;
  private interval: number | null = null;
  private scheduleAheadTime = 0.1; // seconds
  private nextNoteTime = 0;
  
  // Enhanced sequencer properties
  private playMode = PlayMode.LOOP;
  private patternChain: string[] = [];
  private currentChainIndex = 0;
  private isMidiClockEnabled = false;
  private midiClockPulseCount = 0;
  private midiClockResolution = 24; // Pulses per quarter note (PPQN)
  private clockDivider = 4; // How many MIDI clock ticks per step
  private scheduleWorker: Worker | null = null;
  private lookAheadMs = 25; // How often to call scheduling function
  private soloActive = false; // Track if any solo is active
  private lastStepTime = 0; // For timing calculations

  constructor() {
    super();
    this.createPattern('default', 'Default Pattern');
    this.currentPatternId = 'default';
    
    // Initialize Web Worker for precise timing
    this.initSchedulerWorker();
    
    // Set up MIDI event listeners
    this.setupMIDIListeners();
  }

  /**
   * Initialize Web Worker for more accurate timing
   */
  private initSchedulerWorker(): void {
    if (typeof window !== 'undefined' && window.Worker) {
      try {
        // Create a worker from an inline blob for better compatibility
        const workerCode = `
          let timerID = null;
          let interval = 25;
          
          self.onmessage = function(e) {
            if (e.data === 'start') {
              timerID = setInterval(() => {
                self.postMessage('tick');
              }, interval);
            } else if (e.data === 'stop') {
              clearInterval(timerID);
              timerID = null;
            } else if (e.data.interval) {
              interval = e.data.interval;
              if (timerID) {
                clearInterval(timerID);
                timerID = setInterval(() => {
                  self.postMessage('tick');
                }, interval);
              }
            }
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        this.scheduleWorker = new Worker(workerUrl);
        this.scheduleWorker.onmessage = (e) => {
          if (e.data === 'tick') {
            this.scheduleNotes();
          }
        };
        
        console.log('Scheduler worker initialized');
      } catch (error) {
        console.error('Failed to create scheduler worker:', error);
        // Fallback to standard interval
        console.log('Using standard interval as fallback');
      }
    }
  }

  /**
   * Set up MIDI event listeners for synchronization
   */
  private setupMIDIListeners(): void {
    midiService.addEventListener(this.handleMIDIEvent.bind(this));
  }

  /**
   * Handle incoming MIDI events for sync and control
   */
  private handleMIDIEvent(event: any): void {
    // Handle MIDI clock messages for sync
    if (this.isMidiClockEnabled) {
      if (event.type === 'clock') {
        this.handleMIDIClock();
      } else if (event.type === 'start') {
        this.resetMIDIClock();
        this.start();
      } else if (event.type === 'stop') {
        this.stop();
      } else if (event.type === 'continue') {
        // Resume from current position
        this.isPlaying = true;
        this.emit('playStateChange', true);
      }
    }
    
    // Handle MIDI note events for triggering sounds
    if (event.type === 'noteOn') {
      const track = this.findTrackByMIDINote(event.note, event.channel);
      if (track) {
        // Create a default step with the received velocity
        const step: SequencerStep = {
          active: true,
          velocity: event.velocity,
          // Use the track's default values for other parameters
          decay: 50,
          tone: 50
        };
        
        // Trigger the sound immediately
        this.triggerSound(track, step, audioEngine.getCurrentTime());
      }
    }
  }

  /**
   * Find a track configured to respond to a specific MIDI note and channel
   */
  private findTrackByMIDINote(note: number, channel: number): SequencerTrack | undefined {
    const pattern = this.getCurrentPattern();
    if (!pattern) return undefined;
    
    return pattern.tracks.find(track => 
      track.midiChannel === channel && 
      track.steps.some(step => step.midiNote === note)
    );
  }

  /**
   * Handle MIDI clock pulses for external sync
   */
  private handleMIDIClock(): void {
    if (!this.isPlaying) return;
    
    this.midiClockPulseCount++;
    this.emit('midiClock', this.midiClockPulseCount);
    
    // Advance step when we've counted enough pulses
    // MIDI clock sends 24 pulses per quarter note (PPQN)
    if (this.midiClockPulseCount % this.clockDivider === 0) {
      const pattern = this.getCurrentPattern();
      if (!pattern) return;
      
      const currentStepIndex = this.currentStep % pattern.stepCount;
      
      // Process all track steps for this position
      this.processCurrentStep(currentStepIndex);
      
      // Advance to next step
      this.currentStep++;
    }
  }

  /**
   * Reset MIDI clock counter (on start/reset)
   */
  private resetMIDIClock(): void {
    this.midiClockPulseCount = 0;
    this.currentStep = 0;
  }

  /**
   * Enable/disable external MIDI clock sync
   */
  setMIDIClockEnabled(enabled: boolean): void {
    this.isMidiClockEnabled = enabled;
    
    // If enabling MIDI clock, stop the internal timer
    if (enabled && this.isPlaying) {
      if (this.interval !== null) {
        window.clearInterval(this.interval);
        this.interval = null;
      }
      if (this.scheduleWorker) {
        this.scheduleWorker.postMessage('stop');
      }
    }
    // If disabling MIDI clock but playing, restart the internal timer
    else if (!enabled && this.isPlaying) {
      this._startPlayback();
    }
  }

  /**
   * Create a new empty pattern
   */
  createPattern(id: string, name: string, stepCount: number = 16): string {
    // Erstelle ein 16-Step Pattern mit 8 Tracks, die verschiedene Drumsynth-Typen verwenden
    const pattern: SequencerPattern = {
      id,
      name,
      stepCount,
      swing: 0,
      tracks: [
        // Kick - TR808-Style mit Bridged-T-Oszillator
        {
          id: 0,
          name: 'Kick',
          sound: 'bd',
          synthType: DrumSynthType.TR808_KICK,
          oscillatorType: OscillatorType.BRIDGED_T,
          mute: false,
          solo: false,
          volume: 100,
          pan: 0,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 50,     // Ausklingzeit des Kicks
            tone: 40,      // Tonhöhe / Klangfarbe
            tuning: 0,     // Grundtonhöhe
            attack: 70,    // Stärke des initialen Transienten/Clicks
          })),
        },
        // Snare - TR909-Style mit zwei Oszillatoren plus Rauschen
        {
          id: 1,
          name: 'Snare',
          sound: 'sd',
          synthType: DrumSynthType.TR909_SNARE,
          mute: false,
          solo: false,
          volume: 100,
          pan: 0,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 40,
            tone: 50,
            tuning: 0,     // Stimmung der Oszillatoren
            snappy: 70,    // Verhältnis von Oszillator zu Rauschanteil
          })),
        },
        // Hi-Hat Closed - 808-Style mit 6 Rechteck-Oszillatoren
        {
          id: 2,
          name: 'HiHat',
          sound: 'hh',
          synthType: DrumSynthType.TR808_HAT,
          mute: false,
          solo: false,
          volume: 100,
          pan: 0,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 20,     // Kurzes Decay für Closed HH
            tone: 60,      // Höherer Tone für hellere HiHat
          })),
        },
        // Clap - TR808-Style mit gefiltertem Rauschen und Multi-Envelope
        {
          id: 3,
          name: 'Clap',
          sound: 'cp',
          synthType: DrumSynthType.TR808_CLAP,
          mute: false,
          solo: false,
          volume: 100,
          pan: 0,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 60,
            tone: 55,
            color: 65,     // Spektrale Farbe (Filterdurchlass)
          })),
        },
        // Tom 1 - 909-Style mit VCO und Pitch-Envelope
        {
          id: 4,
          name: 'Tom1',
          sound: 'tom1',
          synthType: DrumSynthType.TR909_TOM,
          oscillatorType: OscillatorType.TRIANGLE,
          mute: false,
          solo: false,
          volume: 100,
          pan: -30,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 50,
            tone: 45,
            tuning: -5,    // Etwas tieferer Tom
          })),
        },
        // Tom 2 - Höherer Tom
        {
          id: 5,
          name: 'Tom2',
          sound: 'tom2',
          synthType: DrumSynthType.TR909_TOM,
          oscillatorType: OscillatorType.TRIANGLE,
          mute: false,
          solo: false,
          volume: 100,
          pan: 30,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 45,
            tone: 50,
            tuning: 10,    // Höherer Tom
          })),
        },
        // Crash Cymbal - Sample-basiert wie in TR-909
        {
          id: 6,
          name: 'Crash',
          sound: 'cym',
          synthType: DrumSynthType.SAMPLE, // 909-Style Cymbals waren eigentlich Samples
          mute: false,
          solo: false,
          volume: 90,
          pan: -20,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 80,     // Längeres Decay für Crash
            tone: 65,
          })),
        },
        // Percussion - FM-Synthese für metallische Klänge
        {
          id: 7,
          name: 'Perc',
          sound: 'perc1',
          synthType: DrumSynthType.FM_DRUM,
          mute: false,
          solo: false,
          volume: 100,
          pan: 20,
          steps: Array.from({ length: stepCount }, () => ({
            active: false,
            velocity: 100,
            decay: 40,
            tone: 60,
            color: 50,     // Modulations-Intensität
          })),
        },
      ],
    };

    this.patterns.set(id, pattern);
    return id;
  }

  /**
   * Get all available patterns
   */
  getPatterns(): SequencerPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get a specific pattern
   */
  getPattern(id: string): SequencerPattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * Get the current pattern
   */
  getCurrentPattern(): SequencerPattern | undefined {
    return this.patterns.get(this.currentPatternId);
  }

  /**
   * Set the current pattern
   */
  setCurrentPattern(id: string): boolean {
    if (this.patterns.has(id)) {
      this.currentPatternId = id;
      this.emit('patternChange', id);
      return true;
    }
    return false;
  }

  /**
   * Create a pattern chain (sequence of patterns to play)
   */
  setPatternChain(patternIds: string[]): boolean {
    // Verify all patterns exist
    if (!patternIds.every(id => this.patterns.has(id))) {
      return false;
    }
    
    this.patternChain = [...patternIds];
    this.currentChainIndex = 0;
    this.setCurrentPattern(this.patternChain[0]);
    return true;
  }

  /**
   * Set the play mode
   */
  setPlayMode(mode: PlayMode): void {
    this.playMode = mode;
  }

  /**
   * Update a step in a track
   */
  updateStep(trackId: number, stepIndex: number, stepData: Partial<SequencerStep>): boolean {
    const pattern = this.getCurrentPattern();
    if (!pattern) return false;

    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return false;

    if (stepIndex < 0 || stepIndex >= track.steps.length) return false;

    track.steps[stepIndex] = { ...track.steps[stepIndex], ...stepData };
    return true;
  }

  /**
   * Add a new track to the current pattern
   */
  addTrack(trackData: Partial<SequencerTrack>): number {
    const pattern = this.getCurrentPattern();
    if (!pattern) return -1;
    
    // Generate new unique ID for the track
    const newId = Math.max(0, ...pattern.tracks.map(t => t.id)) + 1;
    
    const newTrack: SequencerTrack = {
      id: newId,
      name: trackData.name || `Track ${newId}`,
      sound: trackData.sound || 'bd',
      synthType: trackData.synthType || DrumSynthType.SAMPLE,
      oscillatorType: trackData.oscillatorType,
      mute: trackData.mute || false,
      solo: trackData.solo || false,
      volume: trackData.volume || 100,
      pan: trackData.pan || 0,
      midiChannel: trackData.midiChannel,
      steps: Array.from({ length: pattern.stepCount }, () => ({
        active: false,
        velocity: 100,
        decay: 50,
        tone: 50,
      })),
    };
    
    pattern.tracks.push(newTrack);
    return newId;
  }

  /**
   * Update track settings in the current pattern
   */
  updateTrack(trackId: number, trackData: Partial<SequencerTrack>): boolean {
    const pattern = this.getCurrentPattern();
    if (!pattern) return false;
    
    const trackIndex = pattern.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return false;
    
    // Update track data
    pattern.tracks[trackIndex] = { 
      ...pattern.tracks[trackIndex], 
      ...trackData 
    };
    
    // Check if solo state changed
    if (trackData.solo !== undefined) {
      this.updateSoloState();
    }
    
    return true;
  }

  /**
   * Remove a track from the current pattern
   */
  removeTrack(trackId: number): boolean {
    const pattern = this.getCurrentPattern();
    if (!pattern) return false;
    
    const trackIndex = pattern.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return false;
    
    pattern.tracks.splice(trackIndex, 1);
    return true;
  }

  /**
   * Update solo state for all tracks
   */
  private updateSoloState(): void {
    const pattern = this.getCurrentPattern();
    if (!pattern) return;
    
    // Check if any track is soloed
    this.soloActive = pattern.tracks.some(track => track.solo);
  }

  /**
   * Start playback
   */
  start(): void {
    if (this.isPlaying) return;
    
    // Initialize audio engine if not already
    if (!audioEngine.isInitialized) {
      audioEngine.initialize().then(() => {
        this._startPlayback();
      });
    } else {
      this._startPlayback();
    }
  }

  /**
   * Internal method to start playback after audio engine is initialized
   */
  private _startPlayback(): void {
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = audioEngine.getCurrentTime();
    this.lastStepTime = this.nextNoteTime;
    
    this.emit('playStateChange', true);
    
    // If using MIDI clock, don't start the scheduler
    if (this.isMidiClockEnabled) {
      return;
    }
    
    // Use worker for scheduling if available
    if (this.scheduleWorker) {
      this.scheduleWorker.postMessage({
        interval: this.lookAheadMs
      });
      this.scheduleWorker.postMessage('start');
    } else {
      // Fallback to setInterval
      this.scheduleNotes();
      this.interval = window.setInterval(() => this.scheduleNotes(), this.lookAheadMs);
    }
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.emit('playStateChange', false);

    if (this.interval !== null) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.scheduleWorker) {
      this.scheduleWorker.postMessage('stop');
    }
    
    // Reset step counter
    this.currentStep = 0;
  }

  /**
   * Schedule notes to be played
   */
  private scheduleNotes(): void {
    const pattern = this.getCurrentPattern();
    if (!pattern) return;
    
    // Use pattern-specific tempo if available, otherwise use global
    const currentTempo = pattern.tempo || this.tempo;
    
    const secondsPerBeat = 60.0 / currentTempo;
    const stepsPerBeat = 4; // 16th notes
    const secondsPerStep = secondsPerBeat / stepsPerBeat;
    
    // Schedule notes up to scheduleAheadTime seconds ahead
    while (this.nextNoteTime < audioEngine.getCurrentTime() + this.scheduleAheadTime) {
      // Calculate current step index within the pattern
      const currentStepIndex = this.currentStep % pattern.stepCount;
      
      // Apply swing if set
      let swingOffset = 0;
      if (pattern.swing > 0 && currentStepIndex % 2 === 1) {
        swingOffset = (pattern.swing / 100) * secondsPerStep * 0.75;
      }
      
      // Process steps for all tracks at this position
      this.processCurrentStep(currentStepIndex, this.nextNoteTime + swingOffset);
      
      // Move to next step and calculate its time
      this.currentStep++;
      this.nextNoteTime += secondsPerStep;
      
      // Handle pattern change or stop if needed
      if (this.currentStep % pattern.stepCount === 0) {
        this.handlePatternEnd();
      }
    }
  }

  /**
   * Process all tracks for the current step
   */
  private processCurrentStep(stepIndex: number, time: number = audioEngine.getCurrentTime()): void {
    const pattern = this.getCurrentPattern();
    if (!pattern) return;
    
    // Notify listeners of the step change
    this.emit('step', stepIndex);
    
    // Check for active steps and schedule their sounds
    pattern.tracks.forEach(track => {
      // Skip if track is muted or if solos are active and this track isn't soloed
      if (track.mute || (this.soloActive && !track.solo)) return;
      
      const step = track.steps[stepIndex];
      
      if (step.active) {
        // Check probability if set
        if (step.probability !== undefined && step.probability < 100) {
          if (Math.random() * 100 > step.probability) {
            return; // Skip this step based on probability
          }
        }
        
        // Handle accent (increase velocity)
        const velocity = step.accent ? Math.min(127, step.velocity * 1.3) : step.velocity;
        
        // Handle flam (double hit with very short delay)
        if (step.flam) {
          // Play flam grace note slightly ahead
          const flamVelocity = velocity * 0.7; // Grace note is quieter
          const flamTime = time - 0.03; // 30ms before the main note
          
          // Create a copy of step with reduced velocity for the flam
          const flamStep = { ...step, velocity: flamVelocity };
          this.triggerSound(track, flamStep, flamTime);
        }
        
        // Handle rolls (multiple hits in quick succession)
        if (step.roll && step.roll > 1) {
          const rollCount = step.roll;
          const rollInterval = time + 0.12 / rollCount; // Divide the time for the roll
          
          for (let i = 0; i < rollCount; i++) {
            const rollTime = time + (i * rollInterval);
            this.triggerSound(track, step, rollTime);
          }
        } else {
          // Normal trigger
          this.triggerSound(track, { ...step, velocity }, time);
        }
        
        this.emit('trackTrigger', track.id, stepIndex, velocity);
        
        // Send MIDI note if midiNote and midiChannel are set
        if (track.midiChannel !== undefined && step.midiNote !== undefined) {
          const midiTime = Math.max(0, time - audioEngine.getCurrentTime()); // Convert to relative time
          setTimeout(() => {
            midiService.sendNoteOn(step.midiNote!, velocity, track.midiChannel! - 1);
            
            // Schedule note off after a short duration
            const noteLength = 0.1; // 100ms
            setTimeout(() => {
              midiService.sendNoteOff(step.midiNote!, 0, track.midiChannel! - 1);
            }, noteLength * 1000);
          }, midiTime * 1000);
        }
      }
    });
    
    this.lastStepTime = time;
  }

  /**
   * Handle what happens when we reach the end of a pattern
   */
  private handlePatternEnd(): void {
    // In one-shot mode, stop when pattern ends
    if (this.playMode === PlayMode.ONESHOT) {
      this.stop();
      return;
    }
    
    // In chain mode, move to next pattern in chain
    if (this.playMode === PlayMode.CHAIN && this.patternChain.length > 1) {
      this.currentChainIndex = (this.currentChainIndex + 1) % this.patternChain.length;
      const nextPatternId = this.patternChain[this.currentChainIndex];
      this.setCurrentPattern(nextPatternId);
    }
    
    // In loop mode, just continue from the beginning (already handled by modulo)
  }

  /**
   * Set the tempo in BPM
   */
  setTempo(bpm: number): void {
    this.tempo = Math.max(30, Math.min(300, bpm));
    this.emit('tempoChange', this.tempo);
    
    // If changing tempo while playing, adjust nextNoteTime
    if (this.isPlaying) {
      // Calculate how far we are through the current step
      const now = audioEngine.getCurrentTime();
      const elapsedInStep = now - this.lastStepTime;
      
      // Get the new step duration
      const secondsPerBeat = 60.0 / this.tempo;
      const stepsPerBeat = 4; // 16th notes
      const secondsPerStep = secondsPerBeat / stepsPerBeat;
      
      // Adjust next note time to maintain current position
      this.nextNoteTime = now + (secondsPerStep - elapsedInStep);
    }
  }

  /**
   * Trigger a sound based on track and step data
   */
  private triggerSound(track: SequencerTrack, step: SequencerStep, time: number): void {
    // Use the sequencer output node as the destination if available
    const sequencerOutput = audioEngine.getSequencerOutput();
    
    // Apply track volume control
    const normalizedVolume = (track.volume / 100) * (step.velocity / 127);
    
    // Wenn synthType SAMPLE ist oder kein AudioEngine für Synthese verfügbar, verwenden wir Samples
    if (track.synthType === DrumSynthType.SAMPLE || !audioEngine.supportsSynthesis) {
      // Standard-Sample-Wiedergabe
      const sampleId = `samples/${track.sound}.wav`;
      
      // Sample mit Step-Parametern abspielen
      audioEngine.playSample(sampleId, {
        velocity: normalizedVolume * 127,
        pitch: step.pitch || step.tuning,
        decay: step.decay,
        time,           // Schedule the sound to play at a specific time
        pan: track.pan // Apply panning -100 to 100
      });
    } 
    // Ansonsten nutzen wir die DrumSynth-Engine basierend auf dem Typ
    else {
      // Parameter für die Drum-Synthese vorbereiten
      const synthParams = {
        time,
        velocity: normalizedVolume, // Normalisieren auf 0-1 Range mit Berücksichtigung der Track-Lautstärke
        decay: step.decay !== undefined ? step.decay / 100.0 : 0.5,
        tone: step.tone !== undefined ? step.tone / 100.0 : 0.5,
        tuning: step.tuning !== undefined ? step.tuning / 100.0 : 0.5,
        attack: step.attack !== undefined ? step.attack / 100.0 : 0.7,
        snappy: step.snappy !== undefined ? step.snappy / 100.0 : 0.5,
        color: step.color !== undefined ? step.color / 100.0 : 0.5,
        pan: track.pan / 100, // Normalize to -1 to 1 range
        // Optional: zusätzliche Parameter für spezielle Synthese-Effekte
        synthType: track.synthType,
        oscillatorType: track.oscillatorType || OscillatorType.SINE,
        filterCutoff: track.filterCutoff !== undefined ? track.filterCutoff / 100.0 : undefined,
        filterResonance: track.filterResonance !== undefined ? track.filterResonance / 100.0 : undefined
      };
      
      // Drum-Synthese mit spezialisierten Parametern basierend auf dem Synthesizer-Typ
      audioEngine.synthesizeDrum(track.synthType, synthParams);
    }
  }

  /**
   * Copy a pattern
   */
  copyPattern(sourceId: string, targetId: string, targetName: string): boolean {
    const sourcePattern = this.getPattern(sourceId);
    if (!sourcePattern) return false;
    
    // Deep clone the pattern
    const newPattern: SequencerPattern = {
      ...sourcePattern,
      id: targetId,
      name: targetName,
      tracks: JSON.parse(JSON.stringify(sourcePattern.tracks)) // Deep clone tracks
    };
    
    this.patterns.set(targetId, newPattern);
    return true;
  }

  /**
   * Export pattern as JSON
   */
  exportPatternAsJSON(patternId: string): string {
    const pattern = this.getPattern(patternId);
    if (!pattern) return '{}';
    
    return JSON.stringify(pattern);
  }

  /**
   * Import pattern from JSON
   */
  importPatternFromJSON(json: string): string | null {
    try {
      const patternData = JSON.parse(json) as SequencerPattern;
      const id = patternData.id || `pattern_${Date.now()}`;
      
      // Clean up and validate the imported pattern
      if (!Array.isArray(patternData.tracks)) {
        return null;
      }
      
      this.patterns.set(id, patternData);
      return id;
    } catch (error) {
      console.error('Failed to import pattern:', error);
      return null;
    }
  }
  
  /**
   * Set pattern length (steps)
   */
  setPatternLength(patternId: string, stepCount: number): boolean {
    const pattern = this.getPattern(patternId);
    if (!pattern) return false;
    
    // Only allow step counts between 1 and 64
    stepCount = Math.max(1, Math.min(64, stepCount));
    pattern.stepCount = stepCount;
    
    // Adjust steps arrays in each track
    pattern.tracks.forEach(track => {
      if (track.steps.length < stepCount) {
        // Add new steps
        const additionalSteps = Array.from({ length: stepCount - track.steps.length }, () => ({
          active: false,
          velocity: 100,
          decay: 50,
          tone: 50,
        }));
        track.steps = [...track.steps, ...additionalSteps];
      } else if (track.steps.length > stepCount) {
        // Remove extra steps
        track.steps = track.steps.slice(0, stepCount);
      }
    });
    
    return true;
  }
  
  /**
   * Create a drum fill for a specific track over a certain range of steps
   */
  createDrumFill(trackId: number, startStep: number, endStep: number, density: number = 0.5): boolean {
    const pattern = this.getCurrentPattern();
    if (!pattern) return false;
    
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return false;
    
    // Validate step range
    startStep = Math.max(0, Math.min(pattern.stepCount - 1, startStep));
    endStep = Math.max(startStep, Math.min(pattern.stepCount - 1, endStep));
    
    // Clear existing steps in the range
    for (let i = startStep; i <= endStep; i++) {
      track.steps[i].active = false;
    }
    
    // Create fill based on density (0.0 to 1.0)
    const fillLength = endStep - startStep + 1;
    
    // Determine how many steps to activate
    const stepsToActivate = Math.max(1, Math.round(fillLength * density));
    
    // Activate steps with increasing velocity towards the end
    const positions = new Set<number>();
    while (positions.size < stepsToActivate) {
      positions.add(startStep + Math.floor(Math.random() * fillLength));
    }
    
    // Convert to array and sort
    const activatedPositions = Array.from(positions).sort();
    
    // Set increasing velocity and activate the steps
    activatedPositions.forEach((pos, index) => {
      // Increase velocity towards the end of the fill
      const velocityFactor = 0.7 + (0.3 * (index / (activatedPositions.length - 1 || 1)));
      
      track.steps[pos] = {
        ...track.steps[pos],
        active: true,
        velocity: Math.min(127, Math.round(velocityFactor * 100)),
        // Add roll for some steps near the end
        roll: index >= activatedPositions.length - 2 && Math.random() > 0.5 ? 2 : undefined
      };
    });
    
    return true;
  }
  
  /**
   * Add an accent pattern to a track (emphasize certain beats)
   */
  addAccentPattern(trackId: number, accentPattern: number[]): boolean {
    const pattern = this.getCurrentPattern();
    if (!pattern) return false;
    
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return false;
    
    // Go through each active step
    track.steps.forEach((step, index) => {
      if (step.active) {
        // Add accent if this position matches the accent pattern
        step.accent = accentPattern.includes(index % accentPattern.length);
      }
    });
    
    return true;
  }
}

// Create a singleton instance of the sequencer
const sequencer = new Sequencer();

export default sequencer;