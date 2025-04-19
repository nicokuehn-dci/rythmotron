"""
Top section for the RythmoTron.
Contains project info, tempo, and transport controls.
"""

from PySide6.QtWidgets import QWidget, QFrame, QLabel, QHBoxLayout
from PySide6.QtCore import Signal
from PySide6.QtGui import QPainter, QColor, QPen

from ..controls.button_components import TransportButton
from ..controls.knob_components import VirtualKnob
from ...style import Colors


class TopBarSection(QWidget):
    """Top bar with project info, tempo controls, and transport buttons."""
    
    play_clicked = Signal()
    stop_clicked = Signal()
    record_clicked = Signal()
    tap_tempo_clicked = Signal()
    volume_changed = Signal(int)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the top bar UI."""
        layout = QHBoxLayout(self)
        layout.setSpacing(20)
        
        # Project info area
        self.project_frame = self._create_project_info_frame()
        layout.addWidget(self.project_frame)
        
        # Tempo control area
        self.tempo_frame = self._create_tempo_control_frame()
        layout.addWidget(self.tempo_frame)
        
        # Master volume area
        self.volume_frame = self._create_master_volume_frame()
        layout.addWidget(self.volume_frame)
        
        # Transport controls area
        self.transport_frame = self._create_transport_frame()
        layout.addWidget(self.transport_frame)
        
    def _create_project_info_frame(self):
        """Create the project info frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px;")
        layout = QHBoxLayout(frame)
        
        project_label = QLabel("PROJECT:")
        project_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        
        self.project_value = QLabel("DEMO_PROJECT")
        self.project_value.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        
        kit_label = QLabel("KIT:")
        kit_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        
        self.kit_value = QLabel("KIT_001")
        self.kit_value.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        
        pattern_label = QLabel("PATTERN:")
        pattern_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        
        self.pattern_value = QLabel("A01")
        self.pattern_value.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        
        layout.addWidget(project_label)
        layout.addWidget(self.project_value)
        layout.addSpacing(10)
        layout.addWidget(kit_label)
        layout.addWidget(self.kit_value)
        layout.addSpacing(10)
        layout.addWidget(pattern_label)
        layout.addWidget(self.pattern_value)
        
        return frame
        
    def _create_tempo_control_frame(self):
        """Create the tempo control frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px;")
        layout = QHBoxLayout(frame)
        
        tempo_label = QLabel("TEMPO")
        tempo_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        
        self.tempo_value = QLabel("120.0")
        self.tempo_value.setStyleSheet(f"color: {Colors.TEXT_PRIMARY}; font-size: 18px; font-weight: bold;")
        
        tap_tempo_btn = TransportButton(tooltip="Tap Tempo")
        tap_tempo_btn.setText("TAP")
        tap_tempo_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.ACCENT};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 5px;
                padding: 5px 10px;
            }}
            QPushButton:pressed {{
                background-color: {Colors.ACCENT};
                color: {Colors.TEXT_PRIMARY};
            }}
        """)
        tap_tempo_btn.clicked.connect(self.tap_tempo_clicked.emit)
        
        layout.addWidget(tempo_label)
        layout.addWidget(self.tempo_value)
        layout.addWidget(tap_tempo_btn)
        
        return frame
        
    def _create_master_volume_frame(self):
        """Create the master volume frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px;")
        layout = QHBoxLayout(frame)
        
        volume_label = QLabel("MASTER VOLUME")
        volume_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        
        self.master_knob = VirtualKnob("VOLUME")
        self.master_knob.valueChanged.connect(self._on_master_volume_changed)
        
        self.volume_value = QLabel("100")
        self.volume_value.setStyleSheet(f"color: {Colors.TEXT_PRIMARY}; font-weight: bold;")
        
        layout.addWidget(volume_label)
        layout.addWidget(self.master_knob)
        layout.addWidget(self.volume_value)
        
        return frame
        
    def _create_transport_frame(self):
        """Create the transport controls frame."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px;")
        layout = QHBoxLayout(frame)
        
        self.play_btn = TransportButton(tooltip="Play")
        self.play_btn.setText("PLAY")
        self.play_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.SUCCESS};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 5px;
                padding: 5px 15px;
                font-weight: bold;
            }}
            QPushButton:pressed {{
                background-color: {Colors.SUCCESS};
                color: {Colors.SURFACE};
            }}
        """)
        self.play_btn.clicked.connect(self.play_clicked.emit)
        
        self.stop_btn = TransportButton(tooltip="Stop")
        self.stop_btn.setText("STOP")
        self.stop_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.ERROR};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 5px;
                padding: 5px 15px;
                font-weight: bold;
            }}
            QPushButton:pressed {{
                background-color: {Colors.ERROR};
                color: {Colors.SURFACE};
            }}
        """)
        self.stop_btn.clicked.connect(self.stop_clicked.emit)
        
        self.rec_btn = TransportButton(tooltip="Record")
        self.rec_btn.setText("REC")
        self.rec_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.ERROR};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 5px;
                padding: 5px 15px;
                font-weight: bold;
            }}
            QPushButton:pressed {{
                background-color: {Colors.ERROR};
                color: {Colors.SURFACE};
            }}
        """)
        self.rec_btn.clicked.connect(self.record_clicked.emit)
        
        layout.addWidget(self.play_btn)
        layout.addWidget(self.stop_btn)
        layout.addWidget(self.rec_btn)
        
        return frame
        
    def _on_master_volume_changed(self, value):
        """Handle volume knob changes."""
        volume = int(value / 127 * 100)  # Scale to 0-100
        self.volume_value.setText(str(volume))
        self.volume_changed.emit(volume)
        
    def set_tempo(self, tempo):
        """Update the tempo display."""
        self.tempo_value.setText(f"{tempo:.1f}")
        
    def set_project_info(self, project_name, kit_name, pattern_name):
        """Update project information."""
        self.project_value.setText(project_name)
        self.kit_value.setText(kit_name)
        self.pattern_value.setText(pattern_name)
        
    def set_playing_state(self, is_playing):
        """Update transport buttons based on playback state."""
        self.play_btn.setActive(is_playing)
        
    def set_recording_state(self, is_recording):
        """Update record button based on recording state."""
        self.rec_btn.setActive(is_recording)