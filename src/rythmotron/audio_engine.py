"""
RythmoTron - Audio Engine

This module provides the audio processing and sequencing capabilities for the RythmoTron.
It handles sound generation, sample playback, and sequencer timing.
"""

import numpy as np
import sounddevice as sd
import soundfile as sf
import threading
import time
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
import queue

from .models import Project, Pattern, Kit, Sound, Sample, Trig, Track
from .constants import SAMPLE_RATE, BUFFER_SIZE, DEFAULT_BPM, DEFAULT_VOLUME


@dataclass
class PlaybackState:
    """Represents the current playback state of the sequencer."""
    playing: bool = False
    current_step: int = 0
    current_pattern_index: int = 0
    current_kit_id: Optional[str] = None
    bpm: float = DEFAULT_BPM
    volume: float = DEFAULT_VOLUME


class AudioEngine:
    """Handles audio playback, sample loading, and sequencing."""
    
    def __init__(self):
        self.playback_state = PlaybackState()
        self.current_project: Optional[Project] = None
        self.current_pattern: Optional[Pattern] = None
        self.output_buffer = np.zeros((BUFFER_SIZE, 2), dtype=np.float32)
        
        # Audio callback queue for communication between audio and UI threads
        self.audio_queue = queue.Queue()
        
        # Step change callback
        self.on_step_change: Optional[Callable[[int], None]] = None
        
        # Audio thread and lock
        self.audio_thread = None
        self.audio_lock = threading.Lock()
        self.stream = None
    
    def initialize(self):
        """Initialize the audio engine and start the audio thread."""
        try:
            self.stream = sd.OutputStream(
                samplerate=SAMPLE_RATE,
                blocksize=BUFFER_SIZE,
                channels=2,
                callback=self._audio_callback
            )
            self.stream.start()
            print("Audio engine initialized successfully.")
        except Exception as e:
            print(f"Error initializing audio engine: {e}")
    
    def shutdown(self):
        """Shut down the audio engine."""
        if self.stream:
            self.stream.stop()
            self.stream.close()
            print("Audio engine shut down.")
    
    def _audio_callback(self, outdata, frames, time_info, status):
        """Audio callback function called by sounddevice."""
        if status:
            print(f"Audio callback status: {status}")
        
        # Process any pending commands from the UI thread
        self._process_audio_queue()
        
        # Generate audio
        if self.playback_state.playing and self.current_pattern:
            # Calculate timing
            samples_per_step = self._get_samples_per_step()
            step_samples_elapsed = int(self.playback_state.current_step * samples_per_step) % int(self.current_pattern.length * samples_per_step)
            
            # Clear output buffer
            self.output_buffer.fill(0)
            
            # Check if we need to advance to the next step
            if step_samples_elapsed + frames >= samples_per_step:
                # Advance to next step
                self.playback_state.current_step = (self.playback_state.current_step + 1) % self.current_pattern.length
                
                # Notify UI of step change (in a thread-safe way)
                if self.on_step_change:
                    try:
                        self.audio_queue.put(("step_change", self.playback_state.current_step))
                    except Exception as e:
                        print(f"Error notifying step change: {e}")
                
                # Trigger sounds for this step
                if self.current_project:
                    kit = self.current_project.get_kit_by_id(self.current_pattern.kit_id) if self.current_pattern.kit_id else None
                    if kit:
                        self._trigger_step_sounds(self.playback_state.current_step, kit)
            
            # Apply overall volume
            self.output_buffer *= self.playback_state.volume
            
            # Copy to output
            outdata[:] = self.output_buffer
        else:
            # Not playing, output silence
            outdata.fill(0)
    
    def _process_audio_queue(self):
        """Process any pending commands from the UI thread."""
        try:
            while not self.audio_queue.empty():
                command, data = self.audio_queue.get_nowait()
                
                if command == "play":
                    self.playback_state.playing = True
                elif command == "stop":
                    self.playback_state.playing = False
                    self.playback_state.current_step = 0
                elif command == "bpm":
                    self.playback_state.bpm = data
                elif command == "volume":
                    self.playback_state.volume = data
                elif command == "pattern":
                    self.current_pattern = data
                elif command == "project":
                    self.current_project = data
                    
                self.audio_queue.task_done()
        except queue.Empty:
            pass
        except Exception as e:
            print(f"Error processing audio queue: {e}")
    
    def _get_samples_per_step(self) -> float:
        """Calculate samples per step based on BPM."""
        beats_per_second = self.playback_state.bpm / 60.0
        steps_per_beat = 4  # assuming 16th notes (4 steps per beat)
        steps_per_second = beats_per_second * steps_per_beat
        return SAMPLE_RATE / steps_per_second
    
    def _trigger_step_sounds(self, step: int, kit: Kit):
        """Trigger sounds for the current step."""
        if not self.current_pattern:
            return
            
        for track, trigs in self.current_pattern.track_trigs.items():
            # Find trig at this step if any
            trig = None
            for t in trigs:
                if t.step == step:
                    trig = t
                    break
            
            if trig and trig.should_trigger(step):
                sound = kit.track_sounds.get(track)
                if sound and sound.sample and sound.sample.audio_data is not None:
                    self._play_sample(sound.sample, trig.velocity / 100.0)
    
    def _play_sample(self, sample: Sample, velocity: float = 1.0):
        """Play a sample at the given velocity."""
        if sample.audio_data is None:
            return
            
        # Get the portion of audio data to play
        start = sample.start_point
        end = sample.end_point if sample.end_point is not None else len(sample.audio_data)
        
        audio_data = sample.audio_data[start:end]
        
        # If stereo, use as is; if mono, duplicate to both channels
        if len(audio_data.shape) == 1:
            stereo_data = np.column_stack((audio_data, audio_data))
        else:
            stereo_data = audio_data
        
        # Apply velocity
        stereo_data = stereo_data * velocity
        
        # Mix with output buffer (simplified version)
        # In a real implementation, you'd need to handle different sample rates
        # and apply envelopes, filters, etc.
        buffer_length = min(len(stereo_data), BUFFER_SIZE)
        self.output_buffer[:buffer_length] += stereo_data[:buffer_length]
    
    # API for UI thread
    
    def load_sample(self, file_path: str) -> Optional[Sample]:
        """Load a sample from a file."""
        try:
            audio_data, sample_rate = sf.read(file_path, dtype=np.float32)
            sample_name = os.path.basename(file_path)
            
            # Create sample object
            sample = Sample(
                name=sample_name,
                file_path=file_path,
                audio_data=audio_data,
                sample_rate=sample_rate,
                end_point=len(audio_data)
            )
            
            return sample
        except Exception as e:
            print(f"Error loading sample {file_path}: {e}")
            return None
    
    def play(self, pattern: Pattern, project: Project):
        """Start playback of a pattern."""
        self.audio_queue.put(("pattern", pattern))
        self.audio_queue.put(("project", project))
        self.audio_queue.put(("play", None))
    
    def stop(self):
        """Stop playback."""
        self.audio_queue.put(("stop", None))
    
    def set_bpm(self, bpm: float):
        """Set the BPM."""
        self.audio_queue.put(("bpm", bpm))
    
    def set_volume(self, volume: float):
        """Set the master volume."""
        self.audio_queue.put(("volume", volume))
    
    def register_step_change_callback(self, callback: Callable[[int], None]):
        """Register a callback to be notified when the step changes."""
        self.on_step_change = callback
        
    def on_ui_timer(self):
        """Called regularly from UI thread to handle audio thread notifications."""
        try:
            while not self.audio_queue.empty():
                command, data = self.audio_queue.get_nowait()
                
                if command == "step_change" and self.on_step_change:
                    self.on_step_change(data)
                    
                self.audio_queue.task_done()
        except queue.Empty:
            pass
        except Exception as e:
            print(f"Error processing UI timer: {e}")