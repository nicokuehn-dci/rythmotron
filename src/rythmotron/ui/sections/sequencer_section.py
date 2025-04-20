"""
Sequencer section for the RythmoTron UI.
This section contains step sequencer controls.
"""

from PySide6.QtWidgets import (QWidget, QFrame, QVBoxLayout, QHBoxLayout, 
                              QPushButton, QLabel, QComboBox, QGridLayout,
                              QSpinBox, QButtonGroup)
from PySide6.QtCore import Signal, Qt, QTimer

from ..controls.button_components import TrigButton, ModeButton
from ...style import Colors
from ...utils.context import RythmContext, PatternMode


class PageIndicator(QWidget):
    """Indicator for the current page in the sequencer."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(8, 8)
        self.is_active = False
        self.update_style()
    
    def set_active(self, active):
        """Set whether this page indicator is active."""
        self.is_active = active
        self.update_style()
    
    def update_style(self):
        """Update the visual style based on active state."""
        color = Colors.ACCENT if self.is_active else Colors.INACTIVE
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {color};
                border-radius: 4px;
            }}
        """)


class SequencerGrid(QWidget):
    """Grid of step buttons for the sequencer."""
    
    step_toggled = Signal(int, bool)  # Step index, is_active
    
    def __init__(self, context: RythmContext, parent=None):
        super().__init__(parent)
        self.context = context
        self.step_buttons = {}
        self.current_page = 0
        self.setup_ui()
        self.setup_connections()
    
    def setup_ui(self):
        """Set up the grid layout and step buttons."""
        layout = QGridLayout(self)
        layout.setSpacing(4)
        layout.setContentsMargins(4, 4, 4, 4)
        
        # Create 4 rows of 8 steps each (32 steps total per page)
        for i in range(32):
            row, col = divmod(i, 8)
            step_btn = TrigButton(i)
            self.step_buttons[i] = step_btn
            layout.addWidget(step_btn, row, col)
    
    def setup_connections(self):
        """Set up signal connections for step buttons."""
        for i, btn in self.step_buttons.items():
            btn.clicked.connect(lambda checked, s=i: self._on_step_toggled(s, checked))
    
    def _on_step_toggled(self, step, is_checked):
        """Handle step button toggle."""
        actual_step = step + (self.current_page * 32)
        self.step_buttons[step].set_trigger(is_checked)
        self.context.set_step_trigger(actual_step, self.context.current_track, is_checked)
        self.step_toggled.emit(actual_step, is_checked)
    
    def set_page(self, page):
        """Set the current page and update step buttons."""
        if 0 <= page <= 3 and page != self.current_page:
            self.current_page = page
            
            # Update step buttons for the new page
            pattern = self.context.get_current_pattern()
            for i in range(32):
                step = i + (page * 32)
                is_triggered = pattern.steps[step].triggers[self.context.current_track]
                self.step_buttons[i].set_trigger(is_triggered)
                
                # Update current step indicator
                is_current = (step == self.context.current_step)
                self.step_buttons[i].set_current_step(is_current)
    
    def set_current_step(self, step):
        """Set the currently playing step."""
        if step != self.context.current_step:
            # Update previous step
            if 0 <= self.context.current_step < 64:
                prev_page = self.context.current_step // 32
                prev_step = self.context.current_step % 32
                if prev_page == self.current_page:
                    self.step_buttons[prev_step].set_current_step(False)
            
            self.context.current_step = step
            
            # Update current step
            if 0 <= step < 64:
                current_page = step // 32
                current_step = step % 32
                if current_page == self.current_page:
                    self.step_buttons[current_step].set_current_step(True)
    
    def clear_all_steps(self):
        """Clear all triggers and parameter locks."""
        pattern = self.context.get_current_pattern()
        for i in range(32):
            step = i + (self.current_page * 32)
            pattern.steps[step].triggers[self.context.current_track] = False
            self.step_buttons[i].set_trigger(False)
            self.step_buttons[i].set_param_lock(False)


