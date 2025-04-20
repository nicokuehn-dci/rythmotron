"""
Display engine for RythmoTron.
Manages visual effects and animations similar to the Analog Rytm hardware.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from PySide6.QtCore import QObject, Signal, QTimer, QDateTime, QPointF
from PySide6.QtGui import QColor
from ..constants import Track
from ..style import Colors

@dataclass
class DisplayEffect:
    """Class representing a visual effect."""
    name: str
    duration: float  # Duration in seconds
    intensity: float  # 0.0 to 1.0
    color: QColor
    start_time: float  # Start time in seconds

class DisplayEngine(QObject):
    """Engine for managing display effects and animations."""
    
    # Signals
    track_triggered = Signal(Track, bool)  # track, is_triggered
    step_highlighted = Signal(int, bool)  # step, is_highlighted
    parameter_changed = Signal(str, float)  # name, value
    effect_triggered = Signal(str, float, QColor, QPointF, float)  # name, intensity, color, position, size
    
    def __init__(self, parent: QObject = None):
        """Initialize the display engine."""
        super().__init__(parent)
        
        # Initialize state
        self.active_tracks: Dict[Track, bool] = {}
        self.highlighted_steps: Dict[int, bool] = {}
        self.parameter_values: Dict[str, float] = {}
        self.active_effects: Dict[str, DisplayEffect] = {}
        
        # Set up update timer (60 FPS)
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self._update_effects)
        self.update_timer.start(16)  # ~60 FPS
        
        # Track colors
        self.track_colors = {
            Track.KICK: QColor(Colors.KICK),
            Track.SNARE: QColor(Colors.SNARE),
            Track.HIHAT: QColor(Colors.HIHAT),
            Track.TOM1: QColor(Colors.TOM1),
            Track.TOM2: QColor(Colors.TOM2),
            Track.CRASH: QColor(Colors.CRASH),
            Track.RIDE: QColor(Colors.RIDE),
            Track.PERC1: QColor(Colors.PERC1),
            Track.PERC2: QColor(Colors.PERC2),
            Track.PERC3: QColor(Colors.PERC3),
            Track.PERC4: QColor(Colors.PERC4)
        }
    
    def get_track_color(self, track: Track) -> QColor:
        """Get the color for a track."""
        return self.track_colors[track]
    
    def trigger_track(self, track: Track, is_triggered: bool):
        """Trigger a track effect."""
        self.active_tracks[track] = is_triggered
        self.track_triggered.emit(track, is_triggered)
        
        if is_triggered:
            # Create track trigger effect
            effect = DisplayEffect(
                name=f"track_{track.value}",
                duration=0.2,  # 200ms duration
                intensity=1.0,
                color=self.track_colors[track],
                start_time=QDateTime.currentMSecsSinceEpoch() / 1000.0
            )
            self.active_effects[effect.name] = effect
            self.effect_triggered.emit(effect.name, effect.intensity, effect.color, QPointF(), 0.0)
    
    def highlight_step(self, step: int, is_highlighted: bool):
        """Highlight a step in the sequencer."""
        self.highlighted_steps[step] = is_highlighted
        self.step_highlighted.emit(step, is_highlighted)
        
        if is_highlighted:
            # Create step highlight effect
            effect = DisplayEffect(
                name=f"step_{step}",
                duration=0.1,  # 100ms duration
                intensity=1.0,
                color=QColor(Colors.ACCENT),
                start_time=QDateTime.currentMSecsSinceEpoch() / 1000.0
            )
            self.active_effects[effect.name] = effect
            self.effect_triggered.emit(effect.name, effect.intensity, effect.color, QPointF(), 0.0)
    
    def update_parameter(self, name: str, value: float):
        """Update a parameter value and trigger effect."""
        self.parameter_values[name] = value
        self.parameter_changed.emit(name, value)
        
        # Create parameter change effect
        effect = DisplayEffect(
            name=f"param_{name}",
            duration=0.15,  # 150ms duration
            intensity=1.0,
            color=QColor(Colors.ACCENT),
            start_time=QDateTime.currentMSecsSinceEpoch() / 1000.0
        )
        self.active_effects[effect.name] = effect
        self.effect_triggered.emit(effect.name, effect.intensity, effect.color, QPointF(), 0.0)
    
    def _update_effects(self):
        """Update all active effects."""
        current_time = QDateTime.currentMSecsSinceEpoch() / 1000.0  # Convert to seconds
        
        # Update and remove expired effects
        expired_effects = []
        for name, effect in self.active_effects.items():
            # Calculate new intensity
            elapsed = current_time - effect.start_time
            if elapsed >= effect.duration:
                expired_effects.append(name)
            else:
                effect.intensity = 1.0 - (elapsed / effect.duration)
                self.effect_triggered.emit(name, effect.intensity, effect.color, QPointF(), 0.0)
        
        # Remove expired effects
        for name in expired_effects:
            del self.active_effects[name] 