# RythmoTron Utilities

This directory contains utility modules used throughout the RythmoTron application.

## Modules

### `audio_utils.py`

Audio processing utilities for working with samples including:
- Loading and normalizing audio samples
- Trimming silence from audio
- Detecting onsets in audio samples
- Estimating BPM from audio

### `file_utils.py`

File operation utilities for:
- Loading and saving JSON data
- Managing file paths for projects, presets, and samples
- Listing files with specific extensions

### `config.py`

Configuration management system that:
- Loads and saves application configuration
- Provides default settings
- Supports dot-notation access to configuration values
- Persists user settings across sessions

### `logging_setup.py`

Logging configuration that:
- Sets up structured logging with timestamps
- Manages log rotation
- Configures console and file log handlers
- Provides a consistent logging interface