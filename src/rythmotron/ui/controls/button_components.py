"""
Button components for the RythmoTron UI.

This module provides various button classes used throughout the RythmoTron interface.
"""

from PySide6.QtWidgets import QPushButton, QToolButton
from PySide6.QtCore import Signal, Qt
from PySide6.QtGui import QIcon

# Update the import path to correctly reference style from the parent package
from ...style import Colors
from ...utils.context import RythmContext


class RytmButton(QPushButton):
    """A styled button that resembles the Analog Rytm hardware buttons."""
    
    def __init__(self, text="", parent=None):
        super().__init__(text, parent)
        self.setFixedSize(80, 30)
        self.is_active = False
        self.setCheckable(True)
        
        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
                padding: 4px;
                font-weight: bold;
            }}
            QPushButton:checked {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Colors.ACCENT};
            }}
        """)
        
    def setActive(self, active):
        """Set whether this button is active."""
        self.is_active = active
        self.setChecked(active)
        self.update()


class TransportButton(QPushButton):
    """Button for transport controls (play, stop, etc.)."""
    
    def __init__(self, icon_name="", tooltip="", parent=None):
        super().__init__(parent)
        self.setFixedSize(40, 40)
        self.setToolTip(tooltip)
        self.is_active = False
        
        # Set icon from resources if provided
        if icon_name:
            self.setIcon(icon_name)
            
        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 20px;
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Colors.ACCENT_DARKER};
            }}
        """)
    
    def setActive(self, active):
        """Set whether this button is in active state."""
        self.is_active = active
        self.update()
        
        # Update style based on active state
        if active:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: {Colors.ACCENT};
                    border: 1px solid {Colors.ACCENT_DARKER};
                    border-radius: 20px;
                }}
                QPushButton:hover {{
                    background-color: {Colors.ACCENT_HOVER};
                }}
                QPushButton:pressed {{
                    background-color: {Colors.ACCENT_DARKER};
                }}
            """)
        else:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: {Colors.SURFACE};
                    border: 1px solid {Colors.GRID_LINES};
                    border-radius: 20px;
                }}
                QPushButton:hover {{
                    background-color: {Colors.SURFACE_HOVER};
                }}
                QPushButton:pressed {{
                    background-color: {Colors.ACCENT_DARKER};
                }}
            """)


class ModeButton(QPushButton):
    """Button for selecting pattern modes."""

    def __init__(self, text, parent=None):
        super().__init__(text, parent)
        self.setFixedHeight(30)
        self.setCheckable(True)
        self.update_style()

    def update_style(self):
        """Update the button's visual style based on its state."""
        if self.isChecked():
            style = f"background-color: {Colors.ACCENT}; color: {Colors.TEXT_PRIMARY};"
        else:
            style = f"background-color: {Colors.SURFACE}; color: {Colors.TEXT_SECONDARY};"
        
        style += " border: 1px solid {Colors.GRID_LINES}; border-radius: 3px; padding: 2px 5px;"
        self.setStyleSheet(style)


class ModeToggleButton(QPushButton):
    """A toggle button for switching between modes."""

    def __init__(self, text="", parent=None):
        super().__init__(text, parent)
        self.setCheckable(True)
        self.setFixedSize(100, 40)

        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 2px solid {Colors.GRID_LINES};
                border-radius: 6px;
                font-weight: bold;
            }}
            QPushButton:checked {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
                border-color: {Colors.ACCENT_DARKER};
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
        """)

    def toggle(self):
        """Toggle the button state."""
        self.setChecked(not self.isChecked())


class PageButton(QPushButton):
    """Button for page navigation."""
    
    def __init__(self, text="", parent=None):
        super().__init__(text, parent)
        self.setFixedWidth(60)
        self.setCheckable(True)
        
        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
                padding: 2px;
            }}
            QPushButton:checked {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
        """)


class FunctionButton(QPushButton):
    """Button for function keys like F1-F8."""
    
    def __init__(self, text="", function_text="", parent=None):
        super().__init__(text, parent)
        self.function_text = function_text
        self.setFixedSize(80, 50)
        
        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
                padding: 4px;
                text-align: center;
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
            }}
        """)
        
    def paintEvent(self, event):
        """Custom paint event to draw function text below button text."""
        super().paintEvent(event)
        
        if not self.function_text:
            return
            
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Draw function text at bottom
        rect = self.rect()
        bottom_rect = rect.adjusted(0, rect.height() - 20, 0, 0)
        
        painter.setPen(QColor(Colors.ACCENT))
        painter.drawText(bottom_rect, Qt.AlignCenter, self.function_text)


class ToggleButton(QPushButton):
    """A toggle button for enabling/disabling features."""

    def __init__(self, text="", parent=None):
        super().__init__(text, parent)
        self.setCheckable(True)
        self.setFixedSize(80, 30)

        # Set the button style
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
                padding: 4px;
            }}
            QPushButton:checked {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
        """)

    def toggle(self):
        """Toggle the button state."""
        self.setChecked(not self.isChecked())


class TrigButton(QPushButton):
    """Button for triggering steps in the sequencer."""

    def __init__(self, step_index, parent=None):
        super().__init__(parent)
        self.step_index = step_index
        self.is_triggered = False
        self.is_current_step = False
        self.has_param_lock = False
        self.setFixedSize(30, 30)
        self.setCheckable(True)
        self.update_style()

    def set_trigger(self, triggered):
        """Set whether this step is triggered."""
        self.is_triggered = triggered
        self.setChecked(triggered)
        self.update_style()

    def set_current_step(self, is_current):
        """Set whether this is the current playing step."""
        self.is_current_step = is_current
        self.update_style()

    def set_param_lock(self, has_lock):
        """Set whether this step has a parameter lock."""
        self.has_param_lock = has_lock
        self.update_style()

    def update_style(self):
        """Update the button's visual style based on its state."""
        if self.is_current_step:
            if self.is_triggered:
                style = f"background-color: {Colors.ACCENT}; border: 2px solid {Colors.ACCENT};"
            else:
                style = f"background-color: {Colors.SURFACE}; border: 2px solid {Colors.ACCENT};"
        else:
            if self.is_triggered:
                style = f"background-color: {Colors.TRIGGER}; border: 2px solid {Colors.TRIGGER};"
            else:
                style = f"background-color: {Colors.SURFACE}; border: 2px solid {Colors.GRID_LINES};"

        if self.has_param_lock:
            style += f" border-left: 4px solid {Colors.PARAM_LOCK};"

        style += " border-radius: 3px;"
        self.setStyleSheet(style)


class ParameterPageButton(QPushButton):
    """A button to select parameter pages (SYNTH, SAMPLE, etc.)"""

    def __init__(self, page_name, parent=None):
        super().__init__(page_name, parent)
        self.page_name = page_name
        self.setCheckable(True)
        self.setFixedHeight(30)
        self.setMinimumWidth(80)
