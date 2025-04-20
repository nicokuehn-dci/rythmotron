"""
Audio mixer and master section for RythmoTron.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
from PySide6.QtCore import QObject, Signal, Slot, Property, QTimer

@dataclass
class ChannelStrip:
    """Represents a mixer channel strip."""
    name: str
    volume: float = 1.0  # 0.0 to 1.0
    pan: float = 0.0    # -1.0 (left) to 1.0 (right)
    mute: bool = False
    solo: bool = False
    fader_position: float = 0.0  # 0.0 to 1.0 for UI
    peak_level: float = 0.0      # 0.0 to 1.0
    rms_level: float = 0.0       # 0.0 to 1.0

class Mixer(QObject):
    """Audio mixer with master section."""
    
    # Signals
    channel_added = Signal(str)  # Emitted when a channel is added
    channel_removed = Signal(str)  # Emitted when a channel is removed
    channel_updated = Signal(str)  # Emitted when a channel is updated
    master_updated = Signal()  # Emitted when master settings change
    levels_updated = Signal()  # Emitted when levels are updated
    
    def __init__(self, parent=None):
        """Initialize the mixer.
        
        Args:
            parent: Parent object
        """
        super().__init__(parent)
        
        # Channel strips
        self.channels: Dict[str, ChannelStrip] = {}
        
        # Master section
        self._master_volume = 1.0
        self._master_mute = False
        self._master_peak = 0.0
        self._master_rms = 0.0
        
        # Solo state
        self._solo_active = False
        self._soloed_channels = set()
        
        # Set up update timer
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self._update_levels)
        self.update_timer.start(50)  # 20 Hz update rate
    
    def add_channel(self, name: str) -> bool:
        """Add a new channel strip.
        
        Args:
            name: Channel name
            
        Returns:
            True if channel was added successfully
        """
        if name in self.channels:
            return False
            
        self.channels[name] = ChannelStrip(name=name)
        self.channel_added.emit(name)
        return True
    
    def remove_channel(self, name: str) -> bool:
        """Remove a channel strip.
        
        Args:
            name: Channel name
            
        Returns:
            True if channel was removed successfully
        """
        if name not in self.channels:
            return False
            
        del self.channels[name]
        self.channel_removed.emit(name)
        return True
    
    def set_channel_volume(self, name: str, volume: float) -> bool:
        """Set channel volume.
        
        Args:
            name: Channel name
            volume: Volume level (0.0 to 1.0)
            
        Returns:
            True if volume was set successfully
        """
        if name not in self.channels:
            return False
            
        channel = self.channels[name]
        channel.volume = max(0.0, min(1.0, volume))
        self.channel_updated.emit(name)
        return True
    
    def set_channel_pan(self, name: str, pan: float) -> bool:
        """Set channel pan.
        
        Args:
            name: Channel name
            pan: Pan position (-1.0 to 1.0)
            
        Returns:
            True if pan was set successfully
        """
        if name not in self.channels:
            return False
            
        channel = self.channels[name]
        channel.pan = max(-1.0, min(1.0, pan))
        self.channel_updated.emit(name)
        return True
    
    def set_channel_mute(self, name: str, mute: bool) -> bool:
        """Set channel mute state.
        
        Args:
            name: Channel name
            mute: Mute state
            
        Returns:
            True if mute state was set successfully
        """
        if name not in self.channels:
            return False
            
        channel = self.channels[name]
        channel.mute = mute
        self.channel_updated.emit(name)
        return True
    
    def set_channel_solo(self, name: str, solo: bool) -> bool:
        """Set channel solo state.
        
        Args:
            name: Channel name
            solo: Solo state
            
        Returns:
            True if solo state was set successfully
        """
        if name not in self.channels:
            return False
            
        channel = self.channels[name]
        channel.solo = solo
        
        # Update solo state
        if solo:
            self._soloed_channels.add(name)
        else:
            self._soloed_channels.discard(name)
            
        self._solo_active = bool(self._soloed_channels)
        self.channel_updated.emit(name)
        return True
    
    def set_channel_fader(self, name: str, position: float) -> bool:
        """Set channel fader position.
        
        Args:
            name: Channel name
            position: Fader position (0.0 to 1.0)
            
        Returns:
            True if fader position was set successfully
        """
        if name not in self.channels:
            return False
            
        channel = self.channels[name]
        channel.fader_position = max(0.0, min(1.0, position))
        
        # Convert fader position to volume (logarithmic)
        channel.volume = self._fader_to_volume(channel.fader_position)
        self.channel_updated.emit(name)
        return True
    
    def set_master_volume(self, volume: float):
        """Set master volume.
        
        Args:
            volume: Volume level (0.0 to 1.0)
        """
        self._master_volume = max(0.0, min(1.0, volume))
        self.master_updated.emit()
    
    def set_master_mute(self, mute: bool):
        """Set master mute state.
        
        Args:
            mute: Mute state
        """
        self._master_mute = mute
        self.master_updated.emit()
    
    def update_levels(self, channel_levels: Dict[str, tuple]):
        """Update channel and master levels.
        
        Args:
            channel_levels: Dictionary of channel levels (peak, rms)
        """
        # Update channel levels
        for name, (peak, rms) in channel_levels.items():
            if name in self.channels:
                channel = self.channels[name]
                channel.peak_level = peak
                channel.rms_level = rms
        
        # Calculate master levels
        if channel_levels:
            self._master_peak = max(peak for peak, _ in channel_levels.values())
            self._master_rms = max(rms for _, rms in channel_levels.values())
        else:
            self._master_peak = 0.0
            self._master_rms = 0.0
        
        self.levels_updated.emit()
    
    def get_channel(self, name: str) -> Optional[ChannelStrip]:
        """Get a channel strip.
        
        Args:
            name: Channel name
            
        Returns:
            Channel strip or None if not found
        """
        return self.channels.get(name)
    
    def get_active_channels(self) -> List[str]:
        """Get list of active channel names.
        
        Returns:
            List of active channel names
        """
        if self._solo_active:
            return list(self._soloed_channels)
        return [
            name for name, channel in self.channels.items()
            if not channel.mute
        ]
    
    def _fader_to_volume(self, position: float) -> float:
        """Convert fader position to volume level.
        
        Args:
            position: Fader position (0.0 to 1.0)
            
        Returns:
            Volume level (0.0 to 1.0)
        """
        # Logarithmic scaling for more natural volume control
        if position <= 0.0:
            return 0.0
        return pow(position, 2.0)  # Square for logarithmic response
    
    def _update_levels(self):
        """Update level meters."""
        self.levels_updated.emit()
    
    # Properties
    @Property(float)
    def master_volume(self) -> float:
        """Get master volume."""
        return self._master_volume
    
    @Property(bool)
    def master_mute(self) -> bool:
        """Get master mute state."""
        return self._master_mute
    
    @Property(float)
    def master_peak(self) -> float:
        """Get master peak level."""
        return self._master_peak
    
    @Property(float)
    def master_rms(self) -> float:
        """Get master RMS level."""
        return self._master_rms
    
    @Property(bool)
    def solo_active(self) -> bool:
        """Get solo active state."""
        return self._solo_active 