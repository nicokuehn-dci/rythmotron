import sys
import os
import time
from pathlib import Path
from PySide6.QtWidgets import (
    QMainWindow, QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QSlider, QFileDialog, QTabWidget, 
    QGridLayout, QGroupBox, QDial, QSpinBox, QComboBox
)
from PySide6.QtCore import Qt, QTimer, Signal, Slot
from PySide6.QtGui import QColor, QPainter, QPen, QFont, QFontMetrics

from .models import Project, Kit, Sound, Sample, Pattern, Trig, Track
from .constants import Track, DEFAULT_BPM, TRACK_COLORS, GRID_SIZE, TRACK_HEIGHT
from .audio_engine import AudioEngine
from .style import Colors, StyleSheets
from .layout_manager import LayoutManager, VirtualPad, TrigButton


class MainWindow(QMainWindow):
    """Main window for the ARythm-EMU application."""
    
    def __init__(self):
        super().__init__()
        
        # Initialize audio engine
        self.audio_engine = AudioEngine()
        
        # Initialize project data
        self.project = Project(name="New Project")
        self.current_pattern = None
        self.current_kit = None
        self.current_track = Track.BD  # Default to Bass Drum track
        
        # Setup UI
        self.init_ui()
        
        # Initialize audio engine
        self.init_audio()
        
        # Create a timer for UI updates
        self.setup_timers()
        
        # Create test content
        self.create_test_pattern()
        
    def init_ui(self):
        """Initialize the user interface using the hardware-inspired layout."""
        self.setWindowTitle("ARythm-EMU")
        self.setMinimumSize(1200, 800)
        
        # Create central widget
        self.central_widget = QWidget()
        
        # Apply the layout manager to create the hardware-inspired UI
        self.layout_manager = LayoutManager(self.central_widget)
        
        # Connect UI signals
        self.connect_ui_signals()
        
        # Set central widget
        self.setCentralWidget(self.central_widget)
        
        # Set up status bar
        self.statusBar().showMessage("ARythm-EMU ready")
        
    def connect_ui_signals(self):
        """Connect UI signals to slots."""
        # Connect layout manager signals to our slots
        self.layout_manager.connect_signals(self)
        
        # Connect pad buttons to track selection
        for track, pad in self.layout_manager.pads.items():
            pad.clicked.connect(lambda checked, t=track: self.select_track(t))
        
        # Connect trig buttons to step toggle
        for i, trig in enumerate(self.layout_manager.trig_buttons):
            trig.clicked.connect(lambda checked, step=i: self.toggle_step(step))
        
    def init_audio(self):
        """Initialize the audio engine."""
        self.audio_engine.initialize()
        self.audio_engine.register_step_change_callback(self.on_step_change)
        
    def setup_timers(self):
        """Set up timers for UI updates."""
        # UI update timer (for sequencer display, parameter changes, etc)
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self.update_ui)
        self.update_timer.start(16)  # ~60 fps
        
        # Pad animation timer
        self.pad_animation_timer = QTimer(self)
        self.pad_animation_timer.timeout.connect(self.update_pad_animations)
        self.pad_animation_timer.start(50)  # 20 fps
    
    def create_test_pattern(self):
        """Create a test pattern for demonstration."""
        # Create a kit
        kit = Kit(name="Test Kit")
        
        # Create a pattern
        pattern = Pattern(name="Test Pattern", kit_id=kit.id, length=16)
        
        # Add some basic trigs
        for i in range(0, 16, 4):
            pattern.add_trig(Track.BD, Trig(step=i, velocity=100))
        
        for i in range(4, 16, 8):
            pattern.add_trig(Track.SD, Trig(step=i, velocity=90))
            
        for i in range(2, 16, 4):
            pattern.add_trig(Track.CH, Trig(step=i, velocity=80))
        
        # Add to project
        self.project.kits.append(kit)
        self.project.patterns.append(pattern)
        
        # Set as current
        self.current_pattern = pattern
        self.current_kit = kit
        
        # Update UI
        self.update_sequencer_display()
        self.select_track(Track.BD)  # Select Bass Drum track by default
    
    def select_track(self, track):
        """Select a track for editing."""
        # Update current track
        self.current_track = track
        
        # Update pads
        for t, pad in self.layout_manager.pads.items():
            pad.setSelected(t == track)
            
        # Update sequencer display
        self.update_sequencer_display()
        
        # Update status bar
        self.statusBar().showMessage(f"Selected track: {track.name}")
    
    def toggle_step(self, step):
        """Toggle a step in the current track."""
        if not self.current_pattern:
            return
            
        # Check if there's already a trig at this step
        trig = self.current_pattern.get_trig_at_step(self.current_track, step)
        
        if trig:
            # Remove existing trig
            if self.current_track in self.current_pattern.track_trigs:
                self.current_pattern.track_trigs[self.current_track] = [
                    t for t in self.current_pattern.track_trigs[self.current_track] 
                    if t.step != step
                ]
        else:
            # Add new trig
            self.current_pattern.add_trig(
                self.current_track, 
                Trig(step=step, velocity=100)
            )
            
        # Update sequencer display
        self.update_sequencer_display()
    
    def update_sequencer_display(self):
        """Update the sequencer UI to reflect the current pattern."""
        if not self.current_pattern:
            return
            
        # Update trig buttons
        for i, trig_button in enumerate(self.layout_manager.trig_buttons):
            # Check if this step has a trig for the current track
            has_trig = False
            has_param_lock = False
            
            if self.current_track in self.current_pattern.track_trigs:
                for trig in self.current_pattern.track_trigs[self.current_track]:
                    if trig.step == i:
                        has_trig = True
                        has_param_lock = bool(trig.parameter_locks)
                        break
            
            # Update button state
            trig_button.setHasTrig(has_trig)
            trig_button.setHasParamLock(has_param_lock)
            
    def update_pad_animations(self):
        """Update pad animations for visual feedback."""
        # Decrement trigger counters for any pads showing visual feedback
        for pad in self.layout_manager.pads.values():
            pad.decrementTrigger()
    
    def update_ui(self):
        """Update UI elements based on current state."""
        # Process any audio thread notifications
        self.audio_engine.on_ui_timer()
        
    def on_step_change(self, step):
        """Called when the sequencer advances to a new step."""
        # Mark the current step in the sequencer UI
        for i, trig_button in enumerate(self.layout_manager.trig_buttons):
            trig_button.setCurrentStep(i == step)
        
        # Check which pads should be triggered for visual feedback
        if self.current_pattern and self.current_kit:
            for track, trigs in self.current_pattern.track_trigs.items():
                for trig in trigs:
                    if trig.step == step and track in self.layout_manager.pads:
                        self.layout_manager.pads[track].triggerVisualFeedback()
    
    def play_pattern(self):
        """Start playback of the current pattern."""
        if not self.current_pattern or not self.current_kit:
            return
            
        self.audio_engine.play(self.current_pattern, self.project)
        self.statusBar().showMessage(f"Playing pattern: {self.current_pattern.name}")
    
    def stop_playback(self):
        """Stop pattern playback."""
        self.audio_engine.stop()
        
        # Reset sequencer UI
        for trig_button in self.layout_manager.trig_buttons:
            trig_button.setCurrentStep(False)
            
        self.statusBar().showMessage("Playback stopped")
    
    def closeEvent(self, event):
        """Handle window close event."""
        # Shutdown audio engine
        self.audio_engine.shutdown()
        event.accept()