"""
RythmoTron - Application Context

This module provides a centralized context object for sharing state between UI components.
It helps avoid circular dependencies by separating the context from individual UI elements.
"""

from PySide6.QtCore import QObject, Signal, Property
from ..constants import Track, TrackMode
from ..style.skin_manager import SkinManager
from enum import Enum

class PatternMode(Enum):
    """Pattern change modes."""
    DIRECT_START = "DIRECT_START"  # Immediately change patterns
    NEXT_START = "NEXT_START"      # Change pattern at next pattern start
    NEXT_BAR = "NEXT_BAR"          # Change pattern at next bar

class SequencerState:
    """State for a single pattern step."""
    def __init__(self):
        self.triggers = {track: False for track in Track}  # Step triggers for each track
        self.parameter_locks = {track: {} for track in Track}  # Parameter locks for each track
        self.accent = False  # Accent state
        self.slide = False   # Slide state
        self.retrig = None   # Retrig settings

class Pattern:
    """Represents a single pattern in the sequencer."""
    def __init__(self, name="Init Pattern"):
        self.name = name
        self.steps = [SequencerState() for _ in range(64)]  # 64 steps per pattern
        self.length = 16  # Default pattern length
        self.scale = "1/16"  # Default scale
        self.swing = 50  # Default swing (50% = no swing)

class RythmContext(QObject):
    """Manages the global state of the RythmoTron application."""
    
    # Signals
    track_changed = Signal(Track)
    mode_changed = Signal(TrackMode)
    active_tracks_changed = Signal(list)
    is_playing_changed = Signal(bool)
    current_step_changed = Signal(int)
    parameter_page_changed = Signal(str)
    pattern_changed = Signal(int)
    pattern_mode_changed = Signal(PatternMode)
    tempo_changed = Signal(int)
    
    def __init__(self):
        super().__init__()
        self._current_track = Track.KICK
        self._current_mode = TrackMode.AUDIO
        self._active_tracks = []
        self._is_playing = False
        self._current_step = -1
        self._parameter_page = "SYNTH"
        self._current_pattern = 0
        self._pattern_mode = PatternMode.DIRECT_START
        self._tempo = 120
        self._current_page = 0
        self._patterns = [Pattern() for _ in range(128)]
        self._parameters = {}
        self._parameter_values = {}
        self._tracks = set(Track)
        
        # Initialize skin manager
        self.skin_manager = SkinManager(self)
        
    @property
    def current_track(self) -> Track:
        """Get the currently selected track."""
        return self._current_track
        
    @current_track.setter
    def current_track(self, track: Track):
        """Set the current track and emit signal."""
        if track != self._current_track:
            self._current_track = track
            self.track_changed.emit(track)
            
    @property
    def current_mode(self) -> TrackMode:
        """Get the current track mode."""
        return self._current_mode
        
    def set_current_mode(self, mode: TrackMode):
        """Set the current mode and emit signal."""
        if mode != self._current_mode:
            self._current_mode = mode
            self.mode_changed.emit(mode)
            
    @Property(list)
    def active_tracks(self):
        """Get the list of active tracks."""
        return self._active_tracks
        
    @active_tracks.setter
    def active_tracks(self, tracks):
        """Set the list of active tracks."""
        if tracks != self._active_tracks:
            self._active_tracks = tracks
            self.active_tracks_changed.emit(tracks)
            
    def toggle_track_active(self, track):
        """Toggle a track's active state."""
        if track in self._active_tracks:
            self._active_tracks.remove(track)
        else:
            self._active_tracks.append(track)
        self.active_tracks_changed.emit(self._active_tracks)
        
    def is_track_active(self, track):
        """Check if a track is active."""
        return track in self._active_tracks

    def get_page_parameters(self, page: str) -> list[str]:
        """Get all parameters for a given page."""
        return self._parameters.get(page, [])
        
    def get_parameter(self, name: str) -> float:
        """Get the value of a parameter."""
        return self._parameter_values.get(name, 0.0)
        
    def set_parameter(self, name: str, value: float):
        """Set the value of a parameter."""
        if name in self._parameter_values:
            self._parameter_values[name] = value
        
    def is_track_active(self, track: Track) -> bool:
        """Check if a track is currently active."""
        return track in self._active_tracks
        
    def set_track_active(self, track: Track, active: bool):
        """Set a track's active state."""
        if active:
            self._active_tracks.add(track)
        else:
            self._active_tracks.discard(track)
        
    @property
    def tracks(self):
        """Get all available tracks."""
        return self._tracks
        
    @property
    def is_playing(self):
        return self._is_playing

    @is_playing.setter
    def is_playing(self, value):
        if self._is_playing != value:
            self._is_playing = value
            self.is_playing_changed.emit(value)

    @property
    def current_step(self):
        return self._current_step

    @current_step.setter
    def current_step(self, value):
        if self._current_step != value:
            self._current_step = value
            self.current_step_changed.emit(value)
            
    @property
    def parameter_page(self):
        return self._parameter_page
    
    @parameter_page.setter
    def parameter_page(self, value):
        if self._parameter_page != value:
            self._parameter_page = value
            self.parameter_page_changed.emit(value)
            
    @property
    def current_pattern(self):
        return self._current_pattern
        
    @current_pattern.setter
    def current_pattern(self, value):
        if 0 <= value < 128 and self._current_pattern != value:
            self._current_pattern = value
            self.pattern_changed.emit(value)
            
    @property
    def pattern_mode(self):
        return self._pattern_mode
        
    @pattern_mode.setter
    def pattern_mode(self, value):
        if self._pattern_mode != value:
            self._pattern_mode = value
            self.pattern_mode_changed.emit(value)
            
    @property
    def tempo(self):
        return self._tempo
        
    @tempo.setter
    def tempo(self, value):
        if 20 <= value <= 999 and self._tempo != value:
            self._tempo = value
            self.tempo_changed.emit(value)
            
    @property
    def current_page(self):
        return self._current_page
        
    @current_page.setter
    def current_page(self, value):
        if 0 <= value <= 3 and self._current_page != value:
            self._current_page = value
            
    def get_current_pattern(self):
        """Get the currently selected pattern."""
        return self._patterns[self._current_pattern]
        
    def set_step_trigger(self, step, track, value):
        """Set a trigger for a specific step and track."""
        if 0 <= step < 64:
            self._patterns[self._current_pattern].steps[step].triggers[track] = value
            
    def get_step_trigger(self, step, track):
        """Get the trigger state for a specific step and track."""
        if 0 <= step < 64:
            return self._patterns[self._current_pattern].steps[step].triggers[track]
        return False