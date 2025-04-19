#!/usr/bin/env python3
"""
RythmoTron - Main Entry Point

This is the main entry point for the RythmoTron application.
It initializes and runs the application.
"""

import sys
import logging
from PySide6.QtWidgets import QApplication

from .ui.rytm_gui import RythmGUI
from .style import apply_style
from .utils.logging_setup import configure_logging
from .utils.config import get_config

def main():
    """Initialize and run the application."""
    # Configure logging first
    configure_logging()
    
    # Get application configuration
    config = get_config()
    ui_config = config.get('ui', {})
    
    # Create and configure Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("RythmoTron")
    
    # Apply the modern UI style
    theme = apply_style(app)
    
    try:
        # Create and show main window using the new GUI
        window = RythmGUI()
        
        # Apply window dimensions from config
        window.resize(
            ui_config.get('window_width', 1200),
            ui_config.get('window_height', 800)
        )
        
        window.show()
        
        # Enter the application main loop
        exit_code = app.exec()
        
        # Save window dimensions to config before exiting
        from .utils.config import set_config_value
        set_config_value('ui.window_width', window.width())
        set_config_value('ui.window_height', window.height())
        
        sys.exit(exit_code)
    except Exception as e:
        logging.error("An error occurred", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()