"""
Sequencer section for the RythmoTron UI.
This section contains step sequencer controls.
"""

from PySide6.QtWidgets import QWidget, QFrame, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QComboBox, QGridLayout
from PySide6.QtCore import Signal, Qt

from ..controls.button_components import TrigButton
from ...style import Colors
from ..rytm_gui import RythmContext


class PageIndicator(QFrame):
    """LED indicator for sequencer page."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(10, 10)
        self.is_active = False
        self.setStyleSheet(f"background-color: {Colors.INACTIVE}; border-radius: 5px;")

    def set_active(self, active):
        """Set whether this page is active."""
        self.is_active = active
        style = f"background-color: {Colors.ACCENT}; border-radius: 5px;" if active else f"background-color: {Colors.INACTIVE}; border-radius: 5px;"
        self.setStyleSheet(style)


class SequencerSection(QWidget):
    """Step sequencer section of the interface."""

    step_toggled = Signal(int, bool)  # Step index, is_active
    scale_changed = Signal(str)  # Scale value
    page_changed = Signal(int)  # Page index

    def __init__(self, context: RythmContext, parent=None):
        super().__init__(parent)
        self.context = context
        self.step_buttons = {}
        self.page_indicators = []
        self.current_page = 0
        self.setup_ui()

    def setup_ui(self):
        """Set up the sequencer UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # Create the sequencer frame
        sequencer_frame = QFrame()
        sequencer_frame.setFrameShape(QFrame.StyledPanel)
        sequencer_frame.setStyleSheet(f"QFrame {{ background-color: {Colors.SURFACE_DARKER}; border-radius: 5px; padding: 10px; }}")

        sequencer_layout = QVBoxLayout(sequencer_frame)

        # Step buttons grid
        steps_widget = QWidget()
        steps_layout = QGridLayout(steps_widget)
        steps_layout.setSpacing(5)
        steps_layout.setContentsMargins(0, 0, 0, 0)

        # Create 2 rows of 8 steps each (16 steps total)
        for i in range(16):
            row, col = divmod(i, 8)
            step_btn = TrigButton(i)
            step_btn.clicked.connect(lambda checked, s=i: self._on_step_toggled(s, checked))
            self.step_buttons[i] = step_btn
            steps_layout.addWidget(step_btn, row, col)

        sequencer_layout.addWidget(steps_widget)

        # Sequencer controls
        controls_widget = QWidget()
        controls_layout = QVBoxLayout(controls_widget)
        controls_layout.setContentsMargins(0, 10, 0, 0)

        # Page indicator LEDs
        page_frame = QFrame()
        page_layout = QVBoxLayout(page_frame)
        page_layout.setSpacing(5)
        page_layout.setContentsMargins(0, 0, 0, 0)

        page_label = QLabel("PAGE:")
        page_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        page_layout.addWidget(page_label)

        for i in range(4):
            indicator = PageIndicator()
            if i == 0:
                indicator.set_active(True)
            self.page_indicators.append(indicator)
            page_layout.addWidget(indicator)

        controls_layout.addWidget(page_frame)

        # Scale control
        scale_label = QLabel("SCALE:")
        scale_label.setStyleSheet(f"color: {Colors.TEXT_SECONDARY};")
        controls_layout.addWidget(scale_label)

        self.scale_combo = QComboBox()
        self.scale_combo.addItems(["1/16", "1/8", "1/4", "1/32", "1/64"])
        self.scale_combo.setStyleSheet(f"QComboBox {{ background-color: {Colors.SURFACE}; color: {Colors.TEXT_PRIMARY}; border: 1px solid {Colors.GRID_LINES}; border-radius: 3px; padding: 2px 5px; }}")
        self.scale_combo.currentTextChanged.connect(self._on_scale_changed)
        controls_layout.addWidget(self.scale_combo)

        sequencer_layout.addWidget(controls_widget)
        layout.addWidget(sequencer_frame)

    def _on_step_toggled(self, step, is_checked):
        """Handle step button toggle."""
        self.step_buttons[step].set_trigger(is_checked)
        self.step_toggled.emit(step, is_checked)

    def _on_scale_changed(self, scale_text):
        """Handle sequencer scale change."""
        self.scale_changed.emit(scale_text)

    def set_current_step(self, step):
        """Set the currently playing step."""
        if step != self.context.current_step:
            if 0 <= self.context.current_step < 16:
                self.step_buttons[self.context.current_step].set_current_step(False)
            self.context.current_step = step
            if 0 <= step < 16:
                self.step_buttons[step].set_current_step(True)

    def set_page(self, page):
        """Set the current page (0-3)."""
        for i, indicator in enumerate(self.page_indicators):
            indicator.set_active(i == page)
        self.current_page = page
        self.page_changed.emit(page)

    def clear_all_steps(self):
        """Clear all triggers and parameter locks."""
        for button in self.step_buttons.values():
            button.set_trigger(False)
            button.set_param_lock(False)