class SequencerSection(QWidget):
    """Main sequencer section containing the grid and controls."""
    
    step_toggled = Signal(int, bool)  # Step index, is_active
    scale_changed = Signal(str)  # Scale value
    page_changed = Signal(int)  # Page index
    pattern_changed = Signal(int)  # Pattern index
    pattern_mode_changed = Signal(PatternMode)  # Pattern mode
    tempo_changed = Signal(int)  # BPM
    
    def __init__(self, context: RythmContext, parent=None):
        super().__init__(parent)
        self.context = context
        self.setup_ui()
        self.setup_connections()
        
        # Create timer for step updates
        self.step_timer = QTimer(self)
        self.step_timer.timeout.connect(self._update_current_step)
        self._update_timer_interval()
    
    def setup_ui(self):
        """Set up the user interface."""
        # Main layout
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Pattern controls
        pattern_controls = QWidget()
        pattern_layout = QHBoxLayout(pattern_controls)
        pattern_layout.setContentsMargins(0, 0, 0, 0)
        
        # Pattern selection
        pattern_label = QLabel("PATTERN:")
        pattern_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        pattern_layout.addWidget(pattern_label)
        
        self.pattern_spin = QSpinBox()
        self.pattern_spin.setRange(1, 128)
        self.pattern_spin.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 2px 5px;
            }}
        """)
        pattern_layout.addWidget(self.pattern_spin)
        
        # Pattern mode buttons
        mode_group = QButtonGroup(self)
        for mode in PatternMode:
            btn = ModeButton(mode.value)
            btn.setCheckable(True)
            mode_group.addButton(btn)
            pattern_layout.addWidget(btn)
        pattern_layout.addStretch()
        
        layout.addWidget(pattern_controls)
        
        # Grid container
        grid_container = QWidget()
        grid_container.setStyleSheet(f"""
            QWidget {{
                background-color: {Colors.SURFACE};
                border-radius: 8px;
            }}
        """)
        grid_layout = QVBoxLayout(grid_container)
        grid_layout.setSpacing(0)
        grid_layout.setContentsMargins(0, 0, 0, 0)
        
        # Add grid to container
        self.grid = SequencerGrid(self.context)
        grid_layout.addWidget(self.grid)
        
        layout.addWidget(grid_container)
        
        # Controls section
        controls = QWidget()
        controls_layout = QVBoxLayout(controls)
        controls_layout.setSpacing(8)
        controls_layout.setContentsMargins(0, 0, 0, 0)
        
        # Page indicators
        page_container = QWidget()
        page_layout = QHBoxLayout(page_container)
        page_layout.setSpacing(8)
        page_layout.setContentsMargins(0, 0, 0, 0)
        
        page_label = QLabel("PAGE:")
        page_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        page_layout.addWidget(page_label)
        
        self.page_indicators = []
        for _ in range(4):  # 4 pages
            indicator = PageIndicator()
            self.page_indicators.append(indicator)
            page_layout.addWidget(indicator)
        
        page_layout.addStretch()
        controls_layout.addWidget(page_container)
        
        # Scale control
        scale_label = QLabel("SCALE:")
        scale_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        controls_layout.addWidget(scale_label)
        
        self.scale_combo = QComboBox()
        self.scale_combo.addItems(["1/16", "1/8", "1/4", "1/32", "1/64"])
        self.scale_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 2px 5px;
            }}
        """)
        controls_layout.addWidget(self.scale_combo)
        
        # Tempo control
        tempo_label = QLabel("TEMPO:")
        tempo_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        controls_layout.addWidget(tempo_label)
        
        self.tempo_spin = QSpinBox()
        self.tempo_spin.setRange(20, 999)
        self.tempo_spin.setValue(120)
        self.tempo_spin.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 2px 5px;
            }}
        """)
        controls_layout.addWidget(self.tempo_spin)
        
        layout.addWidget(controls)
    
    def setup_connections(self):
        """Set up signal connections."""
        self.pattern_spin.valueChanged.connect(self._on_pattern_changed)
        self.scale_combo.currentTextChanged.connect(self._on_scale_changed)
        self.tempo_spin.valueChanged.connect(self._on_tempo_changed)
        self.grid.step_toggled.connect(self.step_toggled)
        
        # Connect pattern mode buttons
        for btn in self.findChildren(ModeButton):
            if btn.text() in [mode.value for mode in PatternMode]:
                btn.clicked.connect(lambda checked, b=btn: self._on_pattern_mode_changed(b.text()))
    
    def _on_pattern_changed(self, pattern_index):
        """Handle pattern change."""
        self.context.current_pattern = pattern_index - 1  # Convert to 0-based index
        self.pattern_changed.emit(pattern_index - 1)
    
    def _on_scale_changed(self, scale_text):
        """Handle sequencer scale change."""
        pattern = self.context.get_current_pattern()
        pattern.scale = scale_text
        self.scale_changed.emit(scale_text)
    
    def _on_pattern_mode_changed(self, mode_text):
        """Handle pattern mode change."""
        mode = PatternMode(mode.value)
        self.context.pattern_mode = mode
        self.pattern_mode_changed.emit(mode)
    
    def _on_tempo_changed(self, value):
        """Handle tempo change."""
        self.context.tempo = value
        self.tempo_changed.emit(value)
        self._update_timer_interval()
    
    def _update_timer_interval(self):
        """Update the step timer interval based on current tempo."""
        # Calculate interval in milliseconds based on BPM
        # For 1/16 notes: 60000ms / (BPM * 4)
        interval = int(60000 / (self.context.tempo * 4))
        self.step_timer.setInterval(interval)
    
    def _update_current_step(self):
        """Update the current step when playing."""
        if self.context.is_playing:
            pattern = self.context.get_current_pattern()
            next_step = (self.context.current_step + 1) % pattern.length
            
            # Update page if needed
            new_page = next_step // 32
            if new_page != self.grid.current_page:
                self.set_page(new_page)
            
            self.grid.set_current_step(next_step)
    
    def set_page(self, page_index):
        """Set the active page and update indicators."""
        if 0 <= page_index < len(self.page_indicators):
            for i, indicator in enumerate(self.page_indicators):
                indicator.set_active(i == page_index)
            self.grid.set_page(page_index)
            self.page_changed.emit(page_index)
    
    def start_playback(self):
        """Start the sequencer playback."""
        if not self.context.is_playing:
            self.context.is_playing = True
            self.step_timer.start()
    
    def stop_playback(self):
        """Stop the sequencer playback."""
        if self.context.is_playing:
            self.context.is_playing = False
            self.step_timer.stop()
    
    def clear_all_steps(self):
        """Clear all triggers and parameter locks."""
        self.grid.clear_all_steps()
