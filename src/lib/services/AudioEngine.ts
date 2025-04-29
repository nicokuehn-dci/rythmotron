/**
 * AudioEngine.ts
 * Handles audio playback and synthesis for Rythmotron
 */

import { DrumSynthType, OscillatorType } from './Sequencer';

interface AudioParams {
  velocity?: number;
  pitch?: number;
  decay?: number;
  tone?: number;
  time?: number;
}

interface EffectParams {
  type: 'delay' | 'reverb' | 'distortion';
  mix: number;  // 0-1 dry/wet mix
  bypass: boolean;
}

interface DelayParams extends EffectParams {
  time: number;       // Delay time in seconds
  feedback: number;   // 0-1 feedback amount
  filter: number;     // 0-1 lowpass filter cutoff
}

interface ReverbParams extends EffectParams {
  size: number;       // 0-1 room size
  damping: number;    // 0-1 high frequency damping
  predelay: number;   // 0-0.1 predelay time in seconds
}

interface DistortionParams extends EffectParams {
  drive: number;      // 0-1 distortion amount
  tone: number;       // 0-1 tone control
  character: 'soft' | 'hard' | 'fold';  // Distortion character
}

interface DrumSynthParams {
  time?: number;
  velocity?: number; // 0-1
  decay?: number;    // 0-1
  tone?: number;     // 0-1
  tuning?: number;   // -1 bis 1
  attack?: number;   // 0-1 (für Kick: Click-Stärke)
  snappy?: number;   // 0-1 (für Snare: Noise/Tone Verhältnis)
  color?: number;    // 0-1 (spektrale Farbe/Filter Cutoff)
  synthType: DrumSynthType;
  oscillatorType?: OscillatorType;
}

interface AudioRouting {
  sequencerOutput: GainNode | null;
  channelStrips: Map<number, GainNode>;
  master: GainNode | null;
  compressor: DynamicsCompressorNode | null;
}

