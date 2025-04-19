"""
Display section for the Analog Rytm Emulator.
Contains the main parameter display area and parameter pages.
"""

from PySide6.QtWidgets import QWidget, QFrame, QGridLayout, QVBoxLayout, QLabel
from PySide6.QtCore import Signal, Qt

from ..style import Colors


class ParameterRow(QWidget):
    """A row displaying a parameter name and value."""
    
    def __init__(self, name="", value="", parent=None):
        super().__init__(parent)
        self.setup_ui(name, value)
        
    def setup_ui(self, name, value):
        """Set up the parameter row UI."""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.name_label = QLabel(name)
        self.name_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY}; font-size: 12px;")
        
        self.value_label = QLabel(value)
        self.value_label.setStyleSheet(f"color: {Colors.TEXT_PRIMARY}; font-size: 12px; font-weight: bold;")
        
        layout.addWidget(self.name_label)
        layout.addStretch(1)
        layout.addWidget(self.value_label)
        
    def set_value(self, value):
        """Update the parameter value."""
        self.value_label.setText(str(value))
        
    def set_name(self, name):
        """Update the parameter name."""
        self.name_label.setText(name)
        
    def highlight(self, active):
        """Highlight this parameter row."""
        if active:
            self.value_label.setStyleSheet(f"color: {Colors.ACCENT}; font-size: 12px; font-weight: bold;")
        else:
            self.value_label.setStyleSheet(f"color: {Colors.TEXT_PRIMARY}; font-size: 12px; font-weight: bold;")


