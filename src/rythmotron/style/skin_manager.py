"""
Skin Manager for RythmoTron.
Handles skin switching and color access.
"""

from PySide6.QtCore import QObject, Signal
from PySide6.QtGui import QColor
from typing import Dict, Optional
from .colors import Colors
from .skins import SkinType, Skin

class SkinManager(QObject):
    """Class for managing application skins and colors."""
    
    # Signals
    skin_changed = Signal(str)  # Emitted when skin changes
    
    def __init__(self, parent: Optional[QObject] = None):
        """Initialize the skin manager."""
        super().__init__(parent)
        
        # Initialize state
        self.current_skin = "default"
        self.colors = {
            "background": Colors.BACKGROUND,
            "background_dark": Colors.BACKGROUND_DARK,
            "background_light": Colors.BACKGROUND_LIGHT,
            "text": Colors.TEXT,
            "text_primary": Colors.TEXT_PRIMARY,
            "text_secondary": Colors.TEXT_SECONDARY,
            "text_disabled": Colors.TEXT_DISABLED,
            "accent": Colors.ACCENT,
            "accent_dark": Colors.ACCENT_DARK,
            "accent_darker": Colors.ACCENT_DARKER,
            "accent_hover": Colors.ACCENT_HOVER,
            "accent_lighter": Colors.ACCENT_LIGHTER,
            "surface": Colors.SURFACE,
            "surface_dark": Colors.SURFACE_DARK,
            "surface_hover": Colors.SURFACE_HOVER,
            "surface_darker": Colors.SURFACE_DARKER,
            "grid": Colors.GRID,
            "grid_lines": Colors.GRID_LINES,
            "grid_highlight": Colors.GRID_HIGHLIGHT,
            "kick": Colors.KICK,
            "snare": Colors.SNARE,
            "hihat": Colors.HIHAT,
            "clap": Colors.CLAP,
            "crash": Colors.CRASH,
            "ride": Colors.RIDE,
            "tom1": Colors.TOM1,
            "tom2": Colors.TOM2,
            "perc1": Colors.PERC1,
            "perc2": Colors.PERC2,
            "perc3": Colors.PERC3,
            "perc4": Colors.PERC4,
            "success": Colors.SUCCESS,
            "warning": Colors.WARNING,
            "error": Colors.ERROR,
            "info": Colors.INFO,
            "button": Colors.BUTTON,
            "button_hover": Colors.BUTTON_HOVER,
            "button_pressed": Colors.BUTTON_PRESSED,
            "button_disabled": Colors.BUTTON_DISABLED,
            "slider_handle": Colors.SLIDER_HANDLE,
            "slider_groove": Colors.SLIDER_GROOVE,
            "slider_groove_active": Colors.SLIDER_GROOVE_ACTIVE,
            "checkbox": Colors.CHECKBOX,
            "checkbox_hover": Colors.CHECKBOX_HOVER,
            "checkbox_checked": Colors.CHECKBOX_CHECKED,
            "radio": Colors.RADIO,
            "radio_hover": Colors.RADIO_HOVER,
            "radio_checked": Colors.RADIO_CHECKED,
            "combobox": Colors.COMBOBOX,
            "combobox_hover": Colors.COMBOBOX_HOVER,
            "combobox_pressed": Colors.COMBOBOX_PRESSED,
            "spinbox": Colors.SPINBOX,
            "spinbox_hover": Colors.SPINBOX_HOVER,
            "spinbox_pressed": Colors.SPINBOX_PRESSED,
            "progressbar": Colors.PROGRESSBAR,
            "progressbar_chunk": Colors.PROGRESSBAR_CHUNK,
            "scrollbar": Colors.SCROLLBAR,
            "scrollbar_hover": Colors.SCROLLBAR_HOVER,
            "scrollbar_pressed": Colors.SCROLLBAR_PRESSED,
            "menu": Colors.MENU,
            "menu_item_hover": Colors.MENU_ITEM_HOVER,
            "menu_item_pressed": Colors.MENU_ITEM_PRESSED,
            "menu_separator": Colors.MENU_SEPARATOR,
            "toolbar": Colors.TOOLBAR,
            "toolbar_handle": Colors.TOOLBAR_HANDLE,
            "toolbar_separator": Colors.TOOLBAR_SEPARATOR,
            "statusbar": Colors.STATUSBAR,
            "dock": Colors.DOCK,
            "dock_title": Colors.DOCK_TITLE,
            "dock_title_active": Colors.DOCK_TITLE_ACTIVE
        }
        
        # Font settings
        self.font_family = "Roboto"
        self.font_sizes = {
            "title": 24,
            "header": 18,
            "value": 14,
            "text": 12
        }
        
    def get_color(self, name: str) -> str:
        """Get a color by name."""
        return self.colors.get(name.lower(), Colors.TEXT)
    
    def get_font_family(self) -> str:
        """Get the current font family."""
        return self.font_family
    
    def get_font_size(self, name: str) -> int:
        """Get a font size by name."""
        return self.font_sizes.get(name.lower(), 12)
    
    def set_skin(self, skin_name: str) -> bool:
        """Set the current skin.
        
        Args:
            skin_name: The name of the skin to set
            
        Returns:
            bool: True if the skin was changed successfully
        """
        if skin_name != self.current_skin:
            self.current_skin = skin_name
            self.skin_changed.emit(self.current_skin)
            return True
        return False
    
    def get_current_skin(self) -> str:
        """Get the name of the current skin."""
        return self.current_skin
    
    def get_color(self, color_name: str) -> str:
        """Get a color from the current skin."""
        return self.colors.get(color_name, "#000000")
    
    def get_font_size(self, size_name: str) -> int:
        """Get a font size from the current skin."""
        return self.font_sizes.get(size_name, 12)
    
    def get_font_family(self) -> str:
        """Get the font family from the current skin."""
        return self.font_family
    
    def add_skin(self, skin_type: SkinType, skin: Skin) -> bool:
        """Add a new skin.
        
        Args:
            skin_type: The type of skin to add
            skin: The skin to add
            
        Returns:
            bool: True if the skin was added successfully
        """
        if skin_type not in self.available_skins:
            SKINS[skin_type] = skin
            return True
        return False
    
    def remove_skin(self, skin_type: SkinType) -> bool:
        """Remove a skin.
        
        Args:
            skin_type: The type of skin to remove
            
        Returns:
            bool: True if the skin was removed successfully
        """
        if skin_type in self.available_skins and skin_type != SkinType.DEFAULT:
            del SKINS[skin_type]
            if self.current_skin == skin_type.value:
                self.set_skin(SkinType.DEFAULT)
            return True
        return False 