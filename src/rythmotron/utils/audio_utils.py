"""
Audio Utilities for RythmoTron

This module provides utility functions for audio operations,
such as sample loading, processing, and analysis.
"""

import os
import logging
import numpy as np
from typing import Tuple, Optional
from pathlib import Path

try:
    import soundfile as sf
except ImportError:
    logging.warning("soundfile module not found. Sample loading will be unavailable.")

try:
    import librosa
except ImportError:
    logging.warning("librosa module not found. Some audio analysis features will be unavailable.")


def load_sample(file_path: str) -> Tuple[np.ndarray, int]:
    """
    Load an audio sample from a file.

    Args:
        file_path: The path to the audio file.

    Returns:
        A tuple containing:
        - The audio data as a numpy array
        - The sample rate as an integer

    Raises:
        FileNotFoundError: If the file doesn't exist.
        Exception: If the file can't be read as an audio file.
    """
    try:
        audio_data, sample_rate = sf.read(file_path, dtype=np.float32)
        # Convert stereo to mono if needed
        if len(audio_data.shape) > 1 and audio_data.shape[1] > 1:
            audio_data = np.mean(audio_data, axis=1)
        return audio_data, sample_rate
    except FileNotFoundError:
        logging.error(f"Sample file not found: {file_path}")
        raise
    except Exception as e:
        logging.error(f"Error loading audio file {file_path}: {e}")
        raise


def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
    """
    Normalize audio data to have a peak value of 1.0.

    Args:
        audio_data: The audio data as a numpy array.

    Returns:
        The normalized audio data.
    """
    if np.max(np.abs(audio_data)) > 0:
        return audio_data / np.max(np.abs(audio_data))
    return audio_data


def trim_silence(audio_data: np.ndarray, sample_rate: int, threshold_db: float = -60.0) -> np.ndarray:
    """
    Trim silence from the beginning and end of an audio sample.

    Args:
        audio_data: The audio data as a numpy array.
        sample_rate: The sample rate of the audio.
        threshold_db: The threshold in decibels below which to consider as silence.

    Returns:
        The trimmed audio data.
    """
    try:
        trimmed_audio, _ = librosa.effects.trim(audio_data, top_db=-threshold_db, frame_length=512, hop_length=128)
        return trimmed_audio
    except NameError:
        # librosa not available
        logging.warning("librosa not available, using basic trimming")
        # Simple trimming as a fallback
        abs_data = np.abs(audio_data)
        threshold = 10**(threshold_db / 20.0)
        mask = abs_data > threshold
        if np.any(mask):
            first = np.argmax(mask)
            last = len(audio_data) - np.argmax(mask[::-1])
            return audio_data[first:last]
        return audio_data


def detect_onsets(audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
    """
    Detect onsets (note starts) in an audio sample.

    Args:
        audio_data: The audio data as a numpy array.
        sample_rate: The sample rate of the audio.

    Returns:
        An array of onset times in samples.
    """
    try:
        onset_frames = librosa.onset.onset_detect(
            y=audio_data,
            sr=sample_rate,
            hop_length=512,
            backtrack=True
        )
        return librosa.frames_to_samples(onset_frames, hop_length=512)
    except NameError:
        # librosa not available
        logging.warning("librosa not available, onset detection unavailable")
        return np.array([0])  # Just return the beginning of the sample


def calculate_bpm(audio_data: np.ndarray, sample_rate: int) -> float:
    """
    Estimate the BPM (tempo) of an audio sample.

    Args:
        audio_data: The audio data as a numpy array.
        sample_rate: The sample rate of the audio.

    Returns:
        The estimated BPM as a float.
    """
    try:
        tempo, _ = librosa.beat.beat_track(y=audio_data, sr=sample_rate)
        return float(tempo)
    except NameError:
        # librosa not available
        logging.warning("librosa not available, BPM detection unavailable")
        return 120.0  # Default to 120 BPM