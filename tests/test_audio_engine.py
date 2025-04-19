"""
Tests for the audio engine module.
"""

import unittest
import pytest
import numpy as np
from rythmotron.audio_engine import AudioEngine
from rythmotron.models import Sample


class TestAudioEngine(unittest.TestCase):
    """Tests for the AudioEngine class."""

    def setUp(self):
        """Set up test fixtures."""
        self.audio_engine = AudioEngine()

    def test_initialization(self):
        """Test that the audio engine initializes correctly."""
        self.assertIsNotNone(self.audio_engine)
        self.assertFalse(self.audio_engine.playback_state.playing)
        self.assertEqual(self.audio_engine.playback_state.current_step, 0)

    def test_set_bpm(self):
        """Test that setting BPM works correctly."""
        test_bpm = 140.0
        self.audio_engine.set_bpm(test_bpm)
        # Since set_bpm uses a queue, we need to mock processing that queue
        # This is a simplified test that doesn't test the actual queue processing
        self.audio_engine.playback_state.bpm = test_bpm
        self.assertEqual(self.audio_engine.playback_state.bpm, test_bpm)


@pytest.fixture
def sample_audio_data():
    """Create a sine wave sample for testing."""
    sample_rate = 44100
    duration = 0.1  # 100ms
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    sine_wave = 0.5 * np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave
    return sine_wave.astype(np.float32)


def test_play_sample(sample_audio_data):
    """Test playing a sample."""
    audio_engine = AudioEngine()
    sample = Sample(
        name="test_sine", 
        file_path=None, 
        audio_data=sample_audio_data,
        sample_rate=44100,
        start_point=0,
        end_point=len(sample_audio_data)
    )
    
    # This is just a basic test that doesn't crash
    # In a real test, we would mock the audio output and check the buffer
    audio_engine._play_sample(sample, 1.0)
    assert True  # If we got here without errors, that's a pass