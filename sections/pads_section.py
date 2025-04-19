"""
Pads section for the Analog Rytm Emulator.
Contains the drum pad grid interface.
"""

from PySide6.QtWidgets import QWidget, QFrame, QGridLayout, QVBoxLayout
from PySide6.QtCore import Signal, Qt

from ..controls.pad_components import VirtualPad
from ..constants import Track, TRACK_COLORS


class PadsSection(QWidget):
    """Drum pad grid section of the interface."""
    
    pad_pressed = Signal(Track)
    pad_triggered = Signal(Track, int)  # Track, velocity
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.pads = {}
        self.current_track = Track.BD
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the drum pad grid UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Create the pad frame
        pad_frame = QFrame()
        pad_frame.setFrameShape(QFrame.StyledPanel)
        pad_frame.setStyleSheet("""
            QFrame {
                background-color: #1A1A1A;
                border-radius: 5px;
                padding: 10px;
            }
        """)
        
        # Create grid layout for pads
        pad_layout = QGridLayout(pad_frame)
        pad_layout.setSpacing(10)
        
        # Create drum pads in a 4x3 grid (12 pads)
        tracks = [track for track in Track if track != Track.FX]
        row, col = 0, 0
        
        for track in tracks:
            # Get track color from constants
            track_color = TRACK_COLORS[track].value.name()
            track_name = track.value
            
            # Create the pad
            pad = VirtualPad(track_name, track_color)
            pad.clicked.connect(lambda checked, t=track: self._on_pad_pressed(t))
            
            # Store pad reference
            self.pads[track] = pad
            
            # Add to grid
            pad_layout.addWidget(pad, row, col)
            
            # Move to next position
            col += 1
            if col > 2:  # 3 columns per row
                col = 0
                row += 1
                
        # Set the first pad (BD) as selected initially
        self.set_current_track(Track.BD)
        
        layout.addWidget(pad_frame)
        layout.addStretch(1)  # Add stretch to push pads to the top
        
    def _on_pad_pressed(self, track):
        """Handle pad press events."""
        self.set_current_track(track)
        self.pad_pressed.emit(track)
        
    def set_current_track(self, track):
        """Set the currently selected track/pad."""
        self.current_track = track
        
        # Update visual state of all pads
        for t, pad in self.pads.items():
            pad.setSelected(t == track)
            
    def trigger_pad(self, track, velocity=100):
        """Trigger visual feedback on a pad."""
        if track in self.pads:
            self.pads[track].triggerVisualFeedback()
            self.pad_triggered.emit(track, velocity)
            
    def set_track_active(self, track, active):
        """Set whether a track/pad is active."""
        if track in self.pads:
            self.pads[track].setActive(active)
            
    def update_animations(self):
        """Update pad animations - call this from a timer."""
        for pad in self.pads.values():
            pad.decrementTrigger()