"""
Modes Section for the RythmoTron UI.
This section contains mode buttons and track selection buttons.
"""

from PySide6.QtWidgets import QWidget, QFrame, QVBoxLayout, QHBoxLayout, QButtonGroup, QLabel, QScrollArea
from PySide6.QtCore import Signal, Qt
from PySide6.QtGui import QPainterPath, QPainter

from ..controls.button_components import ModeToggleButton, RytmButton, ModeButton
from ...style import Colors
from ...constants import Track, TRACK_COLORS
from ...utils.context import RythmContext


class TrackButton(ModeButton):
    """Track selection button."""
    
    def __init__(self, track, parent=None):
        super().__init__(track.value, parent)
        self.track = track
        self.setFixedHeight(25)
        
        # Set color based on track
        if track in TRACK_COLORS:
            color = TRACK_COLORS[track].value
            text_color = "#FFFFFF"  # White text for all buttons
            
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: rgb({color.red()}, {color.green()}, {color.blue()});
                    color: {text_color};
                    border: none;
                    border-radius: 3px;
                    padding: 3px;
                    text-align: left;
                    padding-left: 10px;
                }}
                QPushButton:hover {{
                    background-color: rgb({min(255, color.red() + 30)}, 
                                       {min(255, color.green() + 30)}, 
                                       {min(255, color.blue() + 30)});
                }}
            """)


class ModesSection(QWidget):
    """Modes and track selection section of the interface."""
    
    mode_toggled = Signal(str, bool)  # Mode name, is_active
    track_selected = Signal(Track)  # Track
    
    def __init__(self, context: RythmContext, parent=None):
        super().__init__(parent)
        self.context = context
        self.mode_buttons = {}
        self.track_buttons = {}
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the modes section UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)
        
        # Mode buttons
        self.modes_frame = self._create_modes_frame()
        layout.addWidget(self.modes_frame)
        
        # Track selection
        self.tracks_frame = self._create_tracks_frame()
        layout.addWidget(self.tracks_frame)
        
    def _create_modes_frame(self):
        """Create the mode buttons frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px; padding: 10px;")
        
        layout = QVBoxLayout(frame)
        layout.setSpacing(10)
        
        # First row of mode buttons
        row1 = QHBoxLayout()
        row1.setSpacing(10)
        
        mute_btn = ModeButton("MUTE")
        mute_btn.setCheckable(True)
        mute_btn.toggled.connect(lambda checked: self._on_mode_toggled("MUTE", checked))
        self.mode_buttons["MUTE"] = mute_btn
        
        chrom_btn = ModeButton("CHROM")
        chrom_btn.setCheckable(True)
        chrom_btn.toggled.connect(lambda checked: self._on_mode_toggled("CHROM", checked))
        self.mode_buttons["CHROM"] = chrom_btn
        
        row1.addWidget(mute_btn)
        row1.addWidget(chrom_btn)
        
        # Second row of mode buttons
        row2 = QHBoxLayout()
        row2.setSpacing(10)
        
        scene_btn = ModeButton("SCENE")
        scene_btn.setCheckable(True)
        scene_btn.toggled.connect(lambda checked: self._on_mode_toggled("SCENE", checked))
        self.mode_buttons["SCENE"] = scene_btn
        
        perf_btn = ModeButton("PERF")
        perf_btn.setCheckable(True)
        perf_btn.toggled.connect(lambda checked: self._on_mode_toggled("PERF", checked))
        self.mode_buttons["PERF"] = perf_btn
        
        row2.addWidget(scene_btn)
        row2.addWidget(perf_btn)
        
        layout.addLayout(row1)
        layout.addLayout(row2)
        
        return frame
        
    def _create_tracks_frame(self):
        """Create the track selection frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px; padding: 10px;")
        
        layout = QVBoxLayout(frame)
        
        track_label = QLabel("TRACK SELECT")
        track_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY}; font-weight: bold;")
        layout.addWidget(track_label)
        
        # Scrollable area for track buttons
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
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
            # Skip FX as it's not a regular track
            if track == Track.FX:
                continue
                
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
