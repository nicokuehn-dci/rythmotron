"""
RythmoTron - Style Definitions

This module provides style definitions and theme management for the RythmoTron GUI.
It defines colors, dimensions, and styling functions for a consistent look.
"""

from PySide6.QtGui import QPalette, QColor
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication

"""
ARythm-EMU UI Styling Module
Contains theme definitions and styles for a modern, dark UI with orange accents.
"""

# Theme Color Definitions
class Colors:
    # Base Colors
    BACKGROUND_DARK = "#1A1A1A"       # Nearly black background
    BACKGROUND = "#212121"            # Dark charcoal background
    BACKGROUND_LIGHT = "#2A2A2A"      # Slightly lighter panels
    SURFACE = "#303030"               # Control surfaces
    SURFACE_DARKER = "#252525"        # Slightly darker surface color for contrast
    
    # Accent Colors
    ACCENT = "#FF5722"                # Hot orange primary accent
    ACCENT_DARKER = "#E64A19"         # Darker version for hover/pressed
    ACCENT_LIGHTER = "#FF7043"        # Lighter version for highlights
    
    # Text Colors
    TEXT_PRIMARY = "#FFFFFF"          # White text
    TEXT_SECONDARY = "#B0B0B0"        # Light gray for secondary text
    TEXT_DISABLED = "#757575"         # Medium gray for disabled text
    
    # Functional Colors
    SUCCESS = "#4CAF50"               # Green for success states
    WARNING = "#FFC107"               # Yellow/amber for warnings
    ERROR = "#F44336"                 # Red for error states
    
    # Sequencer Grid Colors
    GRID_LINES = "#3A3A3A"            # Grid lines
    INACTIVE_STEP = "#383838"         # Inactive step
    ACTIVE_STEP = "#FF5722"           # Active step highlight


