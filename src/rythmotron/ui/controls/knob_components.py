"""
Knob and dial components for the RythmoTron UI.

This module provides various knob and dial classes used throughout the RythmoTron interface.
"""

from PySide6.QtWidgets import QDial, QWidget
from PySide6.QtCore import Signal, Qt, QPointF
from PySide6.QtGui import QPainter, QColor, QPen, QLinearGradient

# Update the import path to correctly reference style from the parent package
from ...style import Colors

# Import RythmContext to consume state
from ...utils.context import RythmContext


class VirtualKnob(QDial):
    """A custom knob control with visual feedback."""
    
    def __init__(self, param_name="", parent=None):
        super().__init__(parent)
        self.param_name = param_name
        self.setFixedSize(60, 60)
        self.setNotchesVisible(True)
        self.setWrapping(False)
        self.setRange(0, 127)
        self.setSingleStep(1)
        self.setPageStep(5)
        self.setValue(64)  # Default center value
        
        # Appearance settings
        self.knob_color = QColor(Colors.SURFACE)
        self.indicator_color = QColor(Colors.ACCENT)
        self.is_active = False
        
    def setActive(self, active):
        """Set whether this knob is active/focused."""
        self.is_active = active
        self.update()
        
    def paintEvent(self, event):
        """Custom paint event to draw the knob."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect()
        center = rect.center()
        radius = min(rect.width(), rect.height()) / 2 - 5
        
        # Draw knob base
        painter.setBrush(self.knob_color)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(center, radius, radius)
        
        # Draw border
        border_color = QColor(Colors.ACCENT) if self.is_active else QColor(Colors.GRID_LINES)
        border_pen = QPen(border_color)
        border_pen.setWidth(2)
        painter.setPen(border_pen)
        painter.drawEllipse(center, radius, radius)
        
        # Calculate angle based on value
        angle = (self.value() - self.minimum()) * 270 / (self.maximum() - self.minimum()) - 225
        
        # Draw indicator line
        painter.save()
        painter.translate(center)
        painter.rotate(angle)
        
        indicator_pen = QPen(self.indicator_color)
        indicator_pen.setWidth(3)
        painter.setPen(indicator_pen)
        painter.drawLine(0, 0, 0, -radius + 5)
        
        painter.restore()
        
        # Draw value indicator dot at end of line
        dot_x = center.x() + (radius - 8) * -1 * (angle - 90) * 3.14159 / 180
        dot_y = center.y() + (radius - 8) * -1 * (angle + 180) * 3.14159 / 180
        
        painter.setBrush(self.indicator_color)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(int(dot_x), int(dot_y), 6, 6)


class ParameterKnob(QDial):
    """Knob for controlling parameters."""
    
    value_changed = Signal(str, int)
    
    def __init__(self, param_name="", parent=None):
        super().__init__(parent)
        self.param_name = param_name
        self.setFixedSize(50, 50)
        self.setRange(0, 127)
        self.setNotchesVisible(True)
        
        # Connect value change signal
        self.valueChanged.connect(self._on_value_changed)
        
    def _on_value_changed(self, value):
        self.value_changed.emit(self.param_name, value)
        
    def paintEvent(self, event):
        """Custom paint event to draw the parameter knob."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect()
        center = rect.center()
        radius = min(rect.width(), rect.height()) / 2 - 5
        
        # Draw knob base
        painter.setBrush(QColor(Colors.SURFACE))
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(center, radius, radius)
        
        # Draw border
        border_pen = QPen(QColor(Colors.GRID_LINES))
        border_pen.setWidth(2)
        painter.setPen(border_pen)
        painter.drawEllipse(center, radius, radius)
        
        # Calculate angle based on value
        angle = (self.value() - self.minimum()) * 270 / (self.maximum() - self.minimum()) - 225
        
        # Draw indicator line
        painter.save()
        painter.translate(center)
        painter.rotate(angle)
        
        indicator_pen = QPen(QColor(Colors.ACCENT))
        indicator_pen.setWidth(3)
        painter.setPen(indicator_pen)
        painter.drawLine(0, 0, 0, -radius + 5)
        
        painter.restore()


class DataKnob(QDial):
    """Larger data entry knob with value display."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(100, 100)
        self.setNotchesVisible(True)
        self.setRange(0, 127)
        
        # Display value
        self.display_value = 0
        self.display_text = ""
        
    def setDisplayText(self, text):
        """Set text to display alongside the value."""
        self.display_text = text
        self.update()
        
    def setDisplayValue(self, value):
        """Set the value to display."""
        self.display_value = value
        self.update()
        
    def paintEvent(self, event):
        """Custom paint event to draw the data knob."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect()
        center = rect.center()
        radius = min(rect.width(), rect.height()) / 2 - 10
        
        # Draw knob base
        gradient = QLinearGradient(rect.topLeft(), rect.bottomRight())
        gradient.setColorAt(0, QColor(Colors.SURFACE).lighter(110))
        gradient.setColorAt(1, QColor(Colors.SURFACE).darker(110))
        
        painter.setBrush(gradient)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(center, radius, radius)
        
        # Draw border
        border_pen = QPen(QColor(Colors.ACCENT))
        border_pen.setWidth(3)
        painter.setPen(border_pen)
        painter.drawEllipse(center, radius, radius)
        
        # Calculate angle based on value
        angle = (self.value() - self.minimum()) * 270 / (self.maximum() - self.minimum()) - 225
        
        # Draw indicator line
        painter.save()
        painter.translate(center)
        painter.rotate(angle)
        
        indicator_pen = QPen(QColor(Colors.TEXT_PRIMARY))
        indicator_pen.setWidth(4)
        painter.setPen(indicator_pen)
        painter.drawLine(0, 0, 0, -radius + 10)
        
        painter.restore()
        
        # Draw value text
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        painter.drawText(rect, Qt.AlignCenter, f"{self.display_value}")
        
        # Draw parameter name
        if self.display_text:
            text_rect = rect.adjusted(0, radius + 5, 0, 0)
            painter.drawText(text_rect, Qt.AlignHCenter | Qt.AlignTop, self.display_text)
