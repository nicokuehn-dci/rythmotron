"""
Virtual Pad widget for the RythmoTron UI.
This widget represents a drum pad that can be pressed and triggered.
"""

from PySide6.QtWidgets import QPushButton, QSizePolicy
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QPainter, QColor, QPen, QBrush

class VirtualPad(QPushButton):
    """A virtual drum pad button that can be pressed and triggered."""
    
    def __init__(self, name: str, color: str, parent=None):
        super().__init__(parent)
        self.name = name
        self.color = QColor(color)
        self.is_selected = False
        self.is_active = True
        self.trigger_level = 0  # 0-100 for visual feedback
        
        # Set up the button
        self.setCheckable(True)
        self.setMinimumSize(80, 80)
        self.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        
    def paintEvent(self, event):
        """Custom paint event to draw the pad with visual feedback."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Calculate colors
        base_color = self.color
        if not self.is_active:
            base_color = base_color.darker(150)
        if self.is_selected:
            base_color = base_color.lighter(120)
            
        # Draw the pad background
        painter.setPen(Qt.NoPen)
        painter.setBrush(QBrush(base_color))
        painter.drawRoundedRect(self.rect(), 10, 10)
        
        # Draw the trigger level indicator
        if self.trigger_level > 0:
            highlight_color = QColor(255, 255, 255, int(self.trigger_level * 2.55))
            painter.setBrush(QBrush(highlight_color))
            painter.drawRoundedRect(self.rect(), 10, 10)
            
        # Draw the border
        if self.is_selected:
            pen = QPen(QColor(255, 255, 255), 2)
        else:
            pen = QPen(base_color.darker(120), 1)
        painter.setPen(pen)
        painter.drawRoundedRect(self.rect().adjusted(1, 1, -1, -1), 10, 10)
        
        # Draw the name
        painter.setPen(QColor(255, 255, 255))
        painter.drawText(self.rect(), Qt.AlignCenter, self.name)
        
    def setSelected(self, selected: bool):
        """Set whether the pad is selected."""
        if self.is_selected != selected:
            self.is_selected = selected
            self.update()
            
    def setActive(self, active: bool):
        """Set whether the pad is active."""
        if self.is_active != active:
            self.is_active = active
            self.update()
            
    def triggerVisualFeedback(self):
        """Trigger visual feedback animation."""
        self.trigger_level = 100
        self.update()
        
    def decrementTrigger(self):
        """Decrement the trigger level for animation."""
        if self.trigger_level > 0:
            self.trigger_level = max(0, self.trigger_level - 10)
            self.update() 