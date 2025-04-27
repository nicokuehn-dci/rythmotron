/**
 * MIDIService.ts
 * Handles MIDI input/output for Rythmotron
 */

// Define event types to handle different MIDI messages
export type MIDINoteEvent = {
  type: 'noteOn' | 'noteOff';
  note: number;
  velocity: number;
  channel: number;
};

export type MIDIControlEvent = {
  type: 'cc';
  controller: number;
  value: number;
  channel: number;
};

export type MIDIPitchBendEvent = {
  type: 'pitchBend';
  value: number; // Normalized to -1 to +1 range
  channel: number;
};

export type MIDIClockEvent = {
  type: 'clock' | 'start' | 'stop' | 'continue';
};

export type MIDIEvent = MIDINoteEvent | MIDIControlEvent | MIDIPitchBendEvent | MIDIClockEvent | {
  type: 'unknown';
  data: number[];
};

// Define MIDI event listener type
export type MIDIEventListener = (event: MIDIEvent) => void;

class MIDIService {
  private midiAccess: WebMidi.MIDIAccess | null = null;
  private inputs: Map<string, WebMidi.MIDIInput> = new Map();
  private outputs: Map<string, WebMidi.MIDIOutput> = new Map();
  private activeInput: WebMidi.MIDIInput | null = null;
  private activeOutput: WebMidi.MIDIOutput | null = null;
  private eventListeners: MIDIEventListener[] = [];
  private isInitialized = false;

  constructor() {
    // Constructor intentionally left empty - initialization happens on demand
  }

  /**
   * Initialize MIDI access
   */
  async initialize(): Promise<boolean> {
    // Only initialize once
    if (this.isInitialized) return true;

    try {
      if (!navigator.requestMIDIAccess) {
        console.error('Web MIDI API is not supported in this browser');
        return false;
      }

      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      
      // Set up event handlers for MIDI device connections/disconnections
      this.midiAccess.onstatechange = this.handleStateChange.bind(this);
      
      // Initialize input and output maps
      this.updateDeviceLists();
      
      this.isInitialized = true;
      console.log('MIDI Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize MIDI Service:', error);
      return false;
    }
  }

  /**
   * Update the list of available MIDI inputs and outputs
   */
  private updateDeviceLists(): void {
    if (!this.midiAccess) return;

    // Clear existing maps
    this.inputs.clear();
    this.outputs.clear();

    // Update inputs
    this.midiAccess.inputs.forEach((input) => {
      this.inputs.set(input.id, input);
    });

    // Update outputs
    this.midiAccess.outputs.forEach((output) => {
      this.outputs.set(output.id, output);
    });
  }

  /**
   * Handle MIDI device connection state changes
   */
  private handleStateChange(event: WebMidi.MIDIConnectionEvent): void {
    console.log(`MIDI connection state change: ${event.port.name} - ${event.port.state}`);
    
    // Update device lists when devices connect/disconnect
    this.updateDeviceLists();
  }

  /**
   * Get list of available MIDI inputs
   */
  getInputs(): { id: string; name: string }[] {
    const result: { id: string; name: string }[] = [];
    this.inputs.forEach((input, id) => {
      result.push({
        id,
        name: input.name || `Unknown MIDI Input (${id})`,
      });
    });
    return result;
  }

  /**
   * Get list of available MIDI outputs
   */
  getOutputs(): { id: string; name: string }[] {
    const result: { id: string; name: string }[] = [];
    this.outputs.forEach((output, id) => {
      result.push({
        id,
        name: output.name || `Unknown MIDI Output (${id})`,
      });
    });
    return result;
  }

  /**
   * Set active MIDI input device
   */
  setActiveInput(inputId: string): boolean {
    // Remove message handler from previous input
    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
    }

    const input = this.inputs.get(inputId);
    if (!input) {
      console.error(`MIDI input with ID ${inputId} not found`);
      this.activeInput = null;
      return false;
    }