# Style Sheets for Different UI Elements
class StyleSheets:
    # Base Application Style
    BASE = f"""
        QWidget {{
            background-color: {Colors.BACKGROUND};
            color: {Colors.TEXT_PRIMARY};
            font-family: "Segoe UI", "Roboto", sans-serif;
            font-size: 10pt;
        }}
        
        QMainWindow {{
            background-color: {Colors.BACKGROUND_DARK};
        }}
        
        QLabel {{
            color: {Colors.TEXT_PRIMARY};
        }}
    """

    # Button Styles
    BUTTON = f"""
        QPushButton {{
            background-color: {Colors.SURFACE};
            color: {Colors.TEXT_PRIMARY};
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            min-height: 20px;
            text-align: center;
        }}
        
        QPushButton:hover {{
            background-color: {Colors.BACKGROUND_LIGHT};
        }}
        
        QPushButton:pressed {{
            background-color: {Colors.ACCENT_DARKER};
        }}
        
        QPushButton:focus {{
            border: 1px solid {Colors.ACCENT};
        }}
        
        QPushButton:disabled {{
            background-color: {Colors.BACKGROUND};
            color: {Colors.TEXT_DISABLED};
        }}
    """
    
    ACCENT_BUTTON = f"""
        QPushButton {{
            background-color: {Colors.ACCENT};
            color: {Colors.TEXT_PRIMARY};
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            min-height: 20px;
            font-weight: bold;
        }}
        
        QPushButton:hover {{
            background-color: {Colors.ACCENT_LIGHTER};
        }}
        
        QPushButton:pressed {{
            background-color: {Colors.ACCENT_DARKER};
        }}
        
        QPushButton:disabled {{
            background-color: {Colors.BACKGROUND_LIGHT};
            color: {Colors.TEXT_DISABLED};
        }}
    """
    
    TRANSPORT_BUTTON = f"""
        QPushButton {{
            background-color: {Colors.SURFACE};
            color: {Colors.TEXT_PRIMARY};
            border: none;
            border-radius: 20px;  /* More rounded for play/stop buttons */
            padding: 10px;
            min-height: 40px;
            min-width: 40px;
        }}
        
        QPushButton:hover {{
            background-color: {Colors.BACKGROUND_LIGHT};
        }}
        
        QPushButton:pressed {{
            background-color: {Colors.ACCENT_DARKER};
        }}
        
        #play_button {{
            background-color: {Colors.ACCENT};
        }}
        
        #play_button:hover {{
            background-color: {Colors.ACCENT_LIGHTER};
        }}
        
        #play_button:pressed {{
            background-color: {Colors.ACCENT_DARKER};
        }}
    """
    
    # Slider Style
    SLIDER = f"""
        QSlider::groove:horizontal {{
            border: none;
            height: 6px;
            background-color: {Colors.BACKGROUND_LIGHT};
            border-radius: 3px;
        }}
        
        QSlider::handle:horizontal {{
            background-color: {Colors.ACCENT};
            border: none;
            width: 16px;
            margin-top: -5px;
            margin-bottom: -5px;
            border-radius: 8px;
        }}
        
        QSlider::handle:horizontal:hover {{
            background-color: {Colors.ACCENT_LIGHTER};
        }}
        
        QSlider::sub-page:horizontal {{
            background-color: {Colors.ACCENT};
            border-radius: 3px;
        }}
    """
    
    # Dial Style
    DIAL = f"""
        QDial {{
            background-color: {Colors.SURFACE};
        }}
    """
    
    # Group Box Style
    GROUP_BOX = f"""
        QGroupBox {{
            border: 1px solid {Colors.BACKGROUND_LIGHT};
            border-radius: 6px;
            margin-top: 12px;
            padding-top: 14px;
            font-weight: bold;
        }}
        
        QGroupBox::title {{
            subcontrol-origin: margin;
            subcontrol-position: top left;
            padding: 0 5px;
            left: 10px;
            color: {Colors.ACCENT};
        }}
    """
    
    # Tab Widget Style
    TAB_WIDGET = f"""
        QTabWidget::pane {{
            border: 1px solid {Colors.BACKGROUND_LIGHT};
            border-radius: 4px;
            background-color: {Colors.BACKGROUND};
        }}
        
        QTabBar::tab {{
            background-color: {Colors.BACKGROUND_DARK};
            color: {Colors.TEXT_SECONDARY};
            padding: 10px 16px;
            margin-right: 2px;
            margin-bottom: -1px;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }}
        
        QTabBar::tab:selected {{
            background-color: {Colors.BACKGROUND};
            color: {Colors.ACCENT};
            border-bottom: 2px solid {Colors.ACCENT};
        }}
        
        QTabBar::tab:hover:!selected {{
            background-color: {Colors.BACKGROUND_LIGHT};
        }}
    """
    
    # ComboBox Style
    COMBO_BOX = f"""
        QComboBox {{
            background-color: {Colors.SURFACE};
            color: {Colors.TEXT_PRIMARY};
            border: none;
            border-radius: 4px;
            padding: 5px;
            min-height: 24px;
        }}
        
        QComboBox::drop-down {{
            border: none;
            width: 20px;
        }}
        
        QComboBox QAbstractItemView {{
            background-color: {Colors.BACKGROUND_LIGHT};
            color: {Colors.TEXT_PRIMARY};
            border: 1px solid {Colors.BACKGROUND_DARK};
            selection-background-color: {Colors.ACCENT};
        }}
    """
    
    # SpinBox Style
    SPIN_BOX = f"""
        QSpinBox, QDoubleSpinBox {{
            background-color: {Colors.SURFACE};
            color: {Colors.TEXT_PRIMARY};
            border: none;
            border-radius: 4px;
            padding: 3px;
        }}
        
        QSpinBox::up-button, QDoubleSpinBox::up-button {{
            subcontrol-origin: border;
            subcontrol-position: top right;
            width: 16px;
            border-top-right-radius: 4px;
            background-color: {Colors.BACKGROUND_LIGHT};
        }}
        
        QSpinBox::down-button, QDoubleSpinBox::down-button {{
            subcontrol-origin: border;
            subcontrol-position: bottom right;
            width: 16px;
            border-bottom-right-radius: 4px;
            background-color: {Colors.BACKGROUND_LIGHT};
        }}
        
        QSpinBox::up-button:hover, QDoubleSpinBox::up-button:hover,
        QSpinBox::down-button:hover, QDoubleSpinBox::down-button:hover {{
            background-color: {Colors.ACCENT};
        }}
    """
    
    # The title/header in the sequencer area
    SEQUENCER_HEADER = f"""
        QLabel#sequencer_header {{
            font-size: 12pt;
            font-weight: bold;
            color: {Colors.ACCENT};
            padding: 5px;
        }}
    """
    
    # For pattern/track labels in sequencer
    TRACK_LABEL = f"""
        QLabel.track_label {{
            font-weight: bold;
            padding: 2px 5px;
            background-color: {Colors.BACKGROUND_DARK};
            border-radius: 3px;
        }}
    """


def apply_style(app):
    """Apply the application-wide style to the QApplication instance"""
    # Set base style for the application
    app.setStyleSheet(StyleSheets.BASE)
    
    return {
        "colors": Colors,
        "styles": StyleSheets
    }