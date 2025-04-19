from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple, Union
import uuid
import os
import numpy as np
from .constants import Track, FilterType, DEFAULT_SOUND_NAME, DEFAULT_KIT_NAME, DEFAULT_PATTERN_NAME, DEFAULT_SONG_NAME, DEFAULT_PROJECT_NAME, SAMPLE_RATE

# Type alias for parameters
ParameterSet = Dict[str, Any]

@dataclass
class Sample:
    """Represents an audio sample in memory."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "New Sample"
    file_path: Optional[str] = None
    audio_data: Optional[np.ndarray] = None  # Actual audio data as numpy array
    sample_rate: int = SAMPLE_RATE
    start_point: int = 0  # Start point in samples
    end_point: Optional[int] = None  # End point in samples
    loop_start: Optional[int] = None  # Loop start point in samples
    loop_end: Optional[int] = None  # Loop end point in samples
    loop_enabled: bool = False
    
    def duration_seconds(self) -> float:
        """Get the duration of the sample in seconds."""
        if self.audio_data is None:
            return 0
        return len(self.audio_data) / self.sample_rate
    
    def get_waveform_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get downsampled waveform data for visualization."""
        if self.audio_data is None:
            return np.array([]), np.array([])
        
        # If audio is stereo, convert to mono for visualization
        if len(self.audio_data.shape) > 1 and self.audio_data.shape[1] > 1:
            data = np.mean(self.audio_data, axis=1)
        else:
            data = self.audio_data.flatten()
        
        # Limit to max 2000 points for visualization
        if len(data) > 2000:
            step = len(data) // 2000
            data = data[::step]
        
        # Create time axis
        times = np.linspace(0, self.duration_seconds(), len(data))
        return times, data
    
    def __str__(self) -> str:
        return f"Sample: {self.name} ({self.duration_seconds():.2f}s)"


@dataclass
class Sound:
    """Represents a sound/machine configuration on the Analog Rytm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = DEFAULT_SOUND_NAME
    synth_params: ParameterSet = field(default_factory=dict)
    sample_params: ParameterSet = field(default_factory=dict)
    filter_params: ParameterSet = field(default_factory=dict)
    amp_params: ParameterSet = field(default_factory=dict)
    lfo_params: ParameterSet = field(default_factory=dict)
    machine: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    sample: Optional[Sample] = None  # Associated sample object
    
    def __post_init__(self):
        """Initialize default parameters if they don't exist."""
        # Default synth parameters for different machines
        default_synth_params = {
            "wave": "Sine",
            "tune": 0,
            "decay": 50,
            "sweep": 0,
            "harmonic": 0,
        }
        
        # Default filter parameters
        default_filter_params = {
            "cutoff": 100,
            "resonance": 0,
            "envelope": 0, 
            "attack": 0,
            "decay": 50,
            "type": FilterType.LP2.name
        }
        
        # Default amp parameters
        default_amp_params = {
            "attack": 0,
            "hold": 0,
            "decay": 50,
            "overdrive": 0,
            "delay_send": 0,
            "reverb_send": 0
        }
        
        # Apply defaults where needed
        for key, value in default_synth_params.items():
            if key not in self.synth_params:
                self.synth_params[key] = value
        
        for key, value in default_filter_params.items():
            if key not in self.filter_params:
                self.filter_params[key] = value
                
        for key, value in default_amp_params.items():
            if key not in self.amp_params:
                self.amp_params[key] = value
    
    def __str__(self) -> str:
        return f"Sound: {self.name} ({self.machine or 'No machine'})"


