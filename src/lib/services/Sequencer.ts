/**
 * Sequencer.ts
 * Handles pattern sequencing and playback for Rythmotron
 */

import audioEngine from './AudioEngine';
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

export type SequencerPattern = {
  id: string;
  name: string;
  tracks: SequencerTrack[];
  stepCount: number;
  swing: number;
};

export interface SequencerEvents {
  step: (step: number) => void;
  playStateChange: (isPlaying: boolean) => void;
  trackTrigger: (trackId: number, step: number, velocity: number) => void;
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

  constructor() {
    super();
    this.createPattern('default', 'Default Pattern');
    this.currentPatternId = 'default';
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
      return true;
    }
    return false;
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
   * Start playback
   */
  start(): void {
    if (this.isPlaying) return;
    
    // Initialize audio engine if not already
    if (!audioEngine.isInitialized) {
      audioEngine.initialize();
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = audioEngine.getCurrentTime();
    this.emit('playStateChange', true);
    
    this.scheduleNotes();
    this.interval = window.setInterval(() => this.scheduleNotes(), 25);
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.currentStep = 0;
    this.emit('playStateChange', false);

    if (this.interval !== null) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Schedule notes to be played
   */
  private scheduleNotes(): void {
    const pattern = this.getCurrentPattern();
    if (!pattern) return;
    
    const secondsPerBeat = 60.0 / this.tempo;
    const stepsPerBeat = 4; // 16th notes
    const secondsPerStep = secondsPerBeat / stepsPerBeat;
    
    // Schedule notes up to scheduleAheadTime seconds ahead
    while (this.nextNoteTime < audioEngine.getCurrentTime() + this.scheduleAheadTime) {
      // Apply swing if set
      let swingOffset = 0;
      if (pattern.swing > 0 && this.currentStep % 2 === 1) {
        swingOffset = (pattern.swing / 100) * secondsPerStep * 0.75;
      }
      
      // Process all tracks for this step
      const currentStepIndex = this.currentStep % pattern.stepCount;
      
      // Check for active steps and schedule their sounds
      pattern.tracks.forEach(track => {
        const step = track.steps[currentStepIndex];
        
        if (step.active && !track.mute) {
          this.triggerSound(track, step, this.nextNoteTime + swingOffset);
          this.emit('trackTrigger', track.id, currentStepIndex, step.velocity);
        }
      });
      
      // Notify listeners of the step change
      this.emit('step', currentStepIndex);
      
      // Move to next step and calculate its time
      this.currentStep++;
      this.nextNoteTime += secondsPerStep;
    }
  }

  /**
   * Set the tempo in BPM
   */
  setTempo(bpm: number): void {
    this.tempo = Math.max(30, Math.min(300, bpm));
  }

  /**
   * Trigger a sound based on track and step data
   */
  private triggerSound(track: SequencerTrack, step: SequencerStep, time: number): void {
    // Wenn synthType SAMPLE ist oder kein AudioEngine für Synthese verfügbar, verwenden wir Samples
    if (track.synthType === DrumSynthType.SAMPLE || !audioEngine.supportsSynthesis) {
      // Standard-Sample-Wiedergabe
      const sampleId = `samples/${track.sound}.wav`;
      
      // Sample mit Step-Parametern abspielen
      audioEngine.playSample(sampleId, {
        velocity: step.velocity,
        pitch: step.pitch || step.tuning,
        decay: step.decay,
        time, // Schedule the sound to play at a specific time
      });
    } 
    // Ansonsten nutzen wir die DrumSynth-Engine basierend auf dem Typ
    else {
      // Parameter für die Drum-Synthese vorbereiten
      const synthParams = {
        time,
        velocity: step.velocity / 127.0, // Normalisieren auf 0-1 Range
        decay: step.decay !== undefined ? step.decay / 100.0 : 0.5,
        tone: step.tone !== undefined ? step.tone / 100.0 : 0.5,
        tuning: step.tuning !== undefined ? step.tuning / 100.0 : 0.5,
        attack: step.attack !== undefined ? step.attack / 100.0 : 0.7,
        snappy: step.snappy !== undefined ? step.snappy / 100.0 : 0.5,
        color: step.color !== undefined ? step.color / 100.0 : 0.5,
        // Optional: zusätzliche Parameter für spezielle Synthese-Effekte
        synthType: track.synthType,
        oscillatorType: track.oscillatorType || OscillatorType.SINE
      };
      
      // Drum-Synthese mit spezialisierten Parametern basierend auf dem Synthesizer-Typ
      audioEngine.synthesizeDrum(track.synthType, synthParams);
    }
  }
}

// Create a singleton instance of the sequencer
const sequencer = new Sequencer();

export default sequencer;