"""
Button components for the RythmoTron UI.

This module provides various button classes used throughout the RythmoTron interface.
"""

from PySide6.QtWidgets import QPushButton, QToolButton
from PySide6.QtCore import Signal, Qt
from PySide6.QtGui import QIcon

# Update the import path to correctly reference style from the parent package
from ...style import Colors
from ..rytm_gui import RythmContext


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
    """Button for selecting different modes and views."""
    
    def __init__(self, text="", parent=None):
        super().__init__(text, parent)
        self.setFixedSize(100, 40)
        self.setCheckable(True)
        
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
    """A sequencer trig button that shows different states."""

    def __init__(self, step_num, parent=None):
        super().__init__(parent)
        self.step_num = step_num
        self.has_trig = False
        self.has_param_lock = False
        self.is_current_step = False

        # Configure appearance
        self.setFixedSize(40, 30)
        self.setText(str(step_num + 1))
        self.setCheckable(True)

    def setHasTrig(self, has_trig):
        """Set whether this step has a trigger."""
        self.has_trig = has_trig
        self.update()

    def setHasParamLock(self, has_lock):
        """Set whether this step has parameter locks."""
        self.has_param_lock = has_lock
        self.update()

    def setCurrentStep(self, is_current):
        """Set whether this is the current playing step."""
        self.is_current_step = is_current
        self.update()

    def paintEvent(self, event):
        """Custom paint event to draw the trig button."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # Get the rect to draw in
        rect = self.rect()

        # Draw base button
        base_color = QColor(Colors.SURFACE)
        painter.fillRect(rect, base_color)

        # Border
        border_color = QColor(Colors.GRID_LINES)
        if self.isChecked():
            border_color = QColor(Colors.ACCENT)

        border_pen = QPen(border_color)
        border_pen.setWidth(1)
        painter.setPen(border_pen)
        painter.drawRect(rect.adjusted(1, 1, -1, -1))

        # Draw LED indicator
        led_rect = QRect(rect.right() - 12, rect.top() + 3, 8, 8)

        if self.has_trig:
            if self.has_param_lock:
                # Parameter lock - orange pulsing effect (simplified here)
                painter.setBrush(QColor(Colors.ACCENT).lighter(120))
            else:
                # Regular trig - solid orange
                painter.setBrush(QColor(Colors.ACCENT))
            painter.setPen(Qt.NoPen)
            painter.drawEllipse(led_rect)

        # Current step indicator - white LED
        if self.is_current_step:
            current_rect = QRect(rect.left() + 3, rect.top() + 3, 8, 8)
            painter.setBrush(QColor("#FFFFFF"))
            painter.setPen(Qt.NoPen)
            painter.drawEllipse(current_rect)

        # Draw step number
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        if self.is_current_step or self.isChecked():
            # Use bold text for current step
            font = painter.font()
            font.setBold(True)
            painter.setFont(font)

        painter.drawText(rect, Qt.AlignCenter, str(self.step_num + 1))


class ParameterPageButton(QPushButton):
    """A button to select parameter pages (SYNTH, SAMPLE, etc.)"""

    def __init__(self, page_name, parent=None):
        super().__init__(page_name, parent)
        self.page_name = page_name
        self.setCheckable(True)
        self.setFixedHeight(30)
        self.setMinimumWidth(80)