@dataclass
class Kit:
    """Represents a kit configuration on the Analog Rytm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = DEFAULT_KIT_NAME
    track_sounds: Dict[Track, Sound] = field(default_factory=dict)
    fx_params: ParameterSet = field(default_factory=dict)
    levels: Dict[Track, int] = field(default_factory=dict)
    performance_macros: Dict[int, ParameterSet] = field(default_factory=dict)
    scenes: Dict[int, ParameterSet] = field(default_factory=dict)
    
    def __post_init__(self):
        # Initialize missing tracks with default sounds
        for track in Track:
            if track != Track.FX and track not in self.track_sounds:
                self.track_sounds[track] = Sound(name=f"{track.name} Sound")
            
            if track not in self.levels:
                self.levels[track] = 100
    
    def __str__(self) -> str:
        return f"Kit: {self.name} ({len(self.track_sounds)} sounds)"


@dataclass
class Trig:
    """Represents a trigger/note event in a pattern."""
    step: int
    note: Optional[int] = None
    velocity: int = 100
    length: float = 1.0
    parameter_locks: ParameterSet = field(default_factory=dict)
    sound_lock_id: Optional[str] = None
    probability: int = 100  # Trig probability (1-100%)
    condition: str = "ALWAYS"  # Trig condition for conditional trigs
    
    def should_trigger(self, current_step: int) -> bool:
        """Determine if this trig should trigger based on probability and conditions."""
        # Check probability
        if self.probability < 100:
            import random
            if random.randint(1, 100) > self.probability:
                return False
        
        # Check conditions (simplified version)
        if self.condition == "ALWAYS":
            return True
        elif self.condition == "FILL":
            # In a real implementation, this would check if fill mode is active
            return False
        
        return True


@dataclass
class Pattern:
    """Represents a pattern on the Analog Rytm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = DEFAULT_PATTERN_NAME
    kit_id: Optional[str] = None
    length: int = 16
    scale_mode: str = "NORMAL"
    time_signature_mult: float = 1.0
    swing_amount: int = 50
    track_trigs: Dict[Track, List[Trig]] = field(default_factory=dict)
    
    def clear_track(self, track: Track):
        """Clear all trigs from a track."""
        if track in self.track_trigs:
            self.track_trigs[track] = []
    
    def add_trig(self, track: Track, trig: Trig):
        """Add a trigger to a track."""
        if track not in self.track_trigs:
            self.track_trigs[track] = []
        
        # Remove any existing trig at the same step
        self.track_trigs[track] = [t for t in self.track_trigs[track] if t.step != trig.step]
        
        # Add the new trig
        self.track_trigs[track].append(trig)
    
    def get_trig_at_step(self, track: Track, step: int) -> Optional[Trig]:
        """Get the trig at a specific step for a track (if any)."""
        if track not in self.track_trigs:
            return None
        
        for trig in self.track_trigs[track]:
            if trig.step == step:
                return trig
        
        return None
    
    def __str__(self) -> str:
        kit_info = f" (Kit: {self.kit_id})" if self.kit_id else ""
        return f"Pattern: {self.name}{kit_info}, {self.length} steps"


@dataclass
class SongRow:
    """Represents a row in a song, pointing to a pattern."""
    pattern_id: str
    repetitions: int = 1


@dataclass
class Song:
    """Represents a song on the Analog Rytm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = DEFAULT_SONG_NAME
    rows: List[SongRow] = field(default_factory=list)
    
    def __str__(self) -> str:
        return f"Song: {self.name} ({len(self.rows)} rows)"


@dataclass
class Project:
    """Represents a complete project configuration for the Analog Rytm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = DEFAULT_PROJECT_NAME
    kits: List[Kit] = field(default_factory=list)
    patterns: List[Pattern] = field(default_factory=list)
    songs: List[Song] = field(default_factory=list)
    sound_pool: List[Sound] = field(default_factory=list)
    samples: List[Sample] = field(default_factory=list)
    bpm: float = 120.0
    
    def get_kit_by_id(self, kit_id: str) -> Optional[Kit]:
        """Find a kit by its ID."""
        for kit in self.kits:
            if kit.id == kit_id:
                return kit
        return None
    
    def get_pattern_by_id(self, pattern_id: str) -> Optional[Pattern]:
        """Find a pattern by its ID."""
        for pattern in self.patterns:
            if pattern.id == pattern_id:
                return pattern
        return None
    
    def get_sound_by_id(self, sound_id: str) -> Optional[Sound]:
        """Find a sound by its ID."""
        for sound in self.sound_pool:
            if sound.id == sound_id:
                return sound
        return None
    
    def get_sample_by_id(self, sample_id: str) -> Optional[Sample]:
        """Find a sample by its ID."""
        for sample in self.samples:
            if sample.id == sample_id:
                return sample
        return None
    
    def __str__(self) -> str:
        return (f"Project: {self.name}\n"
                f"  - {len(self.kits)} kits\n"
                f"  - {len(self.patterns)} patterns\n"
                f"  - {len(self.songs)} songs\n"
                f"  - {len(self.sound_pool)} sounds in pool\n"
                f"  - {len(self.samples)} samples")