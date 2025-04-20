"""
Modes Section for the RythmoTron UI.
This section contains mode buttons and track selection buttons.
"""

from PySide6.QtWidgets import QWidget, QFrame, QVBoxLayout, QHBoxLayout, QButtonGroup, QLabel, QScrollArea
from PySide6.QtCore import Signal, Qt
from PySide6.QtGui import QPainterPath, QPainter, QColor

from ..controls.button_components import ModeToggleButton, RytmButton, ModeButton
from ...style import Colors
from ...constants import Track, TRACK_COLORS, Mode
from ...utils.context import RythmContext


class TrackButton(ModeButton):
    """Track selection button."""
    
    def __init__(self, track, parent=None):
        """Initialize the track button."""
        super().__init__(track.value, parent)
        self.track = track
        self.setCheckable(True)
        self.setFixedHeight(40)
        self.setStyleSheet(f"""
            TrackButton {{
                background-color: {track.value};
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: bold;
            }}
            TrackButton:hover {{
                background-color: {track.value}CC;
            }}
            TrackButton:checked {{
                background-color: {track.value}FF;
                border: 2px solid white;
            }}
        """)


class ModesSection(QWidget):
    """Modes and track selection section of the interface."""
    
    mode_toggled = Signal(str, bool)  # Mode name, is_active
    track_selected = Signal(Track)  # Track
    
    def __init__(self, context: RythmContext, parent=None):
        """Initialize the modes section."""
        super().__init__(parent)
        self.context = context
        self.mode_buttons = {}
        self.track_buttons = {}
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the user interface."""
        layout = QHBoxLayout(self)
        layout.setSpacing(10)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Create modes frame
        self.modes_frame = self._create_modes_frame()
        layout.addWidget(self.modes_frame)
        
        # Create tracks frame
        self.tracks_frame = self._create_tracks_frame()
        layout.addWidget(self.tracks_frame)
        
    def _create_modes_frame(self):
        """Create the modes selection frame."""
        frame = QFrame()
        frame.setObjectName("modes_frame")
        frame.setFrameStyle(QFrame.StyledPanel)
        
        layout = QVBoxLayout(frame)
        layout.setSpacing(5)
        layout.setContentsMargins(5, 5, 5, 5)
        
        # Add label
        label = QLabel("Modes")
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)
        
        # Create scroll area
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)
        
        scroll_widget = QWidget()
        scroll_layout = QVBoxLayout(scroll_widget)
        scroll_layout.setSpacing(5)
        scroll_layout.setContentsMargins(0, 0, 0, 0)
        
        # Create buttons for each mode
        for mode in Mode:
            btn = ModeButton(mode.value)
            btn.clicked.connect(lambda checked, m=mode.value: self._on_mode_toggled(m, checked))
            
            # Store button reference
            self.mode_buttons[mode.value] = btn
            
            scroll_layout.addWidget(btn)
            
        scroll_layout.addStretch(1)  # Add stretch to push buttons to the top
        scroll_area.setWidget(scroll_widget)
        
        layout.addWidget(scroll_area)
        
        return frame
        
    def _create_tracks_frame(self):
        """Create the tracks selection frame."""
        frame = QFrame()
        frame.setObjectName("tracks_frame")
        frame.setFrameStyle(QFrame.StyledPanel)
        
        layout = QVBoxLayout(frame)
        layout.setSpacing(5)
        layout.setContentsMargins(5, 5, 5, 5)
        
        # Add label
        label = QLabel("Tracks")
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)
        
        # Create scroll area
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)
        
        scroll_widget = QWidget()
        scroll_layout = QVBoxLayout(scroll_widget)
        scroll_layout.setSpacing(5)
        scroll_layout.setContentsMargins(0, 0, 0, 0)
        
        # Create buttons for each track
        for track in Track:
            btn = TrackButton(track)
            btn.clicked.connect(lambda checked, t=track: self._on_track_selected(t))
            
            # Store button reference
            self.track_buttons[track] = btn
            
            scroll_layout.addWidget(btn)
            
        scroll_layout.addStretch(1)  # Add stretch to push buttons to the top
        scroll_area.setWidget(scroll_widget)
        
        layout.addWidget(scroll_area)
        
        return frame
        
    def _on_mode_toggled(self, mode_name, checked):
        """Handle mode button toggle."""
        self.mode_toggled.emit(mode_name, checked)
        
    def _on_track_selected(self, track):
        """Handle track selection."""
        self.context.current_track = track
        self.track_selected.emit(track)
        
    def set_current_track(self, track):
        """Set the currently selected track."""
        self.context.current_track = track
        
    def set_mode(self, mode_name, active):
        """Set a mode button state."""
        if mode_name in self.mode_buttons:
            self.mode_buttons[mode_name].blockSignals(True)
            self.mode_buttons[mode_name].setChecked(active)
            self.mode_buttons[mode_name].blockSignals(False)
