"""
RythmoTron - Test Configuration

Configuration and fixtures for the RythmoTron test suite.
"""

import sys
import os
import pytest
from pathlib import Path

# Add the src directory to the path for proper module imports during tests
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'src'))

@pytest.fixture
def test_samples_dir():
    """Fixture that provides the path to the test samples directory."""
    return os.path.join(os.path.dirname(__file__), 'test_data', 'samples')

@pytest.fixture
def test_presets_dir():
    """Fixture that provides the path to the test presets directory."""
    return os.path.join(os.path.dirname(__file__), 'test_data', 'presets')

@pytest.fixture
def create_temp_project_dir(tmp_path):
    """Fixture that creates a temporary project directory for tests."""
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()
    return project_dir