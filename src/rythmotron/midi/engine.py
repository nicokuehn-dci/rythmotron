"""
MIDI engine for RythmoTron.
Handles MIDI device selection, input/output, and message processing.
"""

import mido
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from ..utils.context import RythmContext

@dataclass
class MIDIDevice:
    """Represents a MIDI device with its properties."""
    id: str
    name: str
    is_input: bool
    is_output: bool

class MIDIEngine:
    """Handles MIDI device management and communication."""
    
    def __init__(self, context: RythmContext):
        self.context = context
        self.input_ports: Dict[str, mido.ports.BaseInput] = {}
        self.output_ports: Dict[str, mido.ports.BaseOutput] = {}
        self.active_inputs: Set[str] = set()
        self.active_outputs: Set[str] = set()
        
        # Initialize available devices
        self.input_devices: Dict[str, MIDIDevice] = {}
        self.output_devices: Dict[str, MIDIDevice] = {}
        self._scan_devices()
    
    def _scan_devices(self):
        """Scan for available MIDI devices."""
        # Input devices
        for port in mido.get_input_names():
            device = MIDIDevice(
                id=port,
                name=port,
                is_input=True,
                is_output=False
            )
            self.input_devices[port] = device
        
        # Output devices
        for port in mido.get_output_names():
            device = MIDIDevice(
                id=port,
                name=port,
                is_input=False,
                is_output=True
            )
            self.output_devices[port] = device
    
    def get_input_devices(self) -> List[MIDIDevice]:
        """Get list of available input devices."""
        return list(self.input_devices.values())
    
    def get_output_devices(self) -> List[MIDIDevice]:
        """Get list of available output devices."""
        return list(self.output_devices.values())
    
    def open_input(self, device_id: str):
        """Open a MIDI input port."""
        if device_id in self.input_devices and device_id not in self.active_inputs:
            try:
                port = mido.open_input(device_id, callback=self._handle_midi_input)
                self.input_ports[device_id] = port
                self.active_inputs.add(device_id)
            except Exception as e:
                print(f"Error opening MIDI input {device_id}: {e}")
    
    def close_input(self, device_id: str):
        """Close a MIDI input port."""
        if device_id in self.active_inputs:
            try:
                port = self.input_ports[device_id]
                port.close()
                del self.input_ports[device_id]
                self.active_inputs.remove(device_id)
            except Exception as e:
                print(f"Error closing MIDI input {device_id}: {e}")
    
    def open_output(self, device_id: str):
        """Open a MIDI output port."""
        if device_id in self.output_devices and device_id not in self.active_outputs:
            try:
                port = mido.open_output(device_id)
                self.output_ports[device_id] = port
                self.active_outputs.add(device_id)
            except Exception as e:
                print(f"Error opening MIDI output {device_id}: {e}")
    
    def close_output(self, device_id: str):
        """Close a MIDI output port."""
        if device_id in self.active_outputs:
            try:
                port = self.output_ports[device_id]
                port.close()
                del self.output_ports[device_id]
                self.active_outputs.remove(device_id)
            except Exception as e:
                print(f"Error closing MIDI output {device_id}: {e}")
    
    def send_message(self, device_id: str, message: mido.Message):
        """Send a MIDI message to a specific output device."""
        if device_id in self.active_outputs:
            try:
                port = self.output_ports[device_id]
                port.send(message)
            except Exception as e:
                print(f"Error sending MIDI message to {device_id}: {e}")
    
    def _handle_midi_input(self, message: mido.Message):
        """Handle incoming MIDI messages."""
        if message.type == 'note_on' and message.velocity > 0:
            # Handle note on messages
            self._handle_note_on(message)
        elif message.type == 'note_off' or (message.type == 'note_on' and message.velocity == 0):
            # Handle note off messages
            self._handle_note_off(message)
        elif message.type == 'control_change':
            # Handle control change messages
            self._handle_control_change(message)
    
    def _handle_note_on(self, message: mido.Message):
        """Handle note on messages."""
        # TODO: Implement note on handling
        # This could trigger steps, change patterns, etc.
        pass
    
    def _handle_note_off(self, message: mido.Message):
        """Handle note off messages."""
        # TODO: Implement note off handling
        pass
    
    def _handle_control_change(self, message: mido.Message):
        """Handle control change messages."""
        # TODO: Implement control change handling
        # This could control parameters, tempo, etc.
        pass
    
    def close_all(self):
        """Close all MIDI ports."""
        for device_id in list(self.active_inputs):
            self.close_input(device_id)
        for device_id in list(self.active_outputs):
            this.close_output(device_id) 