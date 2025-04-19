from enum import Enum, auto

class Track(Enum):
    """Enum representing the 12 drum tracks and the FX track of the Analog Rytm."""
    BD = auto()  # Bass Drum
    SD = auto()  # Snare Drum
    RS = auto()  # Rim Shot
    CP = auto()  # Clap
    BT = auto()  # Bass Tom
    LT = auto()  # Low Tom
    MT = auto()  # Mid Tom
    HT = auto()  # High Tom
    CH = auto()  # Closed Hat
    OH = auto()  # Open Hat
    CY = auto()  # Cymbal
    CB = auto()  # Cowbell
    FX = auto()  # FX Track

class FilterType(Enum):
    """Enum representing the 7 filter types available on the Analog Rytm."""
    LP2 = auto()  # 2-pole Lowpass
    LP1 = auto()  # 1-pole Lowpass
    BP = auto()   # Bandpass
    HP1 = auto()  # 1-pole Highpass
    HP2 = auto()  # 2-pole Highpass
    BS = auto()   # Bandstop
    PK = auto()   # Peak

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
    Track.BD: "#FF5252",  # Red
    Track.SD: "#FF9800",  # Orange
    Track.RS: "#FFEB3B",  # Yellow
    Track.CP: "#8BC34A",  # Light green
    Track.BT: "#4CAF50",  # Green
    Track.LT: "#009688",  # Teal
    Track.MT: "#00BCD4",  # Cyan
    Track.HT: "#03A9F4",  # Light blue
    Track.CH: "#2196F3",  # Blue
    Track.OH: "#3F51B5",  # Indigo
    Track.CY: "#673AB7",  # Deep purple
    Track.CB: "#9C27B0",  # Purple
    Track.FX: "#E91E63",  # Pink
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