class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private samples: Map<string, AudioBuffer> = new Map();
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private compressor: DynamicsCompressorNode | null = null;
  private _isInitialized: boolean = false;
  public supportsSynthesis: boolean = false;
  
  // Audio routing chain - ensures sequencer is first in chain
  private routing: AudioRouting = {
    sequencerOutput: null,
    channelStrips: new Map(),
    master: null,
    compressor: null
  };

  // Effect nodes
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayMix: GainNode | null = null;
  
  private reverbConvolver: ConvolverNode | null = null;
  private reverbPredelay: DelayNode | null = null;
  private reverbDamping: BiquadFilterNode | null = null;
  private reverbMix: GainNode | null = null;
  
  private distortion: WaveShaperNode | null = null;
  private distortionPreFilter: BiquadFilterNode | null = null;
  private distortionPostFilter: BiquadFilterNode | null = null;
  private distortionMix: GainNode | null = null;

  // Effect parameters
  private delayParams: DelayParams = {
    type: 'delay',
    mix: 0.3,
    bypass: true,
    time: 0.25,
    feedback: 0.3,
    filter: 0.7
  };

  private reverbParams: ReverbParams = {
    type: 'reverb',
    mix: 0.2,
    bypass: true,
    size: 0.5,
    damping: 0.5,
    predelay: 0.02
  };

  private distortionParams: DistortionParams = {
    type: 'distortion',
    mix: 0.2,
    bypass: true,
    drive: 0.5,
    tone: 0.5,
    character: 'soft'
  };

  /**
   * Initialize the audio engine
   */
  async initialize(): Promise<boolean> {
    if (this._isInitialized) return true;

    try {
      // Create audio context
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Check if synthesis is supported
      this.supportsSynthesis = 
        typeof this.context.createOscillator === 'function' &&
        typeof this.context.createBiquadFilter === 'function';
      
      // Create sequencer output node - THIS IS THE FIRST NODE IN THE CHAIN
      this.routing.sequencerOutput = this.context.createGain();
      this.routing.sequencerOutput.gain.value = 1.0;

      // Initialize delay effect
      this.delayNode = this.context.createDelay(2.0);
      this.delayFeedback = this.context.createGain();
      this.delayFilter = this.context.createBiquadFilter();
      this.delayMix = this.context.createGain();
      
      // Initialize reverb
      this.reverbConvolver = this.context.createConvolver();
      this.reverbPredelay = this.context.createDelay(0.1);
      this.reverbDamping = this.context.createBiquadFilter();
      this.reverbMix = this.context.createGain();
      
      // Initialize distortion
      this.distortion = this.context.createWaveShaper();
      this.distortionPreFilter = this.context.createBiquadFilter();
      this.distortionPostFilter = this.context.createBiquadFilter();
      this.distortionMix = this.context.createGain();
      
      // Set up delay routing
      this.routing.sequencerOutput.connect(this.delayFilter);
      this.delayFilter.connect(this.delayNode);
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayMix);
      
      // Set up reverb routing
      this.routing.sequencerOutput.connect(this.reverbPredelay);
      this.reverbPredelay.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.reverbDamping);
      this.reverbDamping.connect(this.reverbMix);
      
      // Set up distortion routing
      this.routing.sequencerOutput.connect(this.distortionPreFilter);
      this.distortionPreFilter.connect(this.distortion);
      this.distortion.connect(this.distortionPostFilter);
      this.distortionPostFilter.connect(this.distortionMix);
      
      // Create master gain
      this.master = this.context.createGain();
      this.routing.master = this.master;
      this.master.gain.value = 0.8;
      
      // Add a compressor for overall dynamics control
      this.compressor = this.context.createDynamicsCompressor();
      this.routing.compressor = this.compressor;
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;
      
      // Connect nodes in proper order:
      // sequencerOutput -> effects -> master -> compressor -> destination
      this.routing.sequencerOutput.connect(this.master);
      this.delayMix.connect(this.master);
      this.reverbMix.connect(this.master);
      this.distortionMix.connect(this.master);
      this.master.connect(this.compressor);
      this.compressor.connect(this.context.destination);
      
      // Initialize effect parameters
      this.updateEffectParameters();
      
      this._isInitialized = true;
      console.log('AudioEngine initialized with effects chain:', this.context);
      
      // Preload samples
      await this.preloadSamples();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error);
      return false;
    }
  }

  /**
   * Get the current audio time
   */
  getCurrentTime(): number {
    return this.context?.currentTime || 0;
  }

  /**
   * Get the sequencer output node - for connecting sequencer to audio chain
   */
  getSequencerOutput(): GainNode | null {
    return this.routing.sequencerOutput;
  }

  /**
   * Preload all drum samples
   */
  private async preloadSamples(): Promise<void> {
    const sampleFiles = [
      'bd', 'sd', 'hh', 'cp', 'tom1', 'tom2', 'tom3', 'cym', 
      'perc1', 'perc2', 'shake', 'rim', 'cowbell', 'click', 'fx1', 'fx2'
    ];

    const samplePromises = sampleFiles.map(name => {
      const url = `/samples/${name}.wav`;
      return this.loadSample(`samples/${name}.wav`, url);
    });

    try {
      await Promise.all(samplePromises);
      console.log('All samples loaded successfully');
    } catch (error) {
      console.error('Failed to load some samples:', error);
    }
  }

  /**
   * Load a sample
   */
  async loadSample(id: string, url: string): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.samples.set(id, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sample ${id} from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Play a sample with optional parameters
   */
  playSample(id: string, params: AudioParams = {}): void {
    if (!this.context || !this.master) {
      console.error('AudioEngine not initialized');
      return;
    }

    const buffer = this.samples.get(id);
    if (!buffer) {
      console.error(`Sample ${id} not found`);
      return;
    }

    // Create source
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    // Apply pitch if provided
    if (params.pitch !== undefined) {
      const semitoneRatio = Math.pow(2, 1/12);
      source.playbackRate.value = Math.pow(semitoneRatio, params.pitch);
    }
    
    // Create gain for velocity control
    const gainNode = this.context.createGain();
    gainNode.gain.value = params.velocity !== undefined ? params.velocity / 127 : 1;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.master);
    
    // Start playback
    const startTime = params.time !== undefined ? params.time : this.context.currentTime;
    source.start(startTime);
    
    // Apply decay if provided
    if (params.decay !== undefined) {
      // Convert decay value (0-100) to time in seconds (0.1 to 4)
      const decayTime = 0.1 + (params.decay / 100) * 3.9;
      
      // Schedule the release
      const now = this.context.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime);
      
      // Schedule source stop
      source.stop(startTime + decayTime + 0.1);
    }
  }

  /**
   * Set the master volume (0-100)
   */
  setVolume(volume: number): void {
    if (!this.master) return;
    
    // Convert 0-100 to 0-1 with logarithmic scaling for perceptual volume
    const normalized = Math.max(0, Math.min(100, volume)) / 100;
    this.master.gain.value = normalized * normalized;
  }

  /**
   * Alias for setVolume for API consistency
   */
  setMasterVolume(volume: number): void {
    this.setVolume(volume);
  }

  /**
   * Get the initialization status
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Hilfsfunktion: Generiert einen Rausch-Buffer 
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.context) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.context.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, sampleRate);
    
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  /**
   * TR-808/909 Drum-Synthesizer Implementierung basierend auf drumsynthese.md
   */
  synthesizeDrum(type: DrumSynthType, params: DrumSynthParams): void {
    if (!this.context || !this.master || !this.supportsSynthesis) {
      // Fallback zu Samples als Notlösung
      const sampleMap: Record<DrumSynthType, string> = {
        [DrumSynthType.TR808_KICK]: 'samples/bd.wav',
        [DrumSynthType.TR909_KICK]: 'samples/bd.wav',
        [DrumSynthType.TR808_SNARE]: 'samples/sd.wav',
        [DrumSynthType.TR909_SNARE]: 'samples/sd.wav',
        [DrumSynthType.TR808_HAT]: 'samples/hh.wav',
        [DrumSynthType.TR808_TOM]: 'samples/tom1.wav',
        [DrumSynthType.TR909_TOM]: 'samples/tom2.wav',
        [DrumSynthType.TR808_CLAP]: 'samples/cp.wav',
        [DrumSynthType.FM_DRUM]: 'samples/perc1.wav',
        [DrumSynthType.NOISE]: 'samples/hh.wav',
        [DrumSynthType.ANALOG]: 'samples/bd.wav',
        [DrumSynthType.SAMPLE]: 'samples/bd.wav'
      };
      
      const sampleId = sampleMap[type] || 'samples/bd.wav';
      this.playSample(sampleId, {
        velocity: params.velocity ? params.velocity * 127 : 100,
        pitch: params.tuning ? params.tuning * 24 : 0,
        decay: params.decay ? params.decay * 100 : 50,
        time: params.time
      });
      
      return;
    }

    // Standardwerte für alle Parameter
    const time = params.time || this.context.currentTime;
    const velocity = params.velocity || 0.8;
    const decay = params.decay || 0.5;
    const tone = params.tone || 0.5;
    const tuning = params.tuning || 0.5;
    const attack = params.attack || 0.7;
    const snappy = params.snappy || 0.5;
    const color = params.color || 0.5;

    // Master-Envelope für Amplitude
    const volumeEnv = this.context.createGain();
    volumeEnv.gain.value = 0; // Start bei 0
    volumeEnv.connect(this.master);

    // Je nach Drum-Typ unterschiedliche Syntheseverfahren verwenden
    switch (type) {
      case DrumSynthType.TR808_KICK:
        this.create808Kick(volumeEnv, time, {
          velocity,
          decay: decay * 2, // Längeres Decay für 808-Kicks
          tone,
          tuning,
          attack
        });
        break;

      case DrumSynthType.TR909_KICK:
        this.create909Kick(volumeEnv, time, {
          velocity,
          decay: decay * 1.5,
          tone,
          tuning,
          attack
        });
        break;
        
      case DrumSynthType.TR808_SNARE:
        this.create808Snare(volumeEnv, time, {
          velocity,
          decay,
          tone,
          tuning,
          snappy
        });
        break;
        
      case DrumSynthType.TR909_SNARE:
        this.create909Snare(volumeEnv, time, {
          velocity,
          decay,
          tone,
          tuning,
          snappy
        });
        break;
        
      case DrumSynthType.TR808_HAT:
        this.create808Hat(volumeEnv, time, {
          velocity,
          decay: decay * 0.3, // Kürzeres Decay für Hi-Hats
          tone,
          color
        });
        break;
        
      case DrumSynthType.TR808_CLAP:
        this.create808Clap(volumeEnv, time, {
          velocity,
          decay: decay * 1.2,
          tone,
          color
        });
        break;
        
      case DrumSynthType.TR909_TOM:
        this.create909Tom(volumeEnv, time, {
          velocity,
          decay,
          tone,
          tuning
        });
        break;
        
      case DrumSynthType.FM_DRUM:
        this.createFMDrum(volumeEnv, time, {
          velocity,
          decay,
          tone,
          tuning,
          color
        });
        break;
        
      case DrumSynthType.NOISE:
        this.createNoiseDrum(volumeEnv, time, {
          velocity,
          decay,
          color
        });
        break;

      // Fallback für andere Typen
      default:
        this.createSimpleDrum(volumeEnv, time, {
          velocity,
          decay,
          tone,
          tuning,
          oscillatorType: params.oscillatorType
        });
        break;
    }
  }

  /**
   * TR-808 Kick Drum (basierend auf Bridged-T-Oszillator)
   */
  private create808Kick(output: GainNode, time: number, params: any): void {
    if (!this.context) return;

    // Oszillator für den Grundton
    const osc = this.context.createOscillator();
    osc.type = 'sine'; // Sine-Wave für 808-Kicks
    
    // Start-Tonhöhe berechnen (zwischen 40-70Hz basierend auf tuning)
    const baseFreq = 40 + (params.tuning * 30);
    osc.frequency.setValueAtTime(baseFreq * 4, time); // Höherer Anfangswert für Pitch-Drop
    
    // Pitch-Envelope: schneller exponentieller Abfall (charakteristisch für 808)
    // Der Pitch-Drop ist der wichtigste Teil des 808-Kick-Sounds
    const pitchDecayTime = 0.1 * params.decay;
    osc.frequency.exponentialRampToValueAtTime(baseFreq, time + pitchDecayTime);
    
    // Click-Generator (Attack Transient)
    let clickOsc = null;
    if (params.attack > 0.2) {
      clickOsc = this.context.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(baseFreq * 5, time);
      
      // Click-Gain mit sehr schnellem Decay
      const clickGain = this.context.createGain();
      clickGain.gain.setValueAtTime(params.attack * 0.5, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      
      clickOsc.connect(clickGain);
      clickGain.connect(output);
      clickOsc.start(time);
      clickOsc.stop(time + 0.03);
    }
    
    // Tone-Filter (Tiefpass)
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500 + params.tone * 5000, time);
    filter.Q.setValueAtTime(1 + params.tone * 7, time); // Höheres Q bei höherem Tone
    
    // Amplituden-Envelope
    // Attack
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.005);
    
    // Decay (logarithmischer Abfall typisch für 808)
    const decayTime = 0.1 + params.decay * 2;
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Verbindungen herstellen
    osc.connect(filter);
    filter.connect(output);
    
    // Starten und Stoppen
    osc.start(time);
    osc.stop(time + decayTime + 0.1);
  }

  /**
   * TR-909 Kick Drum (basierend auf VCO mit Click-Generator)
   */
  private create909Kick(output: GainNode, time: number, params: any): void {
    if (!this.context) return;

    // Hauptoszillator - Triangle für 909 Kick
    const osc = this.context.createOscillator();
    osc.type = 'triangle';
    
    // 909 hat typischerweise einen etwas höheren Grundton als 808
    const baseFreq = 50 + (params.tuning * 30);
    osc.frequency.setValueAtTime(baseFreq * 6, time); // Startet höher
    
    // 909 Pitch-Envelope fällt schneller ab als 808
    const pitchDecayTime = 0.05 * params.decay;
    osc.frequency.exponentialRampToValueAtTime(baseFreq, time + pitchDecayTime);
    
    // Click-Generator - typisch für 909 Kick (wichtiger als bei 808)
    const clickOsc = this.context.createOscillator();
    clickOsc.type = 'sawtooth';
    clickOsc.frequency.setValueAtTime(1000 + params.attack * 5000, time);
    
    const clickGain = this.context.createGain();
    clickGain.gain.setValueAtTime(params.attack * 0.8, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    
    clickOsc.connect(clickGain);
    clickGain.connect(output);
    clickOsc.start(time);
    clickOsc.stop(time + 0.02);
    
    // Distortion (charakteristisch für 909 Kick)
    const waveshaper = this.context.createWaveShaper();
    const curveAmount = 5 + params.tone * 50;
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = (Math.PI + curveAmount) * x / (Math.PI + curveAmount * Math.abs(x));
    }
    waveshaper.curve = curve;
    
    // Tiefpassfilter
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000 + params.tone * 6000, time);
    filter.Q.setValueAtTime(0.5 + params.tone * 3, time);
    
    // Amplituden-Envelope
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.005);
    
    // 909 hat tendenziell ein etwas kürzeres Decay als 808
    const decayTime = 0.1 + params.decay * 1.5;
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Verbinden
    osc.connect(waveshaper);
    waveshaper.connect(filter);
    filter.connect(output);
    
    osc.start(time);
    osc.stop(time + decayTime + 0.1);
  }

  /**
   * TR-808 Snare (zwei gestimmte Oszillatoren + Rauschen)
   */
  private create808Snare(output: GainNode, time: number, params: any): void {
    if (!this.context) return;
    
    // 808 Snare: 2 gestimmte Oszillatoren + Rauschen
    const toneOsc1 = this.context.createOscillator();
    const toneOsc2 = this.context.createOscillator();
    toneOsc1.type = toneOsc2.type = 'triangle';
    
    // Typische 808 Snare Frequenzen
    const baseFreq = 140 + params.tuning * 100;
    toneOsc1.frequency.value = baseFreq;
    toneOsc2.frequency.value = baseFreq * 1.5; // Leichte Verstimmung für Bittersüße
    
    const toneGain = this.context.createGain();
    toneGain.gain.value = 1 - params.snappy * 0.5; // Weniger Tone bei mehr Snappy
    
    // Noise für den "Snappy"-Teil
    const noise = this.context.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(2); // 2 Sekunden Rauschen
    noise.buffer = noiseBuffer;
    
    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000 + params.tone * 5000;
    
    const noiseGain = this.context.createGain();
    noiseGain.gain.value = params.snappy * 1.5; // Mehr Gain bei mehr Snappy
    
    // Verbindungen für Tone-Komponente
    toneOsc1.connect(toneGain);
    toneOsc2.connect(toneGain);
    toneGain.connect(output);
    
    // Verbindungen für Noise-Komponente
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(output);
    
    // Envelopes
    // Tone Envelope (kurzer Decay)
    toneGain.gain.setValueAtTime(params.velocity, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1 + params.decay * 0.1);
    
    // Noise Envelope (länger als Tone)
    noiseGain.gain.setValueAtTime(params.velocity * params.snappy, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1 + params.decay * 0.3);
    
    // Master Envelope
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.005);
    
    const decayTime = 0.1 + params.decay * 0.7;
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Start und Stop
    toneOsc1.start(time);
    toneOsc2.start(time);
    noise.start(time);
    
    toneOsc1.stop(time + decayTime + 0.1);
    toneOsc2.stop(time + decayTime + 0.1);
    noise.stop(time + decayTime + 0.1);
  }

  /**
   * TR-909 Snare (zwei VCOs + gefiltertes Rauschen)
   */
  private create909Snare(output: GainNode, time: number, params: any): void {
    if (!this.context) return;

    // 909 Snare: 2 VCOs + gefiltertes Rauschen
    const toneOsc1 = this.context.createOscillator();
    const toneOsc2 = this.context.createOscillator();
    toneOsc1.type = 'square';
    toneOsc2.type = 'triangle';
    
    // 909 Snare hat typischerweise höhere Frequenzen als 808
    const baseFreq = 180 + params.tuning * 120;
    toneOsc1.frequency.value = baseFreq;
    toneOsc2.frequency.value = baseFreq * 1.71; // Charakteristische Verstimmung
    
    // Tone-Distortion (typisch für 909)
    const toneDistortion = this.context.createWaveShaper();
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = Math.max(-1, Math.min(1, x * 2));
    }
    toneDistortion.curve = curve;
    
    const toneGain = this.context.createGain();
    toneGain.gain.value = (1 - params.snappy * 0.5) * params.velocity;
    
    // Noise für den "Snappy"-Teil - 909 hat "crunchigeres" Rauschen
    const noise = this.context.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(2);
    noise.buffer = noiseBuffer;
    
    // Bandpass für 909-typisches gefiltertes Rauschen
    const noiseBandpass = this.context.createBiquadFilter();
    noiseBandpass.type = 'bandpass';
    noiseBandpass.frequency.value = 2000 + params.tone * 4000;
    noiseBandpass.Q.value = 1 + params.tone * 5;
    
    const noiseGain = this.context.createGain();
    noiseGain.gain.value = params.snappy * params.velocity * 1.8;
    
    // Verbindungen
    toneOsc1.connect(toneDistortion);
    toneOsc2.connect(toneDistortion);
    toneDistortion.connect(toneGain);
    toneGain.connect(output);
    
    noise.connect(noiseBandpass);
    noiseBandpass.connect(noiseGain);
    noiseGain.connect(output);
    
    // Envelopes - 909 hat schärfere Attacks
    output.gain.setValueAtTime(0.01, time);
    output.gain.linearRampToValueAtTime(params.velocity, time + 0.001); // Fast linear attack
    
    // Tone Envelope (sehr kurz)
    toneGain.gain.setValueAtTime((1 - params.snappy * 0.5) * params.velocity, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06 + params.decay * 0.1);
    
    // Noise Envelope (länger)
    noiseGain.gain.setValueAtTime(params.velocity * params.snappy, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + params.decay * 0.5);
    
    const decayTime = 0.1 + params.decay * 0.5;
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Start und Stop
    toneOsc1.start(time);
    toneOsc2.start(time);
    noise.start(time);
    
    toneOsc1.stop(time + decayTime + 0.1);
    toneOsc2.stop(time + decayTime + 0.1);
    noise.stop(time + decayTime + 0.1);
  }

  /**
   * TR-808 Hi-Hat (sechs Rechteck-Oszillatoren)
   */
  private create808Hat(output: GainNode, time: number, params: any): void {
    if (!this.context) return;

    // 808 Hi-Hats: 6 Rechteck-Oszillatoren mit verschiedenen Frequenzen
    const oscillators: OscillatorNode[] = [];
    // Die 6 Frequenzen sind nicht harmonisch verwandt (daher der metallische Klang)
    const frequencies = [
      2000 + params.tone * 4000,
      3000 + params.tone * 5000,
      4200 + params.tone * 3500,
      5600 + params.tone * 3000,
      7000 + params.tone * 2500,
      8500 + params.tone * 2000
    ];
    
    // Mixer für die Oszillatoren
    const oscMix = this.context.createGain();
    oscMix.gain.value = 0.2; // Dämpfen, damit es nicht zu laut wird
    
    // Hochpassfilter (entfernt tieffrequenten Anteil)
    const highpass = this.context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000 + params.color * 3000;
    
    // Bandpass für charakteristischen Klang
    const bandpass = this.context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000 - params.color * 5000;
    bandpass.Q.value = 0.5 + params.color * 2;
    
    // Oszillatoren erstellen und verbinden
    for (let i = 0; i < 6; i++) {
      const osc = this.context.createOscillator();
      osc.type = 'square'; // Rechteckwellen für 808 Hi-Hats
      osc.frequency.value = frequencies[i];
      
      // Individuelle Gain für jede Frequenz
      const oscGain = this.context.createGain();
      oscGain.gain.value = 1.0 / 6.0; // Gleichmäßige Mischung
      
      osc.connect(oscGain);
      oscGain.connect(oscMix);
      
      oscillators.push(osc);
    }
    
    // Envelope - Hi-Hats haben sehr kurzes Decay
    const decayTime = 0.01 + params.decay * 0.2; // Max ~200ms für eine geschlossene HH
    
    oscMix.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(output);
    
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.001);
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Start und Stop
    oscillators.forEach(osc => {
      osc.start(time);
      osc.stop(time + decayTime + 0.05);
    });
  }

  /**
   * TR-808 Clap (gefiltertes Rauschen mit Multi-Envelope)
   */
  private create808Clap(output: GainNode, time: number, params: any): void {
    if (!this.context) return;
    
    // Rauschgenerator für 808 Clap
    const noise = this.context.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(2);
    noise.buffer = noiseBuffer;
    
    // Bandpassfilter für Clap-Charakteristik
    const bandpass = this.context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000 + params.tone * 2500;
    bandpass.Q.value = 1 + params.color * 6; // Höheres Q für engeren Frequenzbereich
    
    // Highpass um tiefe Frequenzen zu entfernen
    const highpass = this.context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 600 + params.color * 1400;
    
    // 808 Clap hat eine charakteristische "Rebound"-Envelope
    // (mehrere schnelle Pulse gefolgt von einem längeren Decay)
    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(output);
    
    // Multi-Trigger Envelope für den "Rebound"-Effekt
    const numRebounds = 4;
    const reboundSpacing = 0.006; // 6ms zwischen den Rebounds
    let currentTime = time;
    
    for (let i = 0; i < numRebounds; i++) {
      // Jeder Rebound wird etwas leiser
      const reboundGain = params.velocity * (1 - i * 0.15);
      
      output.gain.setValueAtTime(0.001, currentTime);
      output.gain.exponentialRampToValueAtTime(reboundGain, currentTime + 0.001);
      output.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.004);
      
      currentTime += reboundSpacing;
    }
    
    // Haupt-Decay nach den Rebounds
    const mainDecayStart = currentTime;
    output.gain.setValueAtTime(0.001, mainDecayStart);
    output.gain.exponentialRampToValueAtTime(params.velocity * 0.8, mainDecayStart + 0.002);
    
    const decayTime = 0.05 + params.decay * 0.7; // 808 Clap kann recht lang sein
    output.gain.exponentialRampToValueAtTime(0.001, mainDecayStart + decayTime);
    
    // Start und Stop
    noise.start(time);
    noise.stop(mainDecayStart + decayTime + 0.05);
  }

  /**
   * TR-909 Tom (VCO mit Pitch-Envelope)
   */
  private create909Tom(output: GainNode, time: number, params: any): void {
    if (!this.context) return;
    
    // Haupt-Oszillator (typischerweise Dreieck für 909 Toms)
    const osc = this.context.createOscillator();
    osc.type = 'triangle';
    
    // Frequenz basierend auf Tuning (909 Toms können sehr variiert werden)
    const baseFreq = 80 + params.tuning * 150;
    osc.frequency.setValueAtTime(baseFreq * 1.5, time); // Startet etwas höher
    osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.05);
    
    // Leichte Distortion für charakteristische 909 Toms
    const waveshaper = this.context.createWaveShaper();
    const curveAmount = 5;
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = (Math.PI + curveAmount) * x / (Math.PI + curveAmount * Math.abs(x));
    }
    waveshaper.curve = curve;
    
    // Tiefpassfilter
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(baseFreq * 8, time);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 2, time + 0.2);
    
    // Envelope
    const decayTime = 0.1 + params.decay * 0.8;
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.005);
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Verbinden
    osc.connect(waveshaper);
    waveshaper.connect(filter);
    filter.connect(output);
    
    // Start und Stop
    osc.start(time);
    osc.stop(time + decayTime + 0.1);
  }

  /**
   * FM-Synthese Drum (für metallische Percussion)
   */
  private createFMDrum(output: GainNode, time: number, params: any): void {
    if (!this.context) return;
    
    // FM-Synthese mit Carrier und Modulator
    const carrier = this.context.createOscillator();
    const modulator = this.context.createOscillator();
    
    carrier.type = 'sine';
    modulator.type = 'sine';
    
    // Basisfrequenz
    const baseFreq = 200 + params.tuning * 300;
    carrier.frequency.value = baseFreq;
    
    // Modulator-Frequenz als Verhältnis zur Carrier-Frequenz
    // (nicht harmonische Verhältnisse erzeugen metallische Klänge)
    const modRatio = 1.4 + params.color * 2.7;
    modulator.frequency.value = baseFreq * modRatio;
    
    // Modulations-Index (Intensität)
    const modIndex = params.tone * 100 + 50;
    const modGain = this.context.createGain();
    modGain.gain.setValueAtTime(modIndex, time);
    modGain.gain.exponentialRampToValueAtTime(modIndex * 0.2, time + 0.1);
    
    // FM-Routing
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(output);
    
    // Envelope
    const decayTime = 0.05 + params.decay * 0.4;
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.005);
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Start und Stop
    carrier.start(time);
    modulator.start(time);
    carrier.stop(time + decayTime + 0.1);
    modulator.stop(time + decayTime + 0.1);
  }

  /**
   * Noise-basierte Percussion (für Rauschen-Effekte)
   */
  private createNoiseDrum(output: GainNode, time: number, params: any): void {
    if (!this.context) return;
    
    // Rausch-Generator
    const noise = this.context.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(2);
    noise.buffer = noiseBuffer;
    
    // Filter (je nach Color-Parameter BandPass oder HighPass)
    const filter = this.context.createBiquadFilter();
    
    if (params.color < 0.5) {
      // Tieferer Color = Highpass für helle Sounds
      filter.type = 'highpass';
      filter.frequency.value = 2000 + params.color * 6000;
      filter.Q.value = 0.5;
    } else {
      // Höherer Color = Bandpass für spezifische Resonanz
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + (params.color - 0.5) * 10000;
      filter.Q.value = 2 + (params.color - 0.5) * 10;
    }
    
    // Envelope
    const decayTime = 0.05 + params.decay * 0.3;
    output.gain.setValueAtTime(0.01, time);
    output.gain.exponentialRampToValueAtTime(params.velocity, time + 0.001);
    output.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Verbinden
    noise.connect(filter);
    filter.connect(output);
    
    // Start und Stop
    noise.start(time);
    noise.stop(time + decayTime + 0.05);
  }

  /**
   * Update all effect parameters
   */
  private updateEffectParameters(): void {
    if (!this.context) return;
    
    this.updateDelayParameters();
    this.updateReverbParameters();
    this.updateDistortionParameters();
  }

  /**
   * Update delay effect parameters
   */
  private updateDelayParameters(): void {
    if (!this.delayNode || !this.delayFeedback || !this.delayFilter || !this.delayMix) return;

    const params = this.delayParams;
    this.delayNode.delayTime.value = params.time;
    this.delayFeedback.gain.value = params.feedback;
    this.delayFilter.frequency.value = 200 + params.filter * 15000;
    this.delayMix.gain.value = params.bypass ? 0 : params.mix;
  }

  /**
   * Update reverb effect parameters
   */
  private updateReverbParameters(): void {
    if (!this.reverbConvolver || !this.reverbPredelay || !this.reverbDamping || !this.reverbMix) return;

    const params = this.reverbParams;
    this.reverbPredelay.delayTime.value = params.predelay;
    this.reverbDamping.frequency.value = 1000 + params.damping * 18000;
    this.reverbMix.gain.value = params.bypass ? 0 : params.mix;
    
    // Generate new impulse response based on size parameter
    this.generateReverbImpulse(params.size);
  }

  /**
   * Update distortion effect parameters
   */
  private updateDistortionParameters(): void {
    if (!this.distortion || !this.distortionPreFilter || !this.distortionPostFilter || !this.distortionMix) return;

    const params = this.distortionParams;
    this.distortionPreFilter.frequency.value = 20 + params.tone * 19980;
    this.distortionPostFilter.frequency.value = 200 + params.tone * 10000;
    this.distortionMix.gain.value = params.bypass ? 0 : params.mix;

    // Update distortion curve based on character and drive
    this.updateDistortionCurve(params.character, params.drive);
  }

  /**
   * Generate reverb impulse response
   */
  private generateReverbImpulse(size: number): void {
    if (!this.context || !this.reverbConvolver) return;

    const sampleRate = this.context.sampleRate;
    const length = Math.floor(size * 2 * sampleRate); // 0.1 to 2 seconds
    const decay = size * 2;
    
    const impulse = this.context.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const amplitude = Math.exp(-t / decay) * (1 - t / (length / sampleRate));
      
      // Add some randomness and stereo width
      leftChannel[i] = (Math.random() * 2 - 1) * amplitude;
      rightChannel[i] = (Math.random() * 2 - 1) * amplitude;
    }

    this.reverbConvolver.buffer = impulse;
  }

  /**
   * Update distortion curve based on character and drive
   */
  private updateDistortionCurve(character: 'soft' | 'hard' | 'fold', drive: number): void {
    if (!this.context || !this.distortion) return;

    const samples = 44100;
    const curve = new Float32Array(samples);
    const amount = 1 + drive * 100;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      let y = x;

      switch (character) {
        case 'soft':
          // Smooth saturation curve
          y = Math.tanh(x * amount);
          break;
        
        case 'hard':
          // Hard clipping
          y = Math.max(-1, Math.min(1, x * amount));
          break;
        
        case 'fold':
          // Wavefolding distortion
          y = Math.sin(x * amount * Math.PI / 2);
          break;
      }

      curve[i] = y;
    }

    this.distortion.curve = curve;
  }

  /**
   * Set delay parameters
   */
  setDelayParams(params: Partial<DelayParams>): void {
    this.delayParams = { ...this.delayParams, ...params };
    this.updateDelayParameters();
  }

  /**
   * Set reverb parameters
   */
  setReverbParams(params: Partial<ReverbParams>): void {
    this.reverbParams = { ...this.reverbParams, ...params };
    this.updateReverbParameters();
  }

  /**
   * Set distortion parameters
   */
  setDistortionParams(params: Partial<DistortionParams>): void {
    this.distortionParams = { ...this.distortionParams, ...params };
    this.updateDistortionParameters();
  }
}

// Create a singleton instance of the audio engine
const audioEngine = new AudioEngine();

export default audioEngine;