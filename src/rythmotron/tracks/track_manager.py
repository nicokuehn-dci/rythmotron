from PySide6.QtCore import QObject, Signal
from ..constants import Track, TrackMode, DEFAULT_MIDI_NOTES, DEFAULT_MIDI_CHANNEL
from dataclasses import dataclass
from typing import Dict, Optional

@dataclass
class TrackState:
    """Represents the state of a track."""
    mode: TrackMode = TrackMode.AUDIO
    volume: float = 1.0
    pan: float = 0.0
    mute: bool = False
    solo: bool = False
    sample_path: Optional[str] = None
    midi_note: int = 0
    midi_channel: int = DEFAULT_MIDI_CHANNEL

class TrackManager(QObject):
    """Manages track states and mode switching."""
    
    # Signals
    track_changed = Signal(Track)  # Emitted when current track changes
    mode_changed = Signal(Track, TrackMode)  # Emitted when a track's mode changes
    state_changed = Signal(Track)  # Emitted when a track's state changes
    
    def __init__(self):
        super().__init__()
        self._current_track = Track.KICK
        self._track_states: Dict[Track, TrackState] = {}
        self._initialize_track_states()
    
    def _initialize_track_states(self):
        """Initialize states for all tracks with default values."""
        for track in Track:
            midi_note = DEFAULT_MIDI_NOTES.get(track, 0)
            self._track_states[track] = TrackState(midi_note=midi_note)
    
    @property
    def current_track(self) -> Track:
        """Get the currently selected track."""
        return self._current_track
    
    def set_current_track(self, track: Track):
        """Set the current track and emit signal."""
        if track != self._current_track:
            self._current_track = track
            self.track_changed.emit(track)
    
    def get_track_state(self, track: Track) -> TrackState:
        """Get the state of a track."""
        return self._track_states[track]
    
    def set_track_mode(self, track: Track, mode: TrackMode):
        """Set the mode of a track and emit signal."""
        state = self._track_states[track]
        if state.mode != mode:
            state.mode = mode
            self.mode_changed.emit(track, mode)
            self.state_changed.emit(track)
    
    def set_track_volume(self, track: Track, volume: float):
        """Set the volume of a track and emit signal."""
        state = self._track_states[track]
        if state.volume != volume:
            state.volume = max(0.0, min(1.0, volume))
            self.state_changed.emit(track)
    
    def set_track_pan(self, track: Track, pan: float):
        """Set the pan of a track and emit signal."""
        state = self._track_states[track]
        if state.pan != pan:
            state.pan = max(-1.0, min(1.0, pan))
            self.state_changed.emit(track)
    
    def set_track_mute(self, track: Track, mute: bool):
        """Set the mute state of a track and emit signal."""
        state = self._track_states[track]
        if state.mute != mute:
            state.mute = mute
            self.state_changed.emit(track)
    
    def set_track_solo(self, track: Track, solo: bool):
        """Set the solo state of a track and emit signal."""
        state = self._track_states[track]
        if state.solo != solo:
            state.solo = solo
            self.state_changed.emit(track)
    
    def set_track_sample(self, track: Track, sample_path: Optional[str]):
        """Set the sample path of a track and emit signal."""
        state = self._track_states[track]
        if state.sample_path != sample_path:
            state.sample_path = sample_path
            self.state_changed.emit(track)
    
    def set_track_midi_note(self, track: Track, note: int):
        """Set the MIDI note of a track and emit signal."""
        state = self._track_states[track]
        if state.midi_note != note:
            state.midi_note = max(0, min(127, note))
            self.state_changed.emit(track)
    
    def set_track_midi_channel(self, track: Track, channel: int):
        """Set the MIDI channel of a track and emit signal."""
        state = self._track_states[track]
        if state.midi_channel != channel:
            state.midi_channel = max(1, min(16, channel))
            self.state_changed.emit(track)
    
    def is_track_audible(self, track: Track) -> bool:
        """Check if a track should be audible based on mute and solo states."""
        state = self._track_states[track]
        if state.mute:
            return False
        
        # If any track is soloed, only soloed tracks are audible
        any_solo = any(s.solo for s in self._track_states.values())
        if any_solo:
            return state.solo
        
        return True 