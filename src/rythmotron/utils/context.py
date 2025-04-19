"""
RythmoTron - Application Context

This module provides a centralized context object for sharing state between UI components.
It helps avoid circular dependencies by separating the context from individual UI elements.
"""

from PySide6.QtCore import QObject, Signal
from ..constants import Track

class RythmContext(QObject):
    """
    Centralized context object for state management and communication between UI components.
    Uses Qt signals to notify components of state changes.
    """
    current_track_changed = Signal(Track)
    is_playing_changed = Signal(bool)
    current_step_changed = Signal(int)
    parameter_page_changed = Signal(str)

    def __init__(self):
        super().__init__()
        self._current_track = Track.BD
        self._is_playing = False
        self._current_step = -1
        self._parameter_page = "SYNTH"

    @property
    def current_track(self):
        return self._current_track

    @current_track.setter
    def current_track(self, value):
        if self._current_track != value:
            self._current_track = value
            self.current_track_changed.emit(value)

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