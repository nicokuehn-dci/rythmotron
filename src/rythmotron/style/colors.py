"""
RythmoTron - Color Definitions

This module provides color definitions for the RythmoTron interface.
"""

class Colors:
    """Color constants for the application."""
    
    # Base colors
    BACKGROUND = "#121212"
    BACKGROUND_DARK = "#0A0A0A"
    BACKGROUND_LIGHT = "#1E1E1E"
    TEXT = "#FFFFFF"
    TEXT_PRIMARY = "#FFFFFF"
    TEXT_SECONDARY = "#B3B3B3"
    TEXT_DISABLED = "#707070"
    ACCENT = "#1DB954"
    ACCENT_DARK = "#168F40"
    ACCENT_DARKER = "#0D5C28"
    ACCENT_HOVER = "#23D467"
    ACCENT_LIGHTER = "#34E67A"
    SURFACE = "#282828"
    SURFACE_DARK = "#181818"
    SURFACE_HOVER = "#383838"
    SURFACE_DARKER = "#202020"
    INACTIVE = "#404040"  # Color for inactive elements
    
    # Grid colors
    GRID = "#404040"
    GRID_LINES = "#505050"
    GRID_HIGHLIGHT = "#606060"
    
    # Track colors
    KICK = "#FF5252"  # Red
    SNARE = "#FF9800"  # Orange
    HIHAT = "#FFEB3B"  # Yellow
    CLAP = "#34C759"  # Green
    TOM1 = "#8BC34A"  # Light green
    TOM2 = "#4CAF50"  # Green
    CRASH = "#009688"  # Teal
    RIDE = "#00BCD4"  # Cyan
    PERC1 = "#03A9F4"  # Light blue
    PERC2 = "#2196F3"  # Blue
    PERC3 = "#3F51B5"  # Indigo
    PERC4 = "#673AB7"  # Deep purple
    
    # State colors
    SUCCESS = "#4CAF50"  # Green
    WARNING = "#FFC107"  # Amber
    ERROR = "#F44336"  # Red
    INFO = "#2196F3"  # Blue
    TRIGGER = "#1DB954"  # Green for triggers
    
    # UI element colors
    BUTTON = "#404040"
    BUTTON_HOVER = "#505050"
    BUTTON_PRESSED = "#606060"
    BUTTON_DISABLED = "#303030"
    SLIDER_HANDLE = "#808080"
    SLIDER_GROOVE = "#404040"
    SLIDER_GROOVE_ACTIVE = "#505050"
    CHECKBOX = "#404040"
    CHECKBOX_HOVER = "#505050"
    CHECKBOX_CHECKED = "#1DB954"
    RADIO = "#404040"
    RADIO_HOVER = "#505050"
    RADIO_CHECKED = "#1DB954"
    COMBOBOX = "#404040"
    COMBOBOX_HOVER = "#505050"
    COMBOBOX_PRESSED = "#606060"
    SPINBOX = "#404040"
    SPINBOX_HOVER = "#505050"
    SPINBOX_PRESSED = "#606060"
    PROGRESSBAR = "#404040"
    PROGRESSBAR_CHUNK = "#1DB954"
    SCROLLBAR = "#404040"
    SCROLLBAR_HOVER = "#505050"
    SCROLLBAR_PRESSED = "#606060"
    MENU = "#282828"
    MENU_ITEM_HOVER = "#383838"
    MENU_ITEM_PRESSED = "#484848"
    MENU_SEPARATOR = "#404040"
    TOOLBAR = "#282828"
    TOOLBAR_HANDLE = "#404040"
    TOOLBAR_SEPARATOR = "#404040"
    STATUSBAR = "#282828"
    DOCK = "#282828"
    DOCK_TITLE = "#383838"
    DOCK_TITLE_ACTIVE = "#484848"
    
    @classmethod
    def get_track_color(cls, track_name: str) -> str:
        """Get the color for a track by name."""
        return getattr(cls, track_name.upper(), cls.TEXT_PRIMARY)
    
    @classmethod
    def get_state_color(cls, state: str) -> str:
        """Get the color for a state by name."""
        return getattr(cls, state.upper(), cls.TEXT_PRIMARY)
    
    @classmethod
    def get_effect_color(cls, effect_name: str) -> str:
        """Get the color for an effect by name."""
        return getattr(cls, effect_name.upper(), cls.TEXT_PRIMARY) 