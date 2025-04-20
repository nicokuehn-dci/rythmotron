"""
Mixer component for RythmoTron.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QSlider, QFrame, QScrollArea, QSizePolicy
)
from PySide6.QtCore import Qt, Signal, Slot, Property, QSize, QRect
from PySide6.QtGui import QPainter, QColor, QLinearGradient, QPen, QFont

from ..style.colors import Colors
from ...audio.mixer import Mixer, ChannelStrip
from ...style.skin_manager import SkinManager

class ChannelStripWidget(QWidget):
    """Widget for a mixer channel strip."""
    
    def __init__(self, channel: ChannelStrip, skin_manager: SkinManager, parent=None):
        """Initialize the channel strip widget.
        
        Args:
            channel: Channel strip
            skin_manager: Skin manager
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.channel = channel
        self.skin_manager = skin_manager
        
        # Set up widget
        self.setMinimumWidth(80)
        self.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Expanding)
        
        # Create layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)
        
        # Channel name
        self.name_label = QLabel(channel.name)
        self.name_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.name_label)
        
        # Mute button
        self.mute_button = QPushButton("M")
        self.mute_button.setCheckable(True)
        self.mute_button.setChecked(channel.mute)
        self.mute_button.clicked.connect(self._on_mute_clicked)
        layout.addWidget(self.mute_button)
        
        # Solo button
        self.solo_button = QPushButton("S")
        self.solo_button.setCheckable(True)
        self.solo_button.setChecked(channel.solo)
        self.solo_button.clicked.connect(self._on_solo_clicked)
        layout.addWidget(self.solo_button)
        
        # Fader
        self.fader = QFrame()
        self.fader.setFrameShape(QFrame.StyledPanel)
        self.fader.setMinimumHeight(200)
        self.fader.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Expanding)
        layout.addWidget(self.fader)
        
        # Level meter
        self.meter = QFrame()
        self.meter.setFrameShape(QFrame.StyledPanel)
        self.meter.setMinimumHeight(20)
        self.meter.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        layout.addWidget(self.meter)
        
        # Pan control
        self.pan_label = QLabel("Pan")
        self.pan_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.pan_label)
        
        self.pan_control = QFrame()
        self.pan_control.setFrameShape(QFrame.StyledPanel)
        self.pan_control.setMinimumHeight(20)
        self.pan_control.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        layout.addWidget(self.pan_control)
        
        # Apply skin
        self._apply_skin()
    
    def update_levels(self, peak: float, rms: float):
        """Update the level meter.
        
        Args:
            peak: Peak level (0.0 to 1.0)
            rms: RMS level (0.0 to 1.0)
        """
        self.channel.peak_level = peak
        self.channel.rms_level = rms
        self.meter.update()
    
    def _on_mute_clicked(self, checked: bool):
        """Handle mute button click.
        
        Args:
            checked: Button checked state
        """
        self.channel.mute = checked
        self._apply_skin()
    
    def _on_solo_clicked(self, checked: bool):
        """Handle solo button click.
        
        Args:
            checked: Button checked state
        """
        self.channel.solo = checked
        self._apply_skin()
    
    def _apply_skin(self):
        """Apply the current skin to the widget."""
        # Set widget style
        self.setStyleSheet(f"""
            QWidget {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QLabel {{
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QPushButton {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QPushButton:hover {{
                background: {self.skin_manager.get_color('ACCENT')};
            }}
            QPushButton:checked {{
                background: {self.skin_manager.get_color('ACCENT')};
            }}
            QFrame {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
            }}
        """)
    
    def paintEvent(self, event):
        """Handle paint event.
        
        Args:
            event: Paint event
        """
        super().paintEvent(event)
        
        # Draw fader
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get fader rect
        fader_rect = self.fader.geometry()
        
        # Draw fader background
        painter.fillRect(fader_rect, self.skin_manager.get_color('SURFACE_DARK'))
        
        # Draw fader position
        position = self.channel.fader_position
        position_height = int(fader_rect.height() * position)
        position_rect = QRect(
            fader_rect.left(),
            fader_rect.bottom() - position_height,
            fader_rect.width(),
            position_height
        )
        painter.fillRect(position_rect, self.skin_manager.get_color('ACCENT'))
        
        # Draw meter
        meter_rect = self.meter.geometry()
        
        # Draw meter background
        painter.fillRect(meter_rect, self.skin_manager.get_color('SURFACE_DARK'))
        
        # Draw RMS level
        rms_width = int(meter_rect.width() * self.channel.rms_level)
        rms_rect = QRect(
            meter_rect.left(),
            meter_rect.top(),
            rms_width,
            meter_rect.height()
        )
        painter.fillRect(rms_rect, self.skin_manager.get_color('ACCENT'))
        
        # Draw peak level
        peak_width = int(meter_rect.width() * self.channel.peak_level)
        peak_rect = QRect(
            meter_rect.left(),
            meter_rect.top(),
            peak_width,
            2
        )
        painter.fillRect(peak_rect, self.skin_manager.get_color('TEXT'))
        
        # Draw pan control
        pan_rect = self.pan_control.geometry()
        
        # Draw pan background
        painter.fillRect(pan_rect, self.skin_manager.get_color('SURFACE_DARK'))
        
        # Draw pan position
        pan_position = (self.channel.pan + 1.0) / 2.0
        pan_width = int(pan_rect.width() * pan_position)
        pan_position_rect = QRect(
            pan_rect.left(),
            pan_rect.top(),
            pan_width,
            pan_rect.height()
        )
        painter.fillRect(pan_position_rect, self.skin_manager.get_color('ACCENT'))

