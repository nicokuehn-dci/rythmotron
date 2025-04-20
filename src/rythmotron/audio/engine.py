"""
Audio engine for RythmoTron.
Handles sound card selection, audio processing, and playback.
"""

import sounddevice as sd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from ..utils.context import RythmContext

@dataclass
class AudioDevice:
    """Represents an audio device with its properties."""
    id: int
    name: str
    input_channels: int
    output_channels: int
    default_sample_rate: float
    is_input: bool
    is_output: bool

class AudioEngine:
    """Handles audio device management and playback."""
    
    def __init__(self, context: RythmContext):
        self.context = context
        self.input_device: Optional[AudioDevice] = None
        self.output_device: Optional[AudioDevice] = None
        self.sample_rate: float = 44100
        self.block_size: int = 256
        self.stream: Optional[sd.OutputStream] = None
        self.is_running: bool = False
        
        # Initialize available devices
        self.input_devices: Dict[int, AudioDevice] = {}
        self.output_devices: Dict[int, AudioDevice] = {}
        self._scan_devices()
    
    def _scan_devices(self):
        """Scan for available audio devices."""
        devices = sd.query_devices()
        
        for i, device in enumerate(devices):
            audio_device = AudioDevice(
                id=i,
                name=device['name'],
                input_channels=device['max_input_channels'],
                output_channels=device['max_output_channels'],
                default_sample_rate=device['default_samplerate'],
                is_input=device['max_input_channels'] > 0,
                is_output=device['max_output_channels'] > 0
            )
            
            if audio_device.is_input:
                self.input_devices[i] = audio_device
            if audio_device.is_output:
                self.output_devices[i] = audio_device
    
    def get_input_devices(self) -> List[AudioDevice]:
        """Get list of available input devices."""
        return list(self.input_devices.values())
    
    def get_output_devices(self) -> List[AudioDevice]:
        """Get list of available output devices."""
        return list(self.output_devices.values())
    
    def set_input_device(self, device_id: int):
        """Set the input device."""
        if device_id in self.input_devices:
            self.input_device = self.input_devices[device_id]
            self._restart_stream()
    
    def set_output_device(self, device_id: int):
        """Set the output device."""
        if device_id in self.output_devices:
            self.output_device = self.output_devices[device_id]
            self._restart_stream()
    
    def set_sample_rate(self, rate: float):
        """Set the sample rate."""
        self.sample_rate = rate
        self._restart_stream()
    
    def set_block_size(self, size: int):
        """Set the audio block size."""
        self.block_size = size
        self._restart_stream()
    
    def start(self):
        """Start the audio engine."""
        if not self.is_running and self.output_device:
            try:
                self.stream = sd.OutputStream(
                    device=self.output_device.id,
                    channels=2,  # Stereo output
                    samplerate=self.sample_rate,
                    blocksize=self.block_size,
                    callback=self._audio_callback
                )
                self.stream.start()
                self.is_running = True
            except Exception as e:
                print(f"Error starting audio engine: {e}")
    
    def stop(self):
        """Stop the audio engine."""
        if self.is_running and self.stream:
            try:
                self.stream.stop()
                self.stream.close()
                self.stream = None
                self.is_running = False
            except Exception as e:
                print(f"Error stopping audio engine: {e}")
    
    def _restart_stream(self):
        """Restart the audio stream with new settings."""
        was_running = self.is_running
        if was_running:
            self.stop()
            self.start()
    
    def _audio_callback(self, outdata: np.ndarray, frames: int, 
                       time_info: Dict, status: sd.CallbackFlags):
        """Audio callback function for processing and output."""
        if status:
            print(f"Audio callback status: {status}")
        
        # Get current pattern and step
        pattern = self.context.get_current_pattern()
        current_step = self.context.current_step
        
        # Process audio for each track
        for track in self.context.tracks:
            if pattern.steps[current_step].triggers[track]:
                # TODO: Generate and mix audio for triggered tracks
                pass
        
        # Ensure output is in correct format
        if outdata.shape[1] != 2:  # Ensure stereo output
            outdata = np.zeros((frames, 2), dtype=np.float32) 