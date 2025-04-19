"""
Logging Setup for RythmoTron

This module configures logging for the RythmoTron application.
"""

import os
import logging
import logging.handlers
from pathlib import Path
from typing import Optional

# Default log directory is in the project root
DEFAULT_LOG_DIR = Path(__file__).resolve().parent.parent.parent.parent / "logs"
DEFAULT_LOG_FILE = DEFAULT_LOG_DIR / "rythmotron.log"

# Ensure log directory exists
DEFAULT_LOG_DIR.mkdir(parents=True, exist_ok=True)


def configure_logging(
    log_file: Optional[str] = None,
    console_level: int = logging.INFO,
    file_level: int = logging.DEBUG
) -> None:
    """
    Configure logging for the RythmoTron application.

    Args:
        log_file: Path to the log file. If None, uses default.
        console_level: Logging level for console output.
        file_level: Logging level for file output.
    """
    log_path = log_file if log_file else DEFAULT_LOG_FILE

    # Create a formatter with timestamps
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Configure the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)  # Capture all logs, handlers filter levels

    # Clear any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add a console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(console_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Add a file handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        log_path,
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(file_level)
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Log the start of the application
    logging.info(f"RythmoTron logging configured. Log file: {log_path}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name.

    Args:
        name: The name of the logger.

    Returns:
        A logger instance.
    """
    return logging.getLogger(name)