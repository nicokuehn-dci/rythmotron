"""
RythmoTron - Constants and Enumerations

This module contains all the constants and enumerations used throughout the RythmoTron application.
"""

from enum import Enum, auto

class TrackMode(Enum):
    """Available track modes."""
    AUDIO = auto()  # Sample-based audio track
    MIDI = auto()   # MIDI-controlled track
    CV = auto()     # CV/Gate output track

class Track(Enum):
    """Available drum tracks."""
    KICK = "KICK"
    SNARE = "SNARE"
    HIHAT = "HIHAT"
    TOM1 = "TOM1"
    TOM2 = "TOM2"
    CRASH = "CRASH"
    RIDE = "RIDE"
    PERC1 = "PERC1"
    PERC2 = "PERC2"
    PERC3 = "PERC3"
    PERC4 = "PERC4"

class Mode(Enum):
    """Operating modes for RythmoTron."""
    
    PATTERN = "PATTERN"
    SONG = "SONG"
    PERFORM = "PERFORM"
    SOUND = "SOUND"
    GLOBAL = "GLOBAL"
    
    @classmethod
    def get_all(cls):
        """Get all mode values."""
        return [mode for mode in cls]
    
    @classmethod
    def get_name(cls, mode):
        """Get the display name for a mode."""
        return mode.value

class ParameterPage(Enum):
    """Parameter pages available in RythmoTron."""
    
    SYNTH = "SYNTH"
    SAMPLE = "SAMPLE"
    FILTER = "FILTER"
    AMP = "AMP"
    LFO = "LFO"
    
    @classmethod
    def get_all(cls):
        """Get all parameter page values."""
        return [page for page in cls]
    
    @classmethod
    def get_name(cls, page):
        """Get the display name for a parameter page."""
        return page.value

class FilterType(Enum):
    """Filter types available in RythmoTron."""
    
    LOWPASS = "LOWPASS"
    HIGHPASS = "HIGHPASS"
    BANDPASS = "BANDPASS"
    NOTCH = "NOTCH"
    PEAK = "PEAK"
    LOWSHELF = "LOWSHELF"
    HIGHSHELF = "HIGHSHELF"
    
    @classmethod
    def get_all(cls):
        """Get all filter type values."""
        return [filter_type for filter_type in cls]
    
    @classmethod
    def get_name(cls, filter_type):
        """Get the display name for a filter type."""
        return filter_type.value

# Sequencer constants
DEFAULT_BPM = 120
DEFAULT_SWING = 50
DEFAULT_STEPS = 16
MAX_STEPS = 64
STEP_RESOLUTIONS = ["1/16", "1/8", "1/8T", "1/4", "1/4T", "1/2", "1/2T", "1"]

# UI constants
GRID_SIZE = 40  # Size of a step in pixels
TRACK_HEIGHT = 50
TRACK_COLORS = {
    Track.KICK: "#FF4444",    # Red
    Track.SNARE: "#44FF44",   # Green
    Track.HIHAT: "#4444FF",   # Blue
    Track.TOM1: "#FFFF44",    # Yellow
    Track.TOM2: "#FF44FF",    # Magenta
    Track.CRASH: "#44FFFF",   # Cyan
    Track.RIDE: "#FF8844",    # Orange
    Track.PERC1: "#8844FF",   # Purple
    Track.PERC2: "#44FF88",   # Mint
    Track.PERC3: "#FF4488",   # Pink
    Track.PERC4: "#88FF44",   # Lime
}

# Default names
DEFAULT_PROJECT_NAME = "Init Project"
DEFAULT_KIT_NAME = "Init Kit"
DEFAULT_SOUND_NAME = "Init Sound"
DEFAULT_PATTERN_NAME = "Init Pattern"
DEFAULT_SONG_NAME = "Init Song"

# Limits
MAX_KITS = 128
MAX_PATTERNS = 128
MAX_SONGS = 16
MAX_SOUND_POOL = 4096
MAX_SAMPLES = 128
MAX_CHAINS_PER_TRACK = 64
MAX_SCENES = 64
MAX_PERFORMANCE_MACROS = 8

# Audio engine constants
SAMPLE_RATE = 44100
BUFFER_SIZE = 512
DEFAULT_VOLUME = 0.8

# Default values
DEFAULT_TEMPO = 120
DEFAULT_VELOCITY = 100
DEFAULT_PAN = 64

# UI constants
STEPS_PER_PAGE = 16
MAX_PAGES = 4
MAX_TRACKS = 8
MAX_PARAMETERS = 8

# Animation constants
ANIMATION_FPS = 60
EFFECT_DURATION = 0.2  # seconds
GLOW_INTENSITY = 0.8
HIGHLIGHT_INTENSITY = 0.6

# MIDI note numbers for default track mapping
DEFAULT_MIDI_NOTES = {
    Track.KICK: 36,    # C1
    Track.SNARE: 38,   # D1
    Track.HIHAT: 42,   # F#1
    Track.TOM1: 45,    # A1
    Track.TOM2: 47,    # B1
    Track.CRASH: 49,   # C#2
    Track.RIDE: 51,    # D#2
    Track.PERC1: 53,   # F2
    Track.PERC2: 55,   # G2
    Track.PERC3: 57,   # A2
    Track.PERC4: 59,   # B2
}

# Default MIDI channel for all tracks
DEFAULT_MIDI_CHANNEL = 10  # Channel 10 is standard for drums