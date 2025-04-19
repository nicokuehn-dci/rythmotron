#!/usr/bin/env python3
"""
RythmoTron - Main Entry Point Script

This script serves as the main entry point for running the RythmoTron application.
"""

import sys
import os
from pathlib import Path

# Add src directory to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from rythmotron.main import main

if __name__ == "__main__":
    main()