    // Set new active input
    this.activeInput = input;
    input.onmidimessage = this.handleMIDIMessage.bind(this);
    console.log(`Active MIDI input set to: ${input.name}`);
    return true;
  }

  /**
   * Set active MIDI output device
   */
  setActiveOutput(outputId: string): boolean {
    const output = this.outputs.get(outputId);
    if (!output) {
      console.error(`MIDI output with ID ${outputId} not found`);
      this.activeOutput = null;
      return false;
    }

    this.activeOutput = output;
    console.log(`Active MIDI output set to: ${output.name}`);
    return true;
  }

  /**
   * Handle incoming MIDI messages
   */
  private handleMIDIMessage(event: WebMidi.MIDIMessageEvent): void {
    const parsedEvent = this.parseMIDIMessage(event);
    
    // Notify all registered event listeners
    this.eventListeners.forEach(listener => {
      listener(parsedEvent);
    });
  }

  /**
   * Parse MIDI message data into a more usable format
   */
  private parseMIDIMessage(event: WebMidi.MIDIMessageEvent): MIDIEvent {
    const data = event.data;
    const statusByte = data[0];
    const channel = statusByte & 0x0F;
    const type = statusByte & 0xF0;

    // Note on
    if (type === 0x90 && data[2] > 0) {
      return {
        type: 'noteOn',
        note: data[1],
        velocity: data[2],
        channel
      };
    }

    // Note off (also note on with velocity 0)
    if (type === 0x80 || (type === 0x90 && data[2] === 0)) {
      return {
        type: 'noteOff',
        note: data[1],
        velocity: type === 0x80 ? data[2] : 0,
        channel
      };
    }

    // Control Change
    if (type === 0xB0) {
      return {
        type: 'cc',
        controller: data[1],
        value: data[2],
        channel
      };
    }

    // Pitch Bend
    if (type === 0xE0) {
      // Convert 14-bit value to range -1 to +1
      const value = ((data[2] << 7) | data[1]) / 8192 - 1;
      return {
        type: 'pitchBend',
        value,
        channel
      };
    }

    // System Real-Time messages
    if (statusByte === 0xF8) {
      return { type: 'clock' };
    }
    if (statusByte === 0xFA) {
      return { type: 'start' };
    }
    if (statusByte === 0xFB) {
      return { type: 'continue' };
    }
    if (statusByte === 0xFC) {
      return { type: 'stop' };
    }

    // Unknown message type
    return {
      type: 'unknown',
      data: Array.from(data)
    };
  }

  /**
   * Register a listener for MIDI events
   */
  addEventListener(callback: MIDIEventListener): void {
    this.eventListeners.push(callback);
  }

  /**
   * Remove a listener for MIDI events
   */
  removeEventListener(callback: MIDIEventListener): void {
    const index = this.eventListeners.indexOf(callback);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Send a MIDI message to the active output
   */
  sendMIDIMessage(data: number[]): boolean {
    if (!this.activeOutput) {
      console.error('No active MIDI output device');
      return false;
    }

    try {
      this.activeOutput.send(data);
      return true;
    } catch (error) {
      console.error('Failed to send MIDI message:', error);
      return false;
    }
  }

  /**
   * Send a Note On message
   */
  sendNoteOn(note: number, velocity: number = 127, channel: number = 0): boolean {
    return this.sendMIDIMessage([0x90 | channel, note, velocity]);
  }

  /**
   * Send a Note Off message
   */
  sendNoteOff(note: number, velocity: number = 0, channel: number = 0): boolean {
    return this.sendMIDIMessage([0x80 | channel, note, velocity]);
  }

  /**
   * Send a Control Change message
   */
  sendCC(controller: number, value: number, channel: number = 0): boolean {
    return this.sendMIDIMessage([0xB0 | channel, controller, value]);
  }

  /**
   * Check if Web MIDI API is supported in this browser
   */
  static isSupported(): boolean {
    return navigator.requestMIDIAccess !== undefined;
  }
}

// Create a singleton instance for the application
const midiService = new MIDIService();

export default midiService;