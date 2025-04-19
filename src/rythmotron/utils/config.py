"""
Configuration Module for RythmoTron

This module manages application configuration settings.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Default config directory and file
DEFAULT_CONFIG_DIR = Path.home() / ".rythmotron"
DEFAULT_CONFIG_FILE = DEFAULT_CONFIG_DIR / "config.json"

# Default configuration values
DEFAULT_CONFIG = {
    "audio": {
        "sample_rate": 44100,
        "buffer_size": 512,
        "device": None,  # Use default device
        "channels": 2,
    },
    "midi": {
        "input_device": None,  # Use first available
        "output_device": None,  # Use first available
        "channel": 1,
    },
    "ui": {
        "theme": "dark",
        "font_size": 10,
        "show_tooltips": True,
        "window_width": 1200,
        "window_height": 800,
    },
    "paths": {
        "samples_dir": str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "samples"),
        "presets_dir": str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "presets"),
        "projects_dir": str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "projects"),
        "logs_dir": str(Path(__file__).resolve().parent.parent.parent.parent / "logs"),
    },
    "performance": {
        "autosave_interval": 300,  # seconds
        "undo_levels": 20,
        "use_hardware_acceleration": True,
    }
}

# Current configuration (loaded from file or defaults)
_config: Dict[str, Any] = {}


def ensure_config_dir() -> None:
    """Ensure the configuration directory exists."""
    DEFAULT_CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict[str, Any]:
    """
    Load configuration from the config file.
    
    Returns:
        The loaded configuration, or the default if not found.
    """
    global _config
    
    ensure_config_dir()
    
    if DEFAULT_CONFIG_FILE.exists():
        try:
            with open(DEFAULT_CONFIG_FILE, 'r') as f:
                user_config = json.load(f)
                
            # Deep merge with defaults
            _config = deep_merge(DEFAULT_CONFIG, user_config)
            logging.info(f"Configuration loaded from {DEFAULT_CONFIG_FILE}")
        except Exception as e:
            logging.error(f"Error loading configuration: {e}")
            _config = DEFAULT_CONFIG.copy()
    else:
        _config = DEFAULT_CONFIG.copy()
        save_config()  # Save default config
        
    return _config


def save_config() -> None:
    """Save the current configuration to the config file."""
    ensure_config_dir()
    
    try:
        with open(DEFAULT_CONFIG_FILE, 'w') as f:
            json.dump(_config, f, indent=2)
        logging.info(f"Configuration saved to {DEFAULT_CONFIG_FILE}")
    except Exception as e:
        logging.error(f"Error saving configuration: {e}")


def get_config() -> Dict[str, Any]:
    """
    Get the current configuration.
    
    Returns:
        The current configuration.
    """
    global _config
    if not _config:
        load_config()
    return _config


def set_config_value(key_path: str, value: Any) -> None:
    """
    Set a configuration value using a dot-notation path.
    
    Args:
        key_path: The path to the config value (e.g., "audio.sample_rate")
        value: The new value
    """
    global _config
    if not _config:
        load_config()
        
    parts = key_path.split('.')
    config = _config
    
    # Navigate to the right level
    for part in parts[:-1]:
        if part not in config:
            config[part] = {}
        config = config[part]
        
    # Set the value
    config[parts[-1]] = value
    
    # Save the updated config
    save_config()


def get_config_value(key_path: str, default: Any = None) -> Any:
    """
    Get a configuration value using a dot-notation path.
    
    Args:
        key_path: The path to the config value (e.g., "audio.sample_rate")
        default: Default value if the key doesn't exist
        
    Returns:
        The configuration value, or default if not found.
    """
    global _config
    if not _config:
        load_config()
        
    parts = key_path.split('.')
    config = _config
    
    # Navigate to the right level
    try:
        for part in parts:
            config = config[part]
        return config
    except (KeyError, TypeError):
        return default


def deep_merge(default: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively merge two dictionaries, with override values taking precedence.
    
    Args:
        default: The base dictionary
        override: The dictionary with values to override
        
    Returns:
        The merged dictionary
    """
    result = default.copy()
    
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
            
    return result


# Initialize configuration
load_config()