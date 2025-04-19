"""
Pad components for the RythmoTron UI.

This module provides drum pad components used in the RythmoTron interface.
"""

from PySide6.QtWidgets import QPushButton
from PySide6.QtCore import Qt, Signal, QPropertyAnimation
from PySide6.QtGui import QPainter, QColor, QPen, QPainterPath

# Update the import path to correctly reference style and constants from the parent package
from ...style import Colors
from ...constants import Track, TRACK_COLORS

# Import RythmContext to consume state
from ..rytm_gui import RythmContext

class VirtualPad(QPushButton):
    """A virtual drum pad that can be pressed and show different states."""
    
    def __init__(self, track_name, track_color, parent=None):
        super().__init__(parent)
        self.track_name = track_name
        self.track_color = track_color
        self.is_selected = False
        self.is_active = True  # Default to active
        self.velocity = 0
        self.aftertouch = 0
        self.is_triggered = False
        self.trigger_countdown = 0
        
        # Configure appearance
        self.setFixedSize(70, 70)
        self.setText(track_name)
        self.setCheckable(True)
        
    def setSelected(self, selected):
        """Set whether this pad is selected (current track)."""
        self.is_selected = selected
        self.update()
        
    def setActive(self, active):
        """Set whether this pad is active (has sound)."""
        self.is_active = active
        self.update()
        
    def setVelocity(self, velocity):
        """Set velocity value (0-127) for visual feedback."""
        self.velocity = min(127, max(0, velocity))
        self.update()
        
    def setAftertouch(self, aftertouch):
        """Set aftertouch value (0-127) for visual feedback."""
        self.aftertouch = min(127, max(0, aftertouch))
        self.update()
        
    def triggerVisualFeedback(self):
        """Trigger a visual flash for sequencer playback."""
        self.is_triggered = True
        self.trigger_countdown = 5  # Will count down in timer events
        self.update()
        
    def decrementTrigger(self):
        """Count down the trigger visual feedback."""
        if self.trigger_countdown > 0:
            self.trigger_countdown -= 1
            if self.trigger_countdown == 0:
                self.is_triggered = False
            self.update()
            
    def paintEvent(self, event):
        """Custom paint event to draw the pad with visual feedback."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect().adjusted(2, 2, -2, -2)
        
        # Draw base pad
        base_color = QColor(self.track_color)
        if not self.is_active:
            base_color.setAlpha(60)  # Dim if inactive
        
        # Border radius for rounded corners
        border_radius = 10
        
        # Draw background
        path = QPainterPath()
        path.addRoundedRect(rect, border_radius, border_radius)
        painter.fillPath(path, QColor(Colors.SURFACE))
        
        # Draw border
        border_pen = QPen(base_color)
        border_pen.setWidth(2)
        painter.setPen(border_pen)
        painter.drawRoundedRect(rect, border_radius, border_radius)
        
        # Selected state (current track)
        if self.is_selected:
            # Draw a red border around the selected track
            select_pen = QPen(QColor("#FF3333"))
            select_pen.setWidth(3)
            painter.setPen(select_pen)
            painter.drawRoundedRect(rect.adjusted(1, 1, -1, -1), border_radius, border_radius)
        
        # Pressed state (isDown)
        if self.isDown() or self.isChecked():
            # Fill with track color when pressed
            inner_rect = rect.adjusted(3, 3, -3, -3)
            
            # Fill with gradient based on velocity if available
            intensity = self.velocity / 127 if self.velocity > 0 else 0.8
            
            # Make color brighter based on velocity
            glow_color = QColor(self.track_color)
            if intensity < 0.5:
                glow_color = glow_color.darker(150 - intensity * 100)
            else:
                glow_color = glow_color.lighter(100 + intensity * 50)
                
            painter.fillRect(inner_rect, glow_color)
            
        # Triggered by sequencer
        if self.is_triggered:
            # Flash white when triggered by sequencer
            flash_color = QColor("#FFFFFF")
            flash_color.setAlpha(180 - (5 - self.trigger_countdown) * 30)  # Fade out
            painter.fillRect(rect.adjusted(5, 5, -5, -5), flash_color)
        
        # Draw text
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        painter.drawText(rect, Qt.AlignCenter, self.track_name)


class DrumPad(QPushButton):
    """A drum pad button for triggering sounds."""
    
    pressed = Signal(int)
    released = Signal(int)
    
    def __init__(self, pad_index, parent=None):
        super().__init__(parent)
        self.pad_index = pad_index
        self.track_name = Track.get_name_by_index(pad_index)
        self.track_color = TRACK_COLORS[pad_index]
        
        # Configure appearance
        self.setFixedSize(100, 100)
        self.setText(self.track_name)
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 2px solid {self.track_color};
                border-radius: 10px;
                font-weight: bold;
            }}
            QPushButton:pressed {{
                background-color: {self.track_color};
            }}
        """)
        
    def mousePressEvent(self, event):
        super().mousePressEvent(event)
        self.pressed.emit(self.pad_index)
        
    def mouseReleaseEvent(self, event):
        super().mouseReleaseEvent(event)
        self.released.emit(self.pad_index)