class DisplaySection(QWidget):
    """Main display area showing parameter values."""
    
    page_changed = Signal(str)  # Page name
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_page = "SYNTH"
        self.parameter_rows = {}
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the display section UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Main frame
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"""
            QFrame {{
                background-color: {Colors.SURFACE_DARKER};
                border-radius: 5px;
            }}
        """)
        
        frame_layout = QVBoxLayout(frame)
        
        # Header
        self.header_label = QLabel(self.current_page + " PARAMETERS")
        self.header_label.setStyleSheet(f"""
            QLabel {{
                color: {Colors.TEXT_PRIMARY};
                background-color: {Colors.SURFACE_DARKER};
                font-size: 14px;
                font-weight: bold;
                padding: 5px;
                border-bottom: 1px solid {Colors.GRID_LINES};
            }}
        """)
        frame_layout.addWidget(self.header_label)
        
        # Content area
        content_widget = QWidget()
        self.content_layout = QVBoxLayout(content_widget)
        self.content_layout.setSpacing(10)
        self.content_layout.setContentsMargins(10, 10, 10, 10)
        
        # Create some default parameters
        self._create_synth_parameters()
        
        frame_layout.addWidget(content_widget)
        layout.addWidget(frame)
        
    def _create_synth_parameters(self):
        """Create the synth parameter rows."""
        # Clear existing rows
        for i in reversed(range(self.content_layout.count())): 
            self.content_layout.itemAt(i).widget().setParent(None)
        
        self.parameter_rows = {}
        
        # Add synth parameter rows
        params = [
            ("WAVE", "SINE"),
            ("START", "0"),
            ("LENGTH", "127"),
            ("TUNE", "0"),
            ("DECAY", "64"),
            ("SNAP", "ON"),
            ("DRIVE", "32"),
            ("LEVEL", "100"),
        ]
        
        for name, value in params:
            row = ParameterRow(name, value)
            self.parameter_rows[name] = row
            self.content_layout.addWidget(row)
            
        # Add stretch at the end
        self.content_layout.addStretch(1)
        
    def _create_sample_parameters(self):
        """Create the sample parameter rows."""
        # Clear existing rows
        for i in reversed(range(self.content_layout.count())): 
            self.content_layout.itemAt(i).widget().setParent(None)
        
        self.parameter_rows = {}
        
        # Add sample parameter rows
        params = [
            ("SAMPLE", "BD_001"),
            ("SLOT", "A"),
            ("REVERSE", "OFF"),
            ("LOOP", "OFF"),
            ("START", "0"),
            ("END", "127"),
            ("TUNE", "0"),
            ("LEVEL", "100"),
        ]
        
        for name, value in params:
            row = ParameterRow(name, value)
            self.parameter_rows[name] = row
            self.content_layout.addWidget(row)
            
        # Add stretch at the end
        self.content_layout.addStretch(1)
        
    def _create_filter_parameters(self):
        """Create the filter parameter rows."""
        # Clear existing rows
        for i in reversed(range(self.content_layout.count())): 
            self.content_layout.itemAt(i).widget().setParent(None)
        
        self.parameter_rows = {}
        
        # Add filter parameter rows
        params = [
            ("TYPE", "LP2"),
            ("CUTOFF", "100"),
            ("RESONANCE", "40"),
            ("ENV DEPTH", "64"),
            ("ENV ATTACK", "0"),
            ("ENV DECAY", "64"),
            ("ENV MOD", "0"),
            ("LFO AMT", "0"),
        ]
        
        for name, value in params:
            row = ParameterRow(name, value)
            self.parameter_rows[name] = row
            self.content_layout.addWidget(row)
            
        # Add stretch at the end
        self.content_layout.addStretch(1)
        
    def _create_amp_parameters(self):
        """Create the amplifier parameter rows."""
        # Clear existing rows
        for i in reversed(range(self.content_layout.count())): 
            self.content_layout.itemAt(i).widget().setParent(None)
        
        self.parameter_rows = {}
        
        # Add amp parameter rows
        params = [
            ("ATTACK", "0"),
            ("HOLD", "0"),
            ("DECAY", "64"),
            ("OVERDRIVE", "0"),
            ("DELAY SEND", "0"),
            ("REVERB SEND", "0"),
            ("PAN", "64"),
            ("VOLUME", "100"),
        ]
        
        for name, value in params:
            row = ParameterRow(name, value)
            self.parameter_rows[name] = row
            self.content_layout.addWidget(row)
            
        # Add stretch at the end
        self.content_layout.addStretch(1)
        
    def _create_lfo_parameters(self):
        """Create the LFO parameter rows."""
        # Clear existing rows
        for i in reversed(range(self.content_layout.count())): 
            self.content_layout.itemAt(i).widget().setParent(None)
        
        self.parameter_rows = {}
        
        # Add LFO parameter rows
        params = [
            ("WAVE", "TRIANGLE"),
            ("SPEED", "64"),
            ("MULTIPLIER", "X1"),
            ("FADE IN", "0"),
            ("START PHASE", "0"),
            ("TRIG MODE", "FREE"),
            ("DEST", "PITCH"),
            ("DEPTH", "32"),
        ]
        
        for name, value in params:
            row = ParameterRow(name, value)
            self.parameter_rows[name] = row
            self.content_layout.addWidget(row)
            
        # Add stretch at the end
        self.content_layout.addStretch(1)
        
    def set_page(self, page_name):
        """Change the display page."""
        if page_name == self.current_page:
            return
            
        self.current_page = page_name
        self.header_label.setText(page_name + " PARAMETERS")
        
        # Update content based on page
        if page_name == "SYNTH":
            self._create_synth_parameters()
        elif page_name == "SAMPLE":
            self._create_sample_parameters()
        elif page_name == "FILTER":
            self._create_filter_parameters()
        elif page_name == "AMP":
            self._create_amp_parameters()
        elif page_name == "LFO":
            self._create_lfo_parameters()
            
        self.page_changed.emit(page_name)
        
    def set_parameter_value(self, name, value):
        """Set a parameter value."""
        if name in self.parameter_rows:
            self.parameter_rows[name].set_value(value)
            
    def highlight_parameter(self, name, active=True):
        """Highlight a specific parameter."""
        for param_name, row in self.parameter_rows.items():
            row.highlight(param_name == name and active)