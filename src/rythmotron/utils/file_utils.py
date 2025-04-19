"""
File Utilities for RythmoTron

This module provides utility functions for file operations,
such as loading/saving samples, presets, and projects.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

# Default paths
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
DEFAULT_SAMPLES_DIR = DEFAULT_DATA_DIR / "samples"
DEFAULT_PRESETS_DIR = DEFAULT_DATA_DIR / "presets"
DEFAULT_PROJECTS_DIR = DEFAULT_DATA_DIR / "projects"

# Ensure directories exist
DEFAULT_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_PRESETS_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_PROJECTS_DIR.mkdir(parents=True, exist_ok=True)


def load_json(file_path: Union[str, Path]) -> Dict[str, Any]:
    """
    Load a JSON file and return its contents as a dictionary.

    Args:
        file_path: The path to the JSON file to load.

    Returns:
        The contents of the JSON file as a dictionary.

    Raises:
        FileNotFoundError: If the file doesn't exist.
        json.JSONDecodeError: If the file is not valid JSON.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"File not found: {file_path}")
        raise
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON in {file_path}: {e}")
        raise


def save_json(data: Dict[str, Any], file_path: Union[str, Path]) -> None:
    """
    Save a dictionary as a JSON file.

    Args:
        data: The dictionary to save.
        file_path: The path to save the JSON file to.

    Raises:
        IOError: If the file couldn't be written.
    """
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        logging.error(f"Error saving JSON to {file_path}: {e}")
        raise


def list_files_with_extension(directory: Union[str, Path], extension: str) -> List[Path]:
    """
    List all files in a directory with a specific extension.

    Args:
        directory: The directory to search.
        extension: The file extension to match (e.g., '.wav', '.json')
        
    Returns:
        A list of Path objects for matching files.
    """
    directory = Path(directory)
    if not directory.exists():
        return []
    
    return [f for f in directory.iterdir() if f.is_file() and f.suffix.lower() == extension.lower()]


def get_project_file_path(project_name: str) -> Path:
    """
    Get the file path for a project file.
    
    Args:
        project_name: The name of the project.
        
    Returns:
        The path to the project file.
    """
    # Sanitize the project name for use as a filename
    safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in project_name)
    safe_name = safe_name.strip().replace(" ", "_")
    
    # Add extension if not already present
    if not safe_name.lower().endswith('.json'):
        safe_name += '.json'
    
    return DEFAULT_PROJECTS_DIR / safe_name


def get_preset_file_path(preset_name: str, preset_type: str) -> Path:
    """
    Get the file path for a preset file.
    
    Args:
        preset_name: The name of the preset.
        preset_type: The type of preset ('kit', 'sound', 'pattern')
        
    Returns:
        The path to the preset file.
    """
    # Sanitize the preset name
    safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in preset_name)
    safe_name = safe_name.strip().replace(" ", "_")
    
    # Create type-specific directory if it doesn't exist
    type_dir = DEFAULT_PRESETS_DIR / preset_type.lower()
    type_dir.mkdir(exist_ok=True)
    
    # Add extension if not already present
    if not safe_name.lower().endswith('.json'):
        safe_name += '.json'
    
    return type_dir / safe_name