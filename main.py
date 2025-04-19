import sys
import logging
from PySide6.QtWidgets import QApplication

from .rytm_gui import AnalogRytmGUI
from .style import apply_style

# Configure logging
logging.basicConfig(
    filename="error.log",
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def main():
    """Entry point for the ARythm-EMU application."""
    app = QApplication(sys.argv)
    
    # Apply the modern UI style
    theme = apply_style(app)
    
    try:
        # Create and show main window using the new GUI
        window = AnalogRytmGUI()
        window.show()
        
        # Enter the application main loop
        sys.exit(app.exec())
    except Exception as e:
        logging.error("An error occurred", exc_info=True)

if __name__ == "__main__":
    main()