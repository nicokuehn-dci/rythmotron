"""
Parameters section for the Analog Rytm Emulator.
Contains parameter knobs and page selection buttons.
"""

from PySide6.QtWidgets import QWidget, QFrame, QGridLayout, QVBoxLayout, QHBoxLayout, QLabel
from PySide6.QtCore import Signal, Qt

from ..controls.knob_components import VirtualKnob, ParameterKnob
from ..controls.button_components import PageButton
from ..style import Colors


class ParametersSection(QWidget):
    """Parameter controls section of the interface."""
    
    parameter_changed = Signal(str, int)  # Parameter name, value
    page_selected = Signal(str)  # Page name
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_page = "SYNTH"
        self.parameter_knobs = {}
        self.page_buttons = {}
        self.parameter_names = {
            "SYNTH": ["WAVE", "START", "LENGTH", "TUNE", "DECAY", "SNAP", "DRIVE", "LEVEL"],
            "SAMPLE": ["SAMPLE", "SLOT", "REVERSE", "LOOP", "START", "END", "TUNE", "LEVEL"],
            "FILTER": ["TYPE", "CUTOFF", "RESONANCE", "ENV DEPTH", "ENV ATTACK", "ENV DECAY", "ENV MOD", "LFO AMT"],
            "AMP": ["ATTACK", "HOLD", "DECAY", "OVERDRIVE", "DELAY SEND", "REVERB SEND", "PAN", "VOLUME"],
            "LFO": ["WAVE", "SPEED", "MULTIPLIER", "FADE IN", "START PHASE", "TRIG MODE", "DEST", "DEPTH"]
        }
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the parameters section UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)
        
        # Parameter page buttons
        self.page_buttons_frame = self._create_page_buttons()
        layout.addWidget(self.page_buttons_frame)
        
        # Parameter knobs
        self.knobs_frame = self._create_parameter_knobs()
        layout.addWidget(self.knobs_frame)
        
    def _create_page_buttons(self):
        """Create the parameter page selection buttons."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px;")
        
        layout = QHBoxLayout(frame)
        layout.setSpacing(5)
        
        page_names = ["SYNTH", "SAMPLE", "FILTER", "AMP", "LFO"]
        
        for page in page_names:
            btn = PageButton(page)
            btn.setCheckable(True)
            if page == self.current_page:
                btn.setChecked(True)
            
            # Store button reference
            self.page_buttons[page] = btn
            
            # Connect click handler
            btn.clicked.connect(lambda checked, p=page: self._on_page_selected(p))
            
            layout.addWidget(btn)
            
        return frame
        
    def _create_parameter_knobs(self):
        """Create the parameter knobs grid."""
        frame = QFrame()
        frame.setFrameShape(QFrame.StyledPanel)
        frame.setStyleSheet(f"background-color: {Colors.SURFACE_DARKER}; border-radius: 5px; padding: 10px;")
        
        layout = QGridLayout(frame)
        layout.setSpacing(10)
        
        # Create 2x4 grid of parameter knobs
        knob_indices = ["A", "B", "C", "D", "E", "F", "G", "H"]
        param_names = self.parameter_names[self.current_page]
        
        for i, (index, name) in enumerate(zip(knob_indices, param_names)):
            row = i // 4
            col = i % 4
            
            # Create knob container
            container = QWidget()
            container_layout = QVBoxLayout(container)
            container_layout.setContentsMargins(0, 0, 0, 0)
            container_layout.setSpacing(2)
            
            # Create knob
            knob = ParameterKnob(name)
            knob.setFixedSize(50, 50)
            knob.setRange(0, 127)
            knob.setValue(64)  # Default to mid
            knob.value_changed.connect(self._on_parameter_changed)
            
            # Store knob reference
            self.parameter_knobs[name] = knob
            
            # Create label
            label = QLabel(name)
            label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY}; font-size: 9px; qproperty-alignment: AlignCenter;")
            
            # Create index label (A-H)
            index_label = QLabel(index)
            index_label.setStyleSheet(f"color: {Colors.ACCENT}; font-size: 10px; font-weight: bold; qproperty-alignment: AlignCenter;")
            
            # Add to container
            container_layout.addWidget(index_label, 0, Qt.AlignCenter)
            container_layout.addWidget(knob, 0, Qt.AlignCenter)
            container_layout.addWidget(label, 0, Qt.AlignCenter)
            
            # Add container to grid
            layout.addWidget(container, row, col)
            
        return frame
        
    def _on_page_selected(self, page):
        """Handle page button press."""
        if page == self.current_page:
            return
            
        # Update button states
        for name, btn in self.page_buttons.items():
            btn.setChecked(name == page)
            
        self.current_page = page
        self._update_parameter_knobs()
        self.page_selected.emit(page)
        
    def _update_parameter_knobs(self):
        """Update knob labels and functions based on current page."""
        # Get parameter names for current page
        param_names = self.parameter_names[self.current_page]
        
        # Create new knobs dict
        new_knobs = {}
        
        # Update labels and reconnect signals
        for i, name in enumerate(param_names):
            # Get the existing knob
            knobs_list = list(self.parameter_knobs.values())
            if i < len(knobs_list):
                knob = knobs_list[i]
                
                # Update parameter name
                knob.param_name = name
                
                # Update label
                label = knob.parent().findChild(QLabel, "", Qt.FindChildOption.FindChildrenRecursively)
                if label and label.text() != name:
                    label.setText(name)
                    
                # Store with new name
                new_knobs[name] = knob
                
        # Replace knobs dict
        self.parameter_knobs = new_knobs
        
    def _on_parameter_changed(self, param_name, value):
        """Handle parameter value change."""
        self.parameter_changed.emit(param_name, value)
        
    def set_parameter_value(self, name, value):
        """Set a parameter value programmatically."""
        if name in self.parameter_knobs:
            self.parameter_knobs[name].blockSignals(True)
            self.parameter_knobs[name].setValue(value)
            self.parameter_knobs[name].blockSignals(False)
            
    def highlight_parameter(self, name, active=True):
        """Highlight a specific parameter knob."""
        for param_name, knob in self.parameter_knobs.items():
            knob.setActive(param_name == name and active)