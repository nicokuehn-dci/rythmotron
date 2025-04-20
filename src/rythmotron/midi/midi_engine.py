"""
MIDI engine for RythmoTron.
"""

import time
from typing import Dict, List, Optional, Callable, Any, Tuple
from dataclasses import dataclass
from PySide6.QtCore import QObject, Signal, Slot, QTimer

try:
    import mido
    MIDO_AVAILABLE = True
except ImportError:
    MIDO_AVAILABLE = False
    print("Warning: mido not available. MIDI functionality will be disabled.")

@dataclass
class MIDIMapping:
    """Represents a MIDI mapping for a control."""
    name: str
    device_name: str
    channel: int
    control_type: str  # 'note', 'cc', 'pitchbend', 'program'
    control_number: int
    min_value: float = 0.0
    max_value: float = 1.0
    invert: bool = False
    callback: Optional[Callable[[float], None]] = None

class MIDIEngine(QObject):
    """MIDI engine for handling MIDI input and output."""
    
    # Signals
    midi_received = Signal(str, int, int, int)  # device_name, channel, control_type, value
    device_connected = Signal(str)
    device_disconnected = Signal(str)
    mapping_added = Signal(str)
    mapping_removed = Signal(str)
    
    def __init__(self, parent=None):
        """Initialize the MIDI engine.
        
        Args:
            parent: Parent object
        """
        super().__init__(parent)
        
        # MIDI state
        self.enabled = False
        self.input_ports = {}
        self.output_ports = {}
        self.mappings = {}  # name -> MIDIMapping
        self.learning = False
        self.learn_target = None
        
        # Default mappings for common controllers
        self.default_mappings = {
            'push': {
                'play': MIDIMapping('play', 'Ableton Push', 0, 'note', 85),
                'stop': MIDIMapping('stop', 'Ableton Push', 0, 'note', 86),
                'record': MIDIMapping('record', 'Ableton Push', 0, 'note', 87),
                'tempo_up': MIDIMapping('tempo_up', 'Ableton Push', 0, 'note', 88),
                'tempo_down': MIDIMapping('tempo_down', 'Ableton Push', 0, 'note', 89),
                'track_1': MIDIMapping('track_1', 'Ableton Push', 0, 'note', 60),
                'track_2': MIDIMapping('track_2', 'Ableton Push', 0, 'note', 61),
                'track_3': MIDIMapping('track_3', 'Ableton Push', 0, 'note', 62),
                'track_4': MIDIMapping('track_4', 'Ableton Push', 0, 'note', 63),
                'track_5': MIDIMapping('track_5', 'Ableton Push', 0, 'note', 64),
                'track_6': MIDIMapping('track_6', 'Ableton Push', 0, 'note', 65),
                'track_7': MIDIMapping('track_7', 'Ableton Push', 0, 'note', 66),
                'track_8': MIDIMapping('track_8', 'Ableton Push', 0, 'note', 67),
                'fader_1': MIDIMapping('fader_1', 'Ableton Push', 0, 'cc', 14),
                'fader_2': MIDIMapping('fader_2', 'Ableton Push', 0, 'cc', 15),
                'fader_3': MIDIMapping('fader_3', 'Ableton Push', 0, 'cc', 16),
                'fader_4': MIDIMapping('fader_4', 'Ableton Push', 0, 'cc', 17),
                'fader_5': MIDIMapping('fader_5', 'Ableton Push', 0, 'cc', 18),
                'fader_6': MIDIMapping('fader_6', 'Ableton Push', 0, 'cc', 19),
                'fader_7': MIDIMapping('fader_7', 'Ableton Push', 0, 'cc', 20),
                'fader_8': MIDIMapping('fader_8', 'Ableton Push', 0, 'cc', 21),
            },
            'mpc': {
                'play': MIDIMapping('play', 'Akai MPC', 0, 'note', 24),
                'stop': MIDIMapping('stop', 'Akai MPC', 0, 'note', 25),
                'record': MIDIMapping('record', 'Akai MPC', 0, 'note', 26),
                'pad_1': MIDIMapping('pad_1', 'Akai MPC', 0, 'note', 36),
                'pad_2': MIDIMapping('pad_2', 'Akai MPC', 0, 'note', 37),
                'pad_3': MIDIMapping('pad_3', 'Akai MPC', 0, 'note', 38),
                'pad_4': MIDIMapping('pad_4', 'Akai MPC', 0, 'note', 39),
                'pad_5': MIDIMapping('pad_5', 'Akai MPC', 0, 'note', 40),
                'pad_6': MIDIMapping('pad_6', 'Akai MPC', 0, 'note', 41),
                'pad_7': MIDIMapping('pad_7', 'Akai MPC', 0, 'note', 42),
                'pad_8': MIDIMapping('pad_8', 'Akai MPC', 0, 'note', 43),
                'fader_1': MIDIMapping('fader_1', 'Akai MPC', 0, 'cc', 10),
                'fader_2': MIDIMapping('fader_2', 'Akai MPC', 0, 'cc', 11),
                'fader_3': MIDIMapping('fader_3', 'Akai MPC', 0, 'cc', 12),
                'fader_4': MIDIMapping('fader_4', 'Akai MPC', 0, 'cc', 13),
            },
            'keyboard': {
                'play': MIDIMapping('play', 'Generic Keyboard', 0, 'note', 24),
                'stop': MIDIMapping('stop', 'Generic Keyboard', 0, 'note', 25),
                'record': MIDIMapping('record', 'Generic Keyboard', 0, 'note', 26),
                'mod_wheel': MIDIMapping('mod_wheel', 'Generic Keyboard', 0, 'cc', 1),
                'pitch_bend': MIDIMapping('pitch_bend', 'Generic Keyboard', 0, 'pitchbend', 0),
            }
        }
        
        # Set up update timer
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self._check_ports)
        self.update_timer.start(1000)  # Check ports every second
    
    def initialize(self):
        """Initialize the MIDI engine."""
        if not MIDO_AVAILABLE:
            print("MIDI functionality disabled: mido not available")
            return False
        
        try:
            # Get available ports
            self._update_ports()
            
            # Enable MIDI
            self.enabled = True
            return True
        except Exception as e:
            print(f"Failed to initialize MIDI: {str(e)}")
            return False
    
    def shutdown(self):
        """Shutdown the MIDI engine."""
        self.enabled = False
        
        # Close all ports
        for port in self.input_ports.values():
            try:
                port.close()
            except:
                pass
        
        for port in self.output_ports.values():
            try:
                port.close()
            except:
                pass
        
        self.input_ports = {}
        self.output_ports = {}
    
    def _update_ports(self):
        """Update the list of available MIDI ports."""
        if not MIDO_AVAILABLE:
            return
        
        # Get current port names
        current_inputs = set(self.input_ports.keys())
        current_outputs = set(self.output_ports.values())
        
        # Get available ports
        available_inputs = set(mido.get_input_names())
        available_outputs = set(mido.get_output_names())
        
        # Close removed ports
        for name in current_inputs - available_inputs:
            try:
                self.input_ports[name].close()
                del self.input_ports[name]
                self.device_disconnected.emit(name)
            except:
                pass
        
        for name in current_outputs - available_outputs:
            try:
                self.output_ports[name].close()
                del self.output_ports[name]
            except:
                pass
        
        # Open new ports
        for name in available_inputs - current_inputs:
            try:
                port = mido.open_input(name, callback=self._on_midi_message)
                self.input_ports[name] = port
                self.device_connected.emit(name)
            except:
                pass
        
        for name in available_outputs - current_outputs:
            try:
                port = mido.open_output(name)
                self.output_ports[name] = port
            except:
                pass
    
    def _check_ports(self):
        """Check for new or removed MIDI ports."""
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        self._update_ports()
    
    def _on_midi_message(self, message):
        """Handle incoming MIDI messages.
        
        Args:
            message: MIDI message
        """
        if not self.enabled:
            return
        
        # Get port name
        port_name = message.port
        
        # Handle different message types
        if message.type == 'note_on' and message.velocity > 0:
            self.midi_received.emit(port_name, message.channel, 'note', message.note)
            
            # Check if in learning mode
            if self.learning and self.learn_target:
                self._learn_mapping(port_name, message.channel, 'note', message.note)
                
        elif message.type == 'note_off' or (message.type == 'note_on' and message.velocity == 0):
            self.midi_received.emit(port_name, message.channel, 'note_off', message.note)
            
        elif message.type == 'control_change':
            self.midi_received.emit(port_name, message.channel, 'cc', message.control)
            
            # Check if in learning mode
            if self.learning and self.learn_target:
                self._learn_mapping(port_name, message.channel, 'cc', message.control)
                
        elif message.type == 'pitchwheel':
            self.midi_received.emit(port_name, message.channel, 'pitchbend', message.pitch)
            
            # Check if in learning mode
            if self.learning and self.learn_target:
                self._learn_mapping(port_name, message.channel, 'pitchbend', 0)
                
        elif message.type == 'program_change':
            self.midi_received.emit(port_name, message.channel, 'program', message.program)
            
            # Check if in learning mode
            if self.learning and self.learn_target:
                self._learn_mapping(port_name, message.channel, 'program', message.program)
    
    def _learn_mapping(self, device_name, channel, control_type, control_number):
        """Learn a new MIDI mapping.
        
        Args:
            device_name: MIDI device name
            channel: MIDI channel
            control_type: Control type (note, cc, pitchbend, program)
            control_number: Control number
        """
        if not self.learn_target:
            return
        
        # Create new mapping
        mapping = MIDIMapping(
            name=self.learn_target,
            device_name=device_name,
            channel=channel,
            control_type=control_type,
            control_number=control_number
        )
        
        # Add mapping
        self.add_mapping(mapping)
        
        # Exit learning mode
        self.learning = False
        self.learn_target = None
    
    def start_learning(self, target_name):
        """Start MIDI learning mode.
        
        Args:
            target_name: Name of the target to learn
        """
        self.learning = True
        self.learn_target = target_name
    
    def stop_learning(self):
        """Stop MIDI learning mode."""
        self.learning = False
        self.learn_target = None
    
    def add_mapping(self, mapping):
        """Add a MIDI mapping.
        
        Args:
            mapping: MIDI mapping
        """
        self.mappings[mapping.name] = mapping
        self.mapping_added.emit(mapping.name)
    
    def remove_mapping(self, name):
        """Remove a MIDI mapping.
        
        Args:
            name: Mapping name
        """
        if name in self.mappings:
            del self.mappings[name]
            self.mapping_removed.emit(name)
    
    def get_mapping(self, name):
        """Get a MIDI mapping.
        
        Args:
            name: Mapping name
            
        Returns:
            MIDI mapping or None if not found
        """
        return self.mappings.get(name)
    
    def get_mappings(self):
        """Get all MIDI mappings.
        
        Returns:
            Dictionary of mappings
        """
        return self.mappings
    
    def load_default_mappings(self, controller_type):
        """Load default mappings for a controller type.
        
        Args:
            controller_type: Controller type (push, mpc, keyboard)
        """
        if controller_type in self.default_mappings:
            for name, mapping in self.default_mappings[controller_type].items():
                self.add_mapping(mapping)
    
    def send_message(self, device_name, message):
        """Send a MIDI message.
        
        Args:
            device_name: MIDI device name
            message: MIDI message
        """
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        if device_name in self.output_ports:
            try:
                self.output_ports[device_name].send(message)
            except:
                pass
    
    def send_note(self, device_name, channel, note, velocity, duration=0.1):
        """Send a MIDI note.
        
        Args:
            device_name: MIDI device name
            channel: MIDI channel
            note: Note number
            velocity: Note velocity
            duration: Note duration in seconds
        """
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        if device_name in self.output_ports:
            try:
                # Send note on
                note_on = mido.Message('note_on', channel=channel, note=note, velocity=velocity)
                self.output_ports[device_name].send(note_on)
                
                # Send note off after duration
                if duration > 0:
                    time.sleep(duration)
                    note_off = mido.Message('note_off', channel=channel, note=note, velocity=0)
                    self.output_ports[device_name].send(note_off)
            except:
                pass
    
    def send_control_change(self, device_name, channel, control, value):
        """Send a MIDI control change.
        
        Args:
            device_name: MIDI device name
            channel: MIDI channel
            control: Control number
            value: Control value
        """
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        if device_name in self.output_ports:
            try:
                message = mido.Message('control_change', channel=channel, control=control, value=value)
                self.output_ports[device_name].send(message)
            except:
                pass
    
    def send_program_change(self, device_name, channel, program):
        """Send a MIDI program change.
        
        Args:
            device_name: MIDI device name
            channel: MIDI channel
            program: Program number
        """
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        if device_name in self.output_ports:
            try:
                message = mido.Message('program_change', channel=channel, program=program)
                self.output_ports[device_name].send(message)
            except:
                pass
    
    def send_pitch_bend(self, device_name, channel, value):
        """Send a MIDI pitch bend.
        
        Args:
            device_name: MIDI device name
            channel: MIDI channel
            value: Pitch bend value (-8192 to 8191)
        """
        if not MIDO_AVAILABLE or not self.enabled:
            return
        
        if device_name in self.output_ports:
            try:
                message = mido.Message('pitchwheel', channel=channel, pitch=value)
                self.output_ports[device_name].send(message)
            except:
                pass
    
    def get_input_devices(self):
        """Get list of available MIDI input devices.
        
        Returns:
            List of device names
        """
        if not MIDO_AVAILABLE:
            return []
        
        return list(self.input_ports.keys())
    
    def get_output_devices(self):
        """Get list of available MIDI output devices.
        
        Returns:
            List of device names
        """
        if not MIDO_AVAILABLE:
            return []
        
        return list(self.output_ports.keys())
    
    def is_device_connected(self, device_name):
        """Check if a MIDI device is connected.
        
        Args:
            device_name: MIDI device name
            
        Returns:
            True if device is connected
        """
        return device_name in self.input_ports or device_name in self.output_ports 