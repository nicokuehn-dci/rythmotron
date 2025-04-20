"""
RythmoTron - Theme Management

This module provides functions for applying themes and styles to the application.
"""

from PySide6.QtGui import QPalette, QColor
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication

from .colors import Colors
from .stylesheets import StyleSheets

def apply_style(app):
    """Apply the global application style."""
    # Create and set the application palette
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(Colors.BACKGROUND))
    palette.setColor(QPalette.WindowText, QColor(Colors.TEXT_PRIMARY))
    palette.setColor(QPalette.Base, QColor(Colors.SURFACE))
    palette.setColor(QPalette.AlternateBase, QColor(Colors.SURFACE_DARKER))
    palette.setColor(QPalette.ToolTipBase, QColor(Colors.BACKGROUND_DARK))
    palette.setColor(QPalette.ToolTipText, QColor(Colors.TEXT_PRIMARY))
    palette.setColor(QPalette.Text, QColor(Colors.TEXT_PRIMARY))
    palette.setColor(QPalette.Button, QColor(Colors.SURFACE))
    palette.setColor(QPalette.ButtonText, QColor(Colors.TEXT_PRIMARY))
    palette.setColor(QPalette.BrightText, QColor(Colors.ACCENT))
    palette.setColor(QPalette.Link, QColor(Colors.ACCENT))
    palette.setColor(QPalette.Highlight, QColor(Colors.ACCENT))
    palette.setColor(QPalette.HighlightedText, QColor(Colors.TEXT_PRIMARY))
    
    app.setPalette(palette)
    
    # Apply base style sheet
    app.setStyleSheet(StyleSheets.BASE)
    
    return palette 