"""
Display Section for the RythmoTron UI.
This section shows the main LCD display with parameter pages and values.
"""

from PySide6.QtWidgets import QWidget, QFrame, QVBoxLayout, QHBoxLayout, QLabel, QStackedWidget
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QColor, QPainter
from ..components.display_component import DisplayComponent
from ...display.engine import DisplayEngine
from ...style import Colors
from ...utils.context import RythmContext
from ...utils.app_context import AppContext


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
    """Section containing the display component and its controls."""
    
    # Signals
    page_changed = Signal(str)  # Emitted when display page changes
    
    def __init__(self, context: AppContext):
        """Initialize the display section."""
        super().__init__()
        self.context = context
        self.display_engine = DisplayEngine(self)
        self.skin_manager = context.skin_manager
        self.setup_ui()
        self.connect_signals()
        
        # Set initial state
        self.current_page = "SYNTH"
        self.update_display()
    
    def setup_ui(self):
        """Set up the display section UI."""
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(0)
        
        # Create display component
        self.display = DisplayComponent(self.display_engine, self.skin_manager)
        self.layout.addWidget(self.display)
        
        # Set background color
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {Colors.BACKGROUND};
                border-radius: 4px;
            }}
        """)
    
    def connect_signals(self):
        """Connect signals to slots."""
        # Connect display engine signals
        self.display_engine.track_triggered.connect(self._on_track_triggered)
        self.display_engine.step_highlighted.connect(self._on_step_highlighted)
        self.display_engine.parameter_changed.connect(self._on_parameter_changed)
    
    def set_page(self, page: str):
        """Set the current display page."""
        if page == self.current_page:
            return
            
        self.current_page = page
        self.page_changed.emit(page)
        self.update_display()
    
    def set_parameter_value(self, name: str, value: float):
        """Update a parameter value in the display."""
        self.display_engine.update_parameter(name, value)
    
    def highlight_parameter(self, name: str, highlight: bool):
        """Highlight a parameter in the display."""
        if highlight:
            self.display_engine.update_parameter(name, self.context.get_parameter(name))
    
    def update_display(self):
        """Update the display with current state."""
        # Update track states
        for track in self.context.tracks:
            is_active = self.context.is_track_active(track)
            self.display_engine.trigger_track(track, is_active)
        
        # Update step highlighting
        current_step = self.context.current_step
        for step in range(64):
            is_current = (step == current_step)
            self.display_engine.highlight_step(step, is_current)
        
        # Update parameters
        for param in self.context.get_page_parameters(self.current_page):
            value = self.context.get_parameter(param)
            self.display_engine.update_parameter(param, value)
    
    def _on_track_triggered(self, track, is_triggered):
        """Handle track trigger events."""
        self.display.update()
    
    def _on_step_highlighted(self, step, is_highlighted):
        """Handle step highlight events."""
        self.display.update()
    
    def _on_parameter_changed(self, name, value):
        """Handle parameter change events."""
        self.display.update()
