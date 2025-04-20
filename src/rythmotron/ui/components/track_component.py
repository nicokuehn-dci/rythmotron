from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QButtonGroup)
from PySide6.QtCore import Signal, Qt
from ..style.skin_manager import SkinManager
from ...constants import Track, TrackMode

class TrackComponent(QWidget):
    """Component for track selection and mode switching."""
    
    track_changed = Signal(Track)
    mode_changed = Signal(TrackMode)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._current_track = Track.KICK
        self._current_mode = TrackMode.AUDIO
        self._setup_ui()
        self._connect_signals()
        
    def _setup_ui(self):
        """Set up the user interface."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Mode selection
        mode_layout = QHBoxLayout()
        mode_layout.setSpacing(2)
        self._mode_group = QButtonGroup(self)
        
        for mode in TrackMode:
            btn = QPushButton(mode.value)
            btn.setCheckable(True)
            btn.setChecked(mode == self._current_mode)
            self._mode_group.addButton(btn)
            mode_layout.addWidget(btn)
            
        layout.addLayout(mode_layout)
        
        # Track selection
        track_layout = QHBoxLayout()
        track_layout.setSpacing(2)
        self._track_group = QButtonGroup(self)
        
        for track in Track:
            btn = QPushButton(track.value)
            btn.setCheckable(True)
            btn.setChecked(track == self._current_track)
            self._track_group.addButton(btn)
            track_layout.addWidget(btn)
            
        layout.addLayout(track_layout)
        
    def _connect_signals(self):
        """Connect signals to slots."""
        self._mode_group.buttonClicked.connect(self._on_mode_changed)
        self._track_group.buttonClicked.connect(self._on_track_changed)
        
    def _on_mode_changed(self, button):
        """Handle mode button click."""
        mode = TrackMode(button.text())
        if mode != self._current_mode:
            self._current_mode = mode
            self.mode_changed.emit(mode)
            self._update_mode_buttons()
            
    def _on_track_changed(self, button):
        """Handle track button click."""
        track = Track(button.text())
        if track != self._current_track:
            self._current_track = track
            self.track_changed.emit(track)
            self._update_track_buttons()
            
    def _update_mode_buttons(self):
        """Update mode button states."""
        for btn in self._mode_group.buttons():
            btn.setChecked(TrackMode(btn.text()) == self._current_mode)
            
    def _update_track_buttons(self):
        """Update track button states."""
        for btn in self._track_group.buttons():
            btn.setChecked(Track(btn.text()) == self._current_track)
            
    def _apply_skin(self, skin):
        """Apply skin styling to the component."""
        # Mode buttons
        for btn in self._mode_group.buttons():
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {skin.colors.BUTTON_BG};
                    color: {skin.colors.BUTTON_TEXT};
                    border: 1px solid {skin.colors.BUTTON_BORDER};
                    border-radius: 4px;
                    padding: 4px;
                }}
                QPushButton:checked {{
                    background-color: {skin.colors.BUTTON_ACTIVE_BG};
                    color: {skin.colors.BUTTON_ACTIVE_TEXT};
                    border-color: {skin.colors.BUTTON_ACTIVE_BORDER};
                }}
                QPushButton:hover {{
                    background-color: {skin.colors.BUTTON_HOVER_BG};
                }}
            """)
            
        # Track buttons
        for btn in self._track_group.buttons():
            track = Track(btn.text())
            color = skin.colors.get_track_color(track)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {skin.colors.BUTTON_BG};
                    color: {skin.colors.BUTTON_TEXT};
                    border: 1px solid {skin.colors.BUTTON_BORDER};
                    border-radius: 4px;
                    padding: 4px;
                }}
                QPushButton:checked {{
                    background-color: {color};
                    color: {skin.colors.BUTTON_ACTIVE_TEXT};
                    border-color: {skin.colors.BUTTON_ACTIVE_BORDER};
                }}
                QPushButton:hover {{
                    background-color: {skin.colors.BUTTON_HOVER_BG};
                }}
            """) 