class MasterStripWidget(QWidget):
    """Widget for the master strip."""
    
    def __init__(self, mixer: Mixer, skin_manager: SkinManager, parent=None):
        """Initialize the master strip widget.
        
        Args:
            mixer: Mixer
            skin_manager: Skin manager
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.mixer = mixer
        self.skin_manager = skin_manager
        
        # Set up widget
        self.setMinimumWidth(100)
        self.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Expanding)
        
        # Create layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)
        
        # Master label
        self.master_label = QLabel("MASTER")
        self.master_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.master_label)
        
        # Mute button
        self.mute_button = QPushButton("MUTE")
        self.mute_button.setCheckable(True)
        self.mute_button.setChecked(mixer.master_mute)
        self.mute_button.clicked.connect(self._on_mute_clicked)
        layout.addWidget(self.mute_button)
        
        # Fader
        self.fader = QFrame()
        self.fader.setFrameShape(QFrame.StyledPanel)
        self.fader.setMinimumHeight(200)
        self.fader.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Expanding)
        layout.addWidget(self.fader)
        
        # Level meter
        self.meter = QFrame()
        self.meter.setFrameShape(QFrame.StyledPanel)
        self.meter.setMinimumHeight(20)
        self.meter.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        layout.addWidget(self.meter)
        
        # Apply skin
        self._apply_skin()
    
    def update_levels(self, peak: float, rms: float):
        """Update the level meter.
        
        Args:
            peak: Peak level (0.0 to 1.0)
            rms: RMS level (0.0 to 1.0)
        """
        self.mixer.update_master_levels(peak, rms)
        self.meter.update()
    
    def _on_mute_clicked(self, checked: bool):
        """Handle mute button click.
        
        Args:
            checked: Button checked state
        """
        self.mixer.set_master_mute(checked)
        self._apply_skin()
    
    def _apply_skin(self):
        """Apply the current skin to the widget."""
        # Set widget style
        self.setStyleSheet(f"""
            QWidget {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QLabel {{
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
                font-weight: bold;
            }}
            QPushButton {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background: {self.skin_manager.get_color('ACCENT')};
            }}
            QPushButton:checked {{
                background: {self.skin_manager.get_color('ACCENT')};
            }}
            QFrame {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
            }}
        """)
    
    def paintEvent(self, event):
        """Handle paint event.
        
        Args:
            event: Paint event
        """
        super().paintEvent(event)
        
        # Draw fader
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get fader rect
        fader_rect = self.fader.geometry()
        
        # Draw fader background
        painter.fillRect(fader_rect, self.skin_manager.get_color('SURFACE_DARK'))
        
        # Draw fader position
        position = self.mixer.master_volume
        position_height = int(fader_rect.height() * position)
        position_rect = QRect(
            fader_rect.left(),
            fader_rect.bottom() - position_height,
            fader_rect.width(),
            position_height
        )
        painter.fillRect(position_rect, self.skin_manager.get_color('ACCENT'))
        
        # Draw meter
        meter_rect = self.meter.geometry()
        
        # Draw meter background
        painter.fillRect(meter_rect, self.skin_manager.get_color('SURFACE_DARK'))
        
        # Draw RMS level
        rms_width = int(meter_rect.width() * self.mixer.master_rms)
        rms_rect = QRect(
            meter_rect.left(),
            meter_rect.top(),
            rms_width,
            meter_rect.height()
        )
        painter.fillRect(rms_rect, self.skin_manager.get_color('ACCENT'))
        
        # Draw peak level
        peak_width = int(meter_rect.width() * self.mixer.master_peak)
        peak_rect = QRect(
            meter_rect.left(),
            meter_rect.top(),
            peak_width,
            2
        )
        painter.fillRect(peak_rect, self.skin_manager.get_color('TEXT'))

class MixerComponent(QWidget):
    """Component for displaying the mixer."""
    
    def __init__(self, mixer: Mixer, skin_manager: SkinManager, parent=None):
        """Initialize the mixer component.
        
        Args:
            mixer: Mixer
            skin_manager: Skin manager
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.mixer = mixer
        self.skin_manager = skin_manager
        
        # Set up widget
        self.setMinimumHeight(300)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        # Create layout
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Create scroll area for channels
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.scroll_area.setFrameShape(QFrame.NoFrame)
        layout.addWidget(self.scroll_area)
        
        # Create widget for channels
        self.channels_widget = QWidget()
        self.channels_layout = QHBoxLayout(self.channels_widget)
        self.channels_layout.setContentsMargins(0, 0, 0, 0)
        self.channels_layout.setSpacing(0)
        self.scroll_area.setWidget(self.channels_widget)
        
        # Create master strip
        self.master_strip = MasterStripWidget(mixer, skin_manager)
        layout.addWidget(self.master_strip)
        
        # Connect signals
        self.mixer.channel_added.connect(self._on_channel_added)
        self.mixer.channel_removed.connect(self._on_channel_removed)
        self.mixer.channel_updated.connect(self._on_channel_updated)
        self.mixer.master_updated.connect(self._on_master_updated)
        self.mixer.levels_updated.connect(self._on_levels_updated)
        
        # Apply skin
        self._apply_skin()
    
    def _on_channel_added(self, name: str):
        """Handle channel added signal.
        
        Args:
            name: Channel name
        """
        # Create channel strip
        channel = self.mixer.get_channel(name)
        strip = ChannelStripWidget(channel, self.skin_manager)
        self.channels_layout.addWidget(strip)
    
    def _on_channel_removed(self, name: str):
        """Handle channel removed signal.
        
        Args:
            name: Channel name
        """
        # Find and remove channel strip
        for i in range(self.channels_layout.count()):
            item = self.channels_layout.itemAt(i)
            if item.widget() and item.widget().channel.name == name:
                item.widget().deleteLater()
                self.channels_layout.removeItem(item)
                break
    
    def _on_channel_updated(self, name: str):
        """Handle channel updated signal.
        
        Args:
            name: Channel name
        """
        # Find and update channel strip
        for i in range(self.channels_layout.count()):
            item = self.channels_layout.itemAt(i)
            if item.widget() and item.widget().channel.name == name:
                item.widget().update()
                break
    
    def _on_master_updated(self):
        """Handle master updated signal."""
        self.master_strip.update()
    
    def _on_levels_updated(self):
        """Handle levels updated signal."""
        # Update all channel strips
        for i in range(self.channels_layout.count()):
            item = self.channels_layout.itemAt(i)
            if item.widget():
                item.widget().update()
        
        # Update master strip
        self.master_strip.update()
    
    def _apply_skin(self):
        """Apply the current skin to the component."""
        # Set component style
        self.setStyleSheet(f"""
            QWidget {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QScrollArea {{
                background: {self.skin_manager.get_color('SURFACE')};
                border: none;
            }}
        """) 