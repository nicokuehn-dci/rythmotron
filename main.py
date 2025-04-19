#!/usr/bin/env python3
"""
RythmoTron - Main Entry Point

This is the main entry point for the RythmoTron application.
It initializes and runs the application.
"""

import sys
import logging
from PySide6.QtWidgets import QApplication

from .rytm_gui import RythmGUI
from .style import apply_style

# Configure logging
logging.basicConfig(
    filename="error.log",
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def main():
    """Initialize and run the application."""
    app = QApplication(sys.argv)
    app.setApplicationName("RythmoTron")
    
    # Apply the modern UI style
    theme = apply_style(app)
    
    try:
        # Create and show main window using the new GUI
        window = RythmGUI()
        window.show()
        
        # Enter the application main loop
        sys.exit(app.exec())
    except Exception as e:
        logging.error("An error occurred", exc_info=True)

if __name__ == "__main__":
    main()