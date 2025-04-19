#!/usr/bin/env python3
"""
RythmoTron - Main Entry Point

This is the main entry point for the RythmoTron application.
It initializes and runs the application.
"""

# Set DISPLAY environment variable before importing any GUI libraries
import os
os.environ['DISPLAY'] = ':0.0'

import sys
import platform
import logging
from PySide6.QtWidgets import QApplication, QMessageBox
from PySide6.QtCore import Qt

from .ui.rytm_gui import RythmGUI
from .style import apply_style
from .utils.logging_setup import configure_logging
from .utils.config import get_config

def check_display_server():
    """Check if a display server is available and log details."""
    display_var = os.environ.get('DISPLAY')
    logging.info(f"Display server: DISPLAY={display_var}")
    
    if not display_var:
        logging.warning("No display server detected (DISPLAY environment variable not set)")
        return False
    
    # Log platform information
    logging.info(f"Platform: {platform.system()} {platform.release()}")
    logging.info(f"Session type: {os.environ.get('XDG_SESSION_TYPE', 'unknown')}")
    
    return True

def main():
    """Initialize and run the application."""
    # Configure logging first
    configure_logging()
    
    # Log system information
    logging.info(f"Starting RythmoTron on {platform.system()} {platform.release()}")
    
    # Check display server
    has_display = check_display_server()
    if not has_display:
        logging.warning("No display server detected. GUI might not be visible.")
    
    # Get application configuration
    config = get_config()
    ui_config = config.get('ui', {})
    
    try:
        # Create and configure Qt application
        app = QApplication.instance() or QApplication(sys.argv)
        app.setApplicationName("RythmoTron")
        
        # Make sure Qt knows we want to use xcb platform
        os.environ['QT_QPA_PLATFORM'] = 'xcb'
        
        # Apply the modern UI style
        theme = apply_style(app)
        
        try:
            # Create and show main window using the new GUI
            logging.info("Creating main window...")
            window = RythmGUI()
            
            # Apply window dimensions from config
            window.resize(
                ui_config.get('window_width', 1200),
                ui_config.get('window_height', 800)
            )
            
            # Ensure the window is active and visible
            window.setWindowFlag(Qt.WindowStaysOnTopHint, True)
            window.show()
            window.raise_()
            window.activateWindow()
            
            # If we got this far, remove the stay-on-top flag
            window.setWindowFlag(Qt.WindowStaysOnTopHint, False)
            window.show()
            
            logging.info("Main window shown successfully")
            
            # Enter the application main loop
            logging.info("Entering Qt event loop")
            exit_code = app.exec()
            
            # Save window dimensions to config before exiting
            from .utils.config import set_config_value
            set_config_value('ui.window_width', window.width())
            set_config_value('ui.window_height', window.height())
            
            logging.info(f"Application exited with code: {exit_code}")
            sys.exit(exit_code)
        except Exception as e:
            logging.error(f"Error creating or showing window: {e}", exc_info=True)
            
            # Try to show an error dialog
            try:
                msg = QMessageBox()
                msg.setIcon(QMessageBox.Critical)
                msg.setText("Error starting RythmoTron")
                msg.setInformativeText(f"Error: {str(e)}")
                msg.setWindowTitle("RythmoTron Error")
                msg.setDetailedText(f"Error details: {str(e)}\n\nDisplay: {os.environ.get('DISPLAY')}")
                msg.exec()
            except:
                pass
                
            sys.exit(1)
    except Exception as e:
        logging.error("An error occurred initializing application